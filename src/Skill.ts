import { Card, Deck, Attribute } from './Card'
import { CardMatcher } from './CardMatcher'

import characters from '../characters.json'

export enum SkillType {
    GUARD = 1,
    ASSIST,
    ATTACK,
    BOOST
}

/**
 * This class contains details about a skill
 */
export class Skill {
    type: SkillType
    // Percent of self increase, or boost with no choukaika
    percentageBase: number
    // Percentage when in choukaika state for special cases
    // When this value is not set, choukaika percentage is calculated based on general case
    percentageChoukaika: number
    // If true, skill is only active during boss phase
    boss: boolean
    // Condition for boost, or condition multiplier (optional) for other skill type
    condition: CardMatcher
    // When true, the percentage used is percentage + additionalPercentage
    choukaika: boolean

    constructor(type: SkillType, percentageBase?: number, boss: boolean = false, condition?: CardMatcher) {
        this.type = type
        this.percentageBase = percentageBase
        this.boss = boss
        this.condition = condition
    }

    /**
     * Calculate percentage based on choukaika status
     * @return percentageBase when choukaika is false. When true, returns percentageChoukaika if not null, or when null return general increased percentage
     */
    calculatePercentage() {
        if (!this.choukaika) {
            return this.percentageBase
        }

        if (this.percentageChoukaika) {
            return this.percentageChoukaika
        }

        // General choukaika percentage

        // Guard skills only improve guard, but not self increase
        if (this.type === SkillType.GUARD) {
            return this.percentageBase
        }
        // Fusion skill improve self increase per card by 1%
        if (this.type === SkillType.ATTACK && this.condition) {
            return this.percentageBase + 1
        }

        // General case
        return this.percentageBase + 2
    }

    /**
     * Calculate self increase for given boss condition and deck
     * @param boss If true, calculate increase during boss phase
     * @param deck Used for skill with condition
     * @return Percentage of self increase
     */
    calculateSelfIncreasePercent(boss: boolean, deck: Deck) {
        // Self increase is only valid when not a boost type
        if (this.type === SkillType.BOOST) {
            return 0
        }

        // Check boss condition for skill activation
        if (this.boss && !boss) {
            return 0
        }

        let selfIncreasePercent = 0

        const percentage = this.calculatePercentage()

        // Special process for skill with condition
        if (this.condition && deck) {
            for (let card of deck.cards) {
                if (this.condition.match(card)) {
                    selfIncreasePercent += percentage
                }
            }
        } else {
            selfIncreasePercent = percentage
        }

        return selfIncreasePercent
    }

    /**
     * Calculate boost increase for given boss condition and card
     * @param boss If true, calculate boost during boss phase
     * @param card Card for which we want boost percentage
     * @return Percentage of boost
     */
    calculateBoostPercent(boss: boolean, card: Card) {
        // Check skill is boost type
        if (this.type !== SkillType.BOOST) {
            return 0
        }

        // Check boss condition for skill activation
        if (this.boss && !boss) {
            return 0
        }

        // Check card match condition
        if (!this.condition.match(card)) {
            return 0
        }

        return this.calculatePercentage()
    }

    /**
     * Parse attack skill name and return extracted skill specs
     * @param skillName Skill name string
     * @return skill Specs (percentage, boss, condition)
     */
    private static parseAttackSkillName(skillName: string): SkillSpec {
        const regex = /^(?:ノーダメ|まんたん)?(ボス)?(?:(.+?)フュージョン|アタック) \+(\d+)(?:（危）)?$/
        const res = regex.exec(skillName)
        if (!res) {
            throw new Error("Could not parse skill name: " + skillName)
        }
        // Boss 
        const boss = !!res[1]

        // Condition multiplier
        let condition
        if (res[2]) {
            // Convert first name to full name
            const character = characters.find(e => e.firstName === res[2])

            if (!character) {
                throw new Error("Could not find character: " + res[2])
            }

            condition = new CardMatcher(null, null, [character.lastName + " " + character.firstName])
        }

        // Percentage
        const percentage = +res[3]

        return {
            boss,
            percentage,
            condition
        }
    }

