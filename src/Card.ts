import { Skill, SkillType, SkillJson } from './Skill'

export enum Rarity {
    N = 1,
    R,
    SR,
    SSR
}

export enum Attribute {
    FIRE = 3,
    LEAF = 2,
    AQUA = 1

}

export class Card {
    // Card rarity: N R SR or SSR
    rarity: Rarity
    // True if this is an event or promotion card
    event: boolean
    // FIRE, AQUA or LEAF
    attribute: Attribute
    // Card skills
    skill: Skill
    additionalSkill: Skill
    // Character full name
    characterName: string

    // Card level, minimum 1, maximum 100 for N card, 70 for others
    level: number
    // Contains reference to all cards in deck (including this one)
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
     * @param boss If true, calculate increase during boss phase
     * @return Self increase in percent
     */
    calculateSelfIncreasePercent(boss: boolean): number {
        let result = this.skill.calculateSelfIncreasePercent(boss, this.deck)

        if (this.additionalSkill) {
            result += this.additionalSkill.calculateSelfIncreasePercent(boss, this.deck)
        }
        return result
    }

    /**
     * Calculate boost values for each card in deck
     * @param boss If true, calculate boost during boss phase
     * @return Array with boost percent value for each card
     */
    calculateBoostPercents(boss: boolean): number[] {
        return this.deck.cards.map(card => {
            // Check for each card in deck if its boosting this card
            return card.skill.calculateBoostPercent(boss, this)
        })
    }

    /**
     * Calculate attack while considering own skill and boost skills from other cards
     * @param boss If true, calculate attack during boss phase
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

    /**
     * Compare this card attribute to the given attribute
     * @param attribute Attribute to compare to
     * @return Result of comparison:
     *         -  1 if this card attribute is effective against given attribute 
     *         -  0 if this card attribute is same as given attribute 
     *         - -1 if this card attribute is not very effective again given attribute
     */
    compareAttribute(attribute: Attribute): number {
        let result = this.attribute - attribute
        if (result === 2) {
            result = -1
        } else if (result === -2) {
            result = 1
        }
        return result
    }

    /**
     * Calculate attack of this card against an enemy of given attribute
     * @param boss If true, calculate attack during boss phase
     * @param attribute Attribute of the enemy
     * @return Attack agains this ennemy
     */
    calculateAttackAgainstEnemy(boss: boolean, attribute: Attribute) {
        return Math.round(this.calculateAttackWithSkills(boss) * (1 + this.compareAttribute(attribute) / 10))
    }

    /**
     * Create instance from json data
     * @param data Card data from json
     * @return A new instance of Card
     */
    static fromJson(data: CardJson) {
        const card = new this()
        card.rarity = Rarity[data.rarity]
        if (!card.rarity) {
            throw new Error("Invalid rarity: " + data.rarity)
        }
        card.attribute = Attribute[data.attribute]
        if (!card.attribute) {
            throw new Error("Invalid attribute: " + data.attribute)
        }
        card.characterName = data.characterName
        // Detect event from card number
        const cardNumberRes = /^1\.\d\d-(?:([EP])-)?\d{4}$/.exec(data.cardNumber)
        if (!cardNumberRes) {
            throw new Error("Invalid card number: " + data.cardNumber)
        }
        card.event = !!cardNumberRes[1]

        // Skills
        const skills = Skill.fromJson(data.skill)
        card.skill =  skills[0]
        if (skills.length > 1) {
            card.additionalSkill = skills[1]
        }
        // Special case for N cards
        if (card.rarity === Rarity.N) {
            card.skill.percentageChoukaika = 25
        }

        return card
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

export interface CardJson {
    characterName: string
    rarity: string
    attribute: string
    cardNumber: string
    skill: SkillJson
}
