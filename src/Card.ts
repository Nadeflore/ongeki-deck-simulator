import { Skill } from './Skill'

export enum Rarity {
    N = 1,
    R,
    SR,
    SSR
}

export enum Attribute {
    FIRE = 1,
    LEAF,
    AQUA

}

export class Card {
    // Card rarity: N R SR or SSR
    rarity: Rarity
    // True if this is an event card
    event: boolean
    // Card level, minimum 1, maximum 100 for N card, 70 for others
    level: number
    // FIRE, AQUA or LEAF
    attribute: Attribute
    // Card Skill
    skill: Skill
    characterName: string
    deck: Deck

    constructor(rarity?: Rarity, level?: number, event: boolean = false) {
        this.rarity = rarity
        this.level = level
        this.event = event
    }

    /**
     * Calculate base attack of the card, whithout considering the skills
     * @return base attack
     */
    calculateBaseAttack(): number {
        let attack

        switch (this.rarity) {
            case Rarity.N:
            case Rarity.R:
                attack = 50 + (this.level - 1) * 3
                break

            case Rarity.SR:
                if (this.level < 50) {
                    attack = Math.floor(55 + (this.level - 1) * 3.5)
                } else {
                    attack = 227 + (this.level - 50) * 3
                }
                break

            case Rarity.SSR:
                if (this.level < 50) {
                    attack = 60 + (this.level - 1) * 4
                } else if (this.level < 55) {
                    attack = Math.floor(257 + (this.level - 50) * 4.6)
                } else if (this.level < 60) {
                    attack = 280 + (this.level - 55) * 3
                } else if (this.level < 65) {
                    attack = Math.floor(295 + (this.level - 60) * 2.4)
                } else {
                    attack = 307 + (this.level - 65) * 2
                }
                break
        }

        if (this.event && this.rarity !== Rarity.R) {
            attack -= 5
        }
        return attack
    }

    /**
     * Calculate percent of self increase from own skill
     * @param boss True during boss phase
     * @return Self increase in percent
     */
    calculateSelfIncreasePercent(boss: boolean): number {
        return this.skill.calculateSelfIncreasePercent(boss, this.deck)
    }

    /**
     * Calculate boost values for each card in deck
     * @param boss True during boss phase
     * @return array with boost percent value for each card
     */
    calculateBoostPercents(boss: boolean): number[] {
        return this.deck.cards.map(card => {
            // Check for each card in deck if its boosting this card
            return card.skill.calculateBoostPercent(boss, this)
        })
    }

    /**
     * Calculate attack while considering own skill and boost skills from other cards
     * @param boss True during boss phase
     * @return attack
     */
    calculateAttackWithSkills(boss: boolean): number {
        const baseAttack = this.calculateBaseAttack()
        let attack = baseAttack
        // Add self increase
        attack += baseAttack * this.calculateSelfIncreasePercent(boss) / 100
        // Add boosts
        for (let boostPercent of this.calculateBoostPercents(boss)) {
            attack += baseAttack * boostPercent / 100
        }

        return Math.ceil(attack)
    }
}

export class Deck {
    cards: Card[]

    constructor(card1: Card, card2: Card, card3: Card) {
        card1.deck = this
        card2.deck = this
        card3.deck = this
        this.cards = [card1, card2, card3]
    }
}
