import { Card, Attribute, Deck } from './Card'
import { CardMatcher } from './CardMatcher'

import { convertLastNameToFullName } from './charactersUtils'

export enum SkillType {
    GUARD = 1,
    ASSIST,
    ATTACK,
    BOOST,
}

/**
 * This class contains details about a skill
 */
export class Skill {


    /**
     * Create instance from json data
     * Percentage, boss and condition will be deduced from skill details text.
     * @param data Skill data from json
     * @return An array containing one or two new instance of Skill
     */
    public static fromJson(data: SkillJson) {
        // Convert string to enum
        const type = SkillType[data.type]
        if (!type) {
            throw new Error('Invalid type: ' + data.type)
        }

        let mainSkill: Skill
        let secondarySkill: Skill

        switch (type) {
            case SkillType.GUARD:
            case SkillType.ASSIST: {
                const res = /自身の攻撃力(\d+)％アップ/.exec(data.details)
                if (!res) {
                    throw new Error('Could not parse card skill: ' + data.details)
                }
                mainSkill = new Skill(type, +res[1], false)
                break
            }
            case SkillType.ATTACK: {
                const res = /^(.+?)(?:（(.+)）)?$/.exec(data.name)
                if (!res) {
                    // Should never fail, since this regex accepts nearly anything
                    throw new Error('Could not parse card skill name: ' + data.name)
                }
                mainSkill = Skill.parseAttackSkillName(res[1])
                if (res[2] && res[2] !== '危' ) {
                    secondarySkill = Skill.parseAttackSkillName(res[2])
                }
                break
            }
            case SkillType.BOOST: {
                const res = /^([\s\S]+?)(\n自身の攻撃力\d+％アップ)?$/.exec(data.details)
                if (!res) {
                    // Should never fail, since this regex accepts nearly anything
                    throw new Error('Could not parse card skill details: ' + data.details)
                }
                mainSkill = Skill.parseBoostSkillDetails(res[1])
                if (res[2]) {
                    secondarySkill = Skill.parseAttackSkillDetails(res[2])
                }
            }
        }

        if (secondarySkill) {
            return [mainSkill, secondarySkill]
        } else {
            return [mainSkill]

        }
    }

    /**
     * Parse attack skill name and return extracted skill
     * @param skillName Skill name string
     * @return Skill
     */
    private static parseAttackSkillName(skillName: string): Skill {
        const regex = /^(?:ノーダメ|まんたん|ローミス)?(ボス)?(?:(.+?)(?:＆(.+?))?フュージョン|アタック) \+(\d+)(?:（危）)?$/
        const res = regex.exec(skillName)
        if (!res) {
            throw new Error('Could not parse skill name: ' + skillName)
        }
        // Boss
        const boss = !!res[1]

        // Character condition multiplier
        let condition
        if (res[2]) {
            const firstCharacterName = convertLastNameToFullName(res[2])
            const characters = [firstCharacterName]
            if (res[3]) {
                const secondCharacterName = convertLastNameToFullName(res[3])
                characters.push(secondCharacterName)
            }

            condition = new CardMatcher(null, null, characters)
        }

        // Percentage
        const percentage = +res[4]

        return new Skill(SkillType.ATTACK, percentage, boss, condition)
    }