    /**
     * Parse attack skill details and return extracted skill spec
     * @param skillDetails skill details string
     * @return skill specs (percentage, boss, condition)
     */
    private static parseAttackSkillDetails(skillDetails: string): SkillSpec  {
        const regex = /^(?:ダメージカウント0の時、|ライフ100％時、|(バトル後半で、))?(?:【(.*?)】のカード1枚につき、)?\n?自身の攻撃力?(\d+)％アップ(?:\n被弾時のダメージが\d+倍になる)?$/
        const res = regex.exec(skillDetails)
        if (!res) {
            throw new Error("Could not parse card skill details: " + skillDetails)
        }
        // Boss 
        const boss = !!res[1]

        // Condition multiplier
        const condition = res[2] ? new CardMatcher(null, null, [res[2]]) : undefined

        // Percentage
        const percentage = +res[3]

        return {
            boss,
            percentage,
            condition
        }
    }

    /**
     * Parse boost skill details string and return extracted skill spec
     * @param skillDetails skill details string
     * @return skill specs (percentage, boss, condition)
     */
    private static parseBoostSkillDetails(skillDetails: string): SkillSpec  {
        const regex = /^(?:ダメージカウント0の時、|ライフ100％時、|(バトル後半で、))?\n?(?:属性【(FIRE|LEAF|AQUA)】|【(.*?)】(?:と【(.*?)】)?)??(?:かつ)?(【ATTACK】)?(?:全員)?の攻撃力?(\d+)％アップ(?:\n被弾時のダメージが\d+倍になる)?$/
        const res = regex.exec(skillDetails)
        if (!res) {
            throw new Error("Could not parse card skill: " + skillDetails)
        }
        // Boss 
        const boss = !!res[1]

        // Attribute condition
        let attribute = null
        if (res[2]) {
            attribute = Attribute[res[2]]
        }
        // Character condition
        let characters = null
        if (res[3]) {
            characters = [res[3]]
            if (res[4]) {
                characters.push(res[4])
            }
        }
        // Skill type condition
        let skillType = null
        if (res[5]) {
            skillType = SkillType.ATTACK
        }

        const condition = new CardMatcher(skillType, attribute, characters)

        // Percentage
        const percentage = +res[6]

        return {
            boss,
            percentage,
            condition
        }
    }


    /**
     * Create instance from json data
     * Percentage, boss and condition will be deduced from skill details text.
     * @param data Skill data from json
     * @return An array containing one or two new instance of Skill
     */
    static fromJson(data: SkillJson) {
        // Convert string to enum
        let type = SkillType[data.type]
        if (!type) {
            throw new Error("Invalid type: " + data.type)
        }

        let mainSkillSpec: SkillSpec
        let secondarySkillSpec: SkillSpec

        switch (type) {
            case SkillType.GUARD:
            case SkillType.ASSIST: {
                const res = /自身の攻撃力(\d+)％アップ/.exec(data.details)
                if (!res) {
                    throw new Error("Could not parse card skill: " + data.details)
                }
                mainSkillSpec = {
                    percentage: +res[1],
                    boss: false,
                    condition: undefined
                }
                break
            }
            case SkillType.ATTACK: {
                const res = /^(.+?)(?:（(.+)）)?$/.exec(data.name)
                if (!res) {
                    throw new Error("Could not parse card skill name: " + data.name)
                }
                mainSkillSpec = Skill.parseAttackSkillName(res[1])
                if (res[2] && res[2] != "危" ) {
                    secondarySkillSpec = Skill.parseAttackSkillName(res[2])
                }
                break
            }
            case SkillType.BOOST: {
                mainSkillSpec = Skill.parseBoostSkillDetails(data.details)
            }
        }
        const mainSkill = new this(type, mainSkillSpec.percentage, mainSkillSpec.boss, mainSkillSpec.condition)

        if (secondarySkillSpec) {
            const secondarySkill = new this(type, secondarySkillSpec.percentage, secondarySkillSpec.boss, secondarySkillSpec.condition)
            return [mainSkill, secondarySkill]
        } else {
            return [mainSkill]

        }
    }
}


export interface SkillJson {
    type: string
    name: string
    details: string
}

interface SkillSpec {
    percentage: number
    boss: boolean
    condition: CardMatcher
}
