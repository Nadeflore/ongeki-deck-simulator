import { Card, Deck } from './Card'
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

    constructor(type: SkillType, percentage?: number, boss: boolean = false) {
        this.type = type
        this.percentage = percentage
        this.boss = boss
    }

    /**
     * Calculate self increase for given boss condition and deck
     * @param boss True during boss phase
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
     * @param boss True during boss phase
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
}