    /**
     * Parse boost skill name and return extracted skill
     * DOES NOT WORK, can't detect ATTACK Conditon, and special characters names
     * @param skillName Skill name string
     * @return Skill
     */
    private static parseBoostSkillName(skillName: string): Skill {
        const regex = /^(?:ノーダメ|まんたん|ローミス)?(ボス)?(ファイア|リーフ|アクア)?(?:(.+?)(?:＆(.+?))?)?ブースト \+(\d+)(?:（危）)?$/
        const res = regex.exec(skillName)
        if (!res) {
            throw new Error('Could not parse skill name: ' + skillName)
        }
        // Boss
        const boss = !!res[1]

        // Attribute condition
        let attribute = null
        if (res[2]) {
            if (res[2] === 'ファイア') {
                attribute = Attribute.FIRE
            } else if (res[2] === 'リーフ') {
                attribute = Attribute.LEAF
            } else if (res[2] === 'アクア') {
                attribute = Attribute.AQUA
            }
        }

        // Character condition
        let characters = null
        if (res[3]) {
            characters = [convertLastNameToFullName(res[3])]
            if (res[4]) {
                characters.push(convertLastNameToFullName(res[4]))
            }
        }
        // Skill type condition
        let skillType = null
        // Assume there is no 'ATTACK' condition when there is two characters or one character condition with boss (Not always true)
        if (!(res[3] && (res[4] || boss))) {
            skillType = SkillType.ATTACK
        }

        const condition = new CardMatcher(skillType, attribute, characters)

        // Percentage
        const percentage = +res[5]

        return new Skill(SkillType.BOOST, percentage, boss, condition)
    }

    /**
     * Parse attack skill details and return extracted skill
     * @param skillDetails skill details string
     * @return Skill
     */
    private static parseAttackSkillDetails(skillDetails: string): Skill {
        // tslint:disable-next-line:max-line-length
        const regex = /^(?:ダメージカウント0の時、|ライフ100％時、|MISS数10以下の時、|(バトル後半で、))?(?:【(.*?)】のカード1枚につき、)?\n?自身の攻撃力?(\d+)％アップ(?:\n被弾時のダメージが\d+倍になる)?$/
        const res = regex.exec(skillDetails)
        if (!res) {
            throw new Error('Could not parse card skill details: ' + skillDetails)
        }
        // Boss
        const boss = !!res[1]

        // Condition multiplier
        const condition = res[2] ? new CardMatcher(null, null, [res[2]]) : undefined

        // Percentage
        const percentage = +res[3]

        return new Skill(SkillType.ATTACK, percentage, boss, condition)
    }

    /**
     * Parse boost skill details string and return extracted skill
     * @param skillDetails skill details string
     * @return Skill
     */
    private static parseBoostSkillDetails(skillDetails: string): Skill {
        // tslint:disable-next-line:max-line-length
        const regex = /^(?:ダメージカウント0の時、|ライフ100％時、|(バトル後半で、))?\n?(?:属性【(FIRE|LEAF|AQUA)】|【(.*?)】(?:と【(.*?)】)?)??(?:かつ)?(【ATTACK】)?(?:全員)?の攻撃力?(\d+)％アップ(?:\n被弾時のダメージが\d+倍になる)?$/
        const res = regex.exec(skillDetails)
        if (!res) {
            throw new Error('Could not parse card skill: ' + skillDetails)
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

        return new Skill(SkillType.BOOST, percentage, boss, condition)
    }

    public type: SkillType
    // Percent of self increase, or boost with no choukaika
    public percentageBase: number
    // Percentage when in choukaika state for special cases
    // When this value is not set, choukaika percentage is calculated based on general case
    public percentageChoukaika: number
    // If true, skill is only active during boss phase
    public boss: boolean
    // Condition for boost, or condition multiplier (optional) for other skill type
    public condition: CardMatcher
    // When true, the percentage used is percentage + additionalPercentage
    public choukaika: boolean

    constructor(type: SkillType, percentageBase?: number, boss: boolean = false, condition?: CardMatcher) {
        this.type = type
        this.percentageBase = percentageBase
        this.boss = boss
        this.condition = condition
    }

    /**
     * Calculate percentage based on choukaika status
     * @return percentageBase when choukaika is false.
     *         When true, returns percentageChoukaika if not null, or when null return general increased percentage
     */
    public calculatePercentage() {
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
    public calculateSelfIncreasePercent(boss: boolean, deck: Deck) {
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
            for (const card of deck.cards) {
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
    public calculateBoostPercent(boss: boolean, card: Card) {
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
}


export interface SkillJson {
    type: string
    name: string
    details: string
}
