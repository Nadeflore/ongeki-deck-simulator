import { Card, Deck, Attribute } from './Card'
import { CardMatcher } from './CardMatcher'

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
    // Percent of self increase, or boost
    percentage: number
    // If true, skill is only active during boss phase
    boss: boolean
    // Condition for boost, or condition multiplier (optional) for other skill type
    condition: CardMatcher

    constructor(type: SkillType, percentage?: number, boss: boolean = false, condition?: CardMatcher) {
        this.type = type
        this.percentage = percentage
        this.boss = boss
        this.condition = condition
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

        // Special process for skill with condition
        if (this.condition && deck) {
            for (let card of deck.cards) {
                if (this.condition.match(card)) {
                    selfIncreasePercent += this.percentage
                }
            }
        } else {
            selfIncreasePercent = this.percentage
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

        return this.percentage
    }

    /**
     * Create instance from json data
     * Percentage, boss and condition will be deduced from skill details text.
     * @param data Skill data from json
     * @return A new instance of Skill
     */
    static fromJson(data: SkillJson) {
        // Convert string to enum
        let type = SkillType[data.type]
        let percentage: number
        let boss: boolean
        let condition: CardMatcher

        switch (type) {
            case SkillType.GUARD:
            case SkillType.ASSIST: {
                const res = /自身の攻撃力(\d+)％アップ/.exec(data.details)
                if (!res) {
                    throw new Error("Could not parse card skill")
                }
                percentage = +res[1]
                break
            }
            case SkillType.ATTACK: {
                const regex = /^(?:ダメージカウント0の時、|ライフ100％時、|(バトル後半で、))?(?:【(.*?)】のカード1枚につき、)?\n?自身の攻撃力?(\d+)％アップ(?:\n被弾時のダメージが\d+倍になる)?$/
                const res = regex.exec(data.details)
                if (!res) {
                    throw new Error("Could not parse card skill")
                }
                // Boss 
                boss = !!res[1]

                // Condition multiplier
                if (res[2]) {
                    condition = new CardMatcher(null, null, [res[2]])
                }
                // Percentage
                percentage = +res[3]            
                break
            }
            case SkillType.BOOST: {
                const regex = /^(?:ダメージカウント0の時、|ライフ100％時、|(バトル後半で、))?\n?(?:属性【(.*?)】|【(.*?)】(?:と【(.*?)】)?)??(?:かつ)?(【ATTACK】)?の攻撃力?(\d+)％アップ(?:\n被弾時のダメージが\d+倍になる)?$/
                const res = regex.exec(data.details)
                if (!res) {
                    throw new Error("Could not parse card skill")
                }
                // Boss 
                boss = !!res[1]

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

                condition = new CardMatcher(skillType, attribute, characters)

                // Percentage
                percentage = +res[6]

            }

        }

        return new this(type, percentage, boss, condition)
    }

}


export interface SkillJson {
    type: string
    name: string
    details: string
}
