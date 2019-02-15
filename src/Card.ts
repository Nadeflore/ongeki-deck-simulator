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
    rarity: Rarity
    event: boolean
    level: number
    attribute: Attribute
    skill: Skill
    characterName: string
    deck: Deck

    constructor(rarity?: Rarity, level?: number, event: boolean = false) {
        this.rarity = rarity
        this.level = level
        this.event = event
    }

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
