import { Card, Deck, Rarity, Attribute } from './Card'
import { Skill, SkillType } from './Skill'
import { CardMatcher } from './CardMatcher'

import { expect } from 'chai'
import 'mocha'

import cards from '../cards.json'

describe('Card', () => {
    describe('calculateBaseAttack()', () => {
        it('should return known attack for N card', () => {
            expect(new Card(Rarity.N, 1).calculateBaseAttack()).to.equal(50)
            expect(new Card(Rarity.N, 10).calculateBaseAttack()).to.equal(77)
            expect(new Card(Rarity.N, 50).calculateBaseAttack()).to.equal(197)
            expect(new Card(Rarity.N, 55).calculateBaseAttack()).to.equal(212)
            expect(new Card(Rarity.N, 60).calculateBaseAttack()).to.equal(227)
            expect(new Card(Rarity.N, 65).calculateBaseAttack()).to.equal(242)
            expect(new Card(Rarity.N, 70).calculateBaseAttack()).to.equal(257)
            expect(new Card(Rarity.N, 75).calculateBaseAttack()).to.equal(272)
            expect(new Card(Rarity.N, 80).calculateBaseAttack()).to.equal(287)
            expect(new Card(Rarity.N, 85).calculateBaseAttack()).to.equal(302)
            expect(new Card(Rarity.N, 90).calculateBaseAttack()).to.equal(317)
            expect(new Card(Rarity.N, 95).calculateBaseAttack()).to.equal(332)
            expect(new Card(Rarity.N, 100).calculateBaseAttack()).to.equal(347)
        })
        it('should return known attack for R card', () => {
            expect(new Card(Rarity.R, 1).calculateBaseAttack()).to.equal(50)
            expect(new Card(Rarity.R, 10).calculateBaseAttack()).to.equal(77)
            expect(new Card(Rarity.R, 50).calculateBaseAttack()).to.equal(197)
            expect(new Card(Rarity.R, 55).calculateBaseAttack()).to.equal(212)
            expect(new Card(Rarity.R, 60).calculateBaseAttack()).to.equal(227)
            expect(new Card(Rarity.R, 65).calculateBaseAttack()).to.equal(242)
            expect(new Card(Rarity.R, 70).calculateBaseAttack()).to.equal(257)
        })
        it('should return known attack for SR card', () => {
            expect(new Card(Rarity.SR, 1).calculateBaseAttack()).to.equal(55)
            expect(new Card(Rarity.SR, 3).calculateBaseAttack()).to.equal(62)
            expect(new Card(Rarity.SR, 10).calculateBaseAttack()).to.equal(86)
            expect(new Card(Rarity.SR, 21).calculateBaseAttack()).to.equal(125)
            expect(new Card(Rarity.SR, 32).calculateBaseAttack()).to.equal(163)
            expect(new Card(Rarity.SR, 37).calculateBaseAttack()).to.equal(181)
            expect(new Card(Rarity.SR, 50).calculateBaseAttack()).to.equal(227)
            expect(new Card(Rarity.SR, 55).calculateBaseAttack()).to.equal(242)
            expect(new Card(Rarity.SR, 60).calculateBaseAttack()).to.equal(257)
            expect(new Card(Rarity.SR, 65).calculateBaseAttack()).to.equal(272)
            expect(new Card(Rarity.SR, 70).calculateBaseAttack()).to.equal(287)
        })
        it('should return known attack for SSR card', () => {
            expect(new Card(Rarity.SSR, 1).calculateBaseAttack()).to.equal(60)
            expect(new Card(Rarity.SSR, 10).calculateBaseAttack()).to.equal(96)
            expect(new Card(Rarity.SSR, 50).calculateBaseAttack()).to.equal(257)
            expect(new Card(Rarity.SSR, 52).calculateBaseAttack()).to.equal(266)
            expect(new Card(Rarity.SSR, 54).calculateBaseAttack()).to.equal(275)
            expect(new Card(Rarity.SSR, 55).calculateBaseAttack()).to.equal(280)
            expect(new Card(Rarity.SSR, 60).calculateBaseAttack()).to.equal(295)
            expect(new Card(Rarity.SSR, 65).calculateBaseAttack()).to.equal(307)
            expect(new Card(Rarity.SSR, 70).calculateBaseAttack()).to.equal(317)
        })
        it('should return known attack for event card', () => {
            expect(new Card(Rarity.R, 2, true).calculateBaseAttack()).to.equal(53)
            expect(new Card(Rarity.R, 9, true).calculateBaseAttack()).to.equal(74)
            expect(new Card(Rarity.SR, 3, true).calculateBaseAttack()).to.equal(57)
            expect(new Card(Rarity.SR, 32, true).calculateBaseAttack()).to.equal(158)
            expect(new Card(Rarity.SSR, 23, true).calculateBaseAttack()).to.equal(143)
        })
    })
    describe('calculateSelfIncreasePercent()', () => {
        it('should return SelfIncrease percent according to choukaika status', () => {
            const card = new Card(Rarity.SSR, 70, true)
            card.attribute = Attribute.AQUA
            card.skill = new Skill(SkillType.ATTACK, 17, false)

            // Not choukaika state
            expect(card.calculateSelfIncreasePercent(false)).to.equal(17)

            // Choukaika state
            card.skill.choukaika = true
            expect(card.calculateSelfIncreasePercent(false)).to.equal(19)
        })
        it('should return SelfIncrease percent accounting for both mains and additional skill', () => {
            const card = new Card(Rarity.SSR, 70, true)
            card.attribute = Attribute.AQUA
            card.skill = new Skill(SkillType.ATTACK, 12, false)
            card.additionalSkill = new Skill(SkillType.ATTACK, 3, true)

            // Not boss, should be 12 only
            expect(card.calculateSelfIncreasePercent(false)).to.equal(12)
            // Boss, should be 12 + 3
            expect(card.calculateSelfIncreasePercent(true)).to.equal(15)
        })
    })
    describe('calculateBoostPercents()', () => {
        it('should return boost percent for each card in deck', () => {
            const card1 = new Card(Rarity.SSR, 50, true)
            card1.attribute = Attribute.AQUA
            card1.skill = new Skill(SkillType.ATTACK, 17, true)

            const card2 = new Card(Rarity.SSR, 50, true)
            card2.attribute = Attribute.AQUA
            card2.skill = new Skill(SkillType.BOOST, 15)
            card2.skill.condition = new CardMatcher(SkillType.ATTACK, null, null)

            const card3 = new Card(Rarity.SR, 50, true)
            card3.attribute = Attribute.AQUA
            card3.skill = new Skill(SkillType.BOOST, 16, true)
            card3.skill.condition = new CardMatcher(SkillType.ATTACK, Attribute.AQUA, null)

            const deck = new Deck(card1, card2, card3)

            // Not during boss phase
            const boostPercents = card1.calculateBoostPercents(false)
            // 3 cards in deck, 3 boost values
            expect(boostPercents).to.have.lengthOf(3)
            // Not boosted by self
            expect(boostPercents[0]).to.equal(0)
            // Boosted by card2
            expect(boostPercents[1]).to.equal(15)
            // Not boosted by card3 because not during boss phase
            expect(boostPercents[2]).to.equal(0)

            // During boss phase
            const boostPercentsBoss = card1.calculateBoostPercents(true)
            // 3 cards in deck, 3 boost values
            expect(boostPercentsBoss).to.have.lengthOf(3)
            // Not boosted by self
            expect(boostPercentsBoss[0]).to.equal(0)
            // Boosted by card2
            expect(boostPercentsBoss[1]).to.equal(15)
            // Boosted by card3
            expect(boostPercentsBoss[2]).to.equal(16)
        })
        it('should return higher skill values when card is in choukaika state', () => {
            const card1 = new Card(Rarity.SSR, 70, true)
            card1.attribute = Attribute.AQUA
            card1.skill = new Skill(SkillType.ATTACK, 17, true)

            const card2 = new Card(Rarity.SSR, 70, true)
            card2.attribute = Attribute.AQUA
            card2.skill = new Skill(SkillType.BOOST, 15)
            card2.skill.condition = new CardMatcher(SkillType.ATTACK, null, null)

            const card3 = new Card(Rarity.SR, 70, true)
            card3.attribute = Attribute.AQUA
            card3.skill = new Skill(SkillType.BOOST, 16, true)
            card3.skill.condition = new CardMatcher(SkillType.ATTACK, Attribute.AQUA, null)

            const deck = new Deck(card1, card2, card3)

            // Not in choukaika state
            const boostPercents = card1.calculateBoostPercents(true)
            // Boosted by card2 by 15%
            expect(boostPercents[1]).to.equal(15)
            // Boosted by card3 by 16%
            expect(boostPercents[2]).to.equal(16)

            // Second and third card in choukaika state
            card2.skill.choukaika = true
            card3.skill.choukaika = true
            const boostPercentsChoukaika = card1.calculateBoostPercents(true)
            // Boosted by card2 by 17%
            expect(boostPercentsChoukaika[1]).to.equal(17)
            // Boosted by card3 by 18%
            expect(boostPercentsChoukaika[2]).to.equal(18)
        })
    })
    describe('calculateAttackWithSkills()', () => {
        it('should return known attack for a givent deck', () => {
            const card1 = new Card(Rarity.SSR, 28, true)
            card1.attribute = Attribute.AQUA
            card1.skill = new Skill(SkillType.ATTACK, 17, true)
            card1.characterName = '日向 美海'

            const card2 = new Card(Rarity.SSR, 4, true)
            card2.attribute = Attribute.AQUA
            card2.skill = new Skill(SkillType.BOOST, 15)
            card2.skill.condition = new CardMatcher(SkillType.ATTACK, null, ['日向 美海'])
            card2.characterName = '日向 美海'

            const card3 = new Card(Rarity.SR, 37, true)
            card3.attribute = Attribute.AQUA
            card3.skill = new Skill(SkillType.BOOST, 15, true)
            card3.skill.condition = new CardMatcher(SkillType.ATTACK, Attribute.AQUA, null)
            card3.characterName = '東条 遥'

            const deck = new Deck(card1, card2, card3)

            // Not during boss phase
            expect(card1.calculateAttackWithSkills(false)).to.equal(188)
            // During boss phase
            expect(card1.calculateAttackWithSkills(true)).to.equal(240)
        })
    })
    describe('compareAttribute()', () => {
        it('should return 0 when same attribute is given', () => {
            const card = new Card()
            card.attribute = Attribute.FIRE
            expect(card.compareAttribute(Attribute.FIRE)).to.equal(0)
            card.attribute = Attribute.AQUA
            expect(card.compareAttribute(Attribute.AQUA)).to.equal(0)
            card.attribute = Attribute.LEAF
            expect(card.compareAttribute(Attribute.LEAF)).to.equal(0)
        })
        it('should return 1 when card attribute is effective', () => {
            const card = new Card()
            card.attribute = Attribute.FIRE
            expect(card.compareAttribute(Attribute.LEAF)).to.equal(1)
            card.attribute = Attribute.AQUA
            expect(card.compareAttribute(Attribute.FIRE)).to.equal(1)
            card.attribute = Attribute.LEAF
            expect(card.compareAttribute(Attribute.AQUA)).to.equal(1)
        })
        it('should return -1 when card attribute is not effective', () => {
            const card = new Card()
            card.attribute = Attribute.FIRE
            expect(card.compareAttribute(Attribute.AQUA)).to.equal(-1)
            card.attribute = Attribute.AQUA
            expect(card.compareAttribute(Attribute.LEAF)).to.equal(-1)
            card.attribute = Attribute.LEAF
            expect(card.compareAttribute(Attribute.FIRE)).to.equal(-1)
        })
    })
    describe('calculateAttackAgainstEnemy()', () => {
        // Using this video as reference: https://www.youtube.com/watch?v=4p_EGhuDi6A
        it('should return known attack for a given deck', () => {
            const card1 = new Card(Rarity.SSR, 43)
            card1.attribute = Attribute.FIRE
            card1.skill = new Skill(SkillType.ATTACK, 7, true)
            card1.skill.condition = new CardMatcher(null, null, ['結城 莉玖'])
            card1.characterName = '結城 莉玖'

            const card2 = new Card(Rarity.SSR, 43)
            card2.attribute = Attribute.AQUA
            card2.skill = new Skill(SkillType.ATTACK, 20, true)
            card2.characterName = '三角 葵'

            const card3 = new Card(Rarity.SR, 40)
            card3.attribute = Attribute.LEAF
            card3.skill = new Skill(SkillType.ATTACK, 15, true)
            card3.characterName = '藍原 椿'

            const deck = new Deck(card1, card2, card3)

            const enemyAttribute = Attribute.FIRE

            // Not during boss phase
            expect(card1.calculateAttackAgainstEnemy(false, enemyAttribute)).to.equal(228)
            expect(card2.calculateAttackAgainstEnemy(false, enemyAttribute)).to.equal(251)
            expect(card3.calculateAttackAgainstEnemy(false, enemyAttribute)).to.equal(172)
            // During boss phase
            expect(card1.calculateAttackAgainstEnemy(true, enemyAttribute)).to.equal(244)
            expect(card2.calculateAttackAgainstEnemy(true, enemyAttribute)).to.equal(301)
            expect(card3.calculateAttackAgainstEnemy(true, enemyAttribute)).to.equal(198)
        })
    })
    describe('fromJson()', () => {
        it('should return new instance based on card data', () => {
            const card = Card.fromJson(
                {
                    rarity: 'R',
                    attribute: 'FIRE',
                    characterName: '星咲 あかり',
                    cardNumber: '1.00-0001',
                    skill: {
                        type: 'ATTACK',
                        name: 'ボスアタック +5',
                        details: 'バトル後半で、自身の攻撃力5％アップ',
                    },
                },
            )

            expect(card.rarity).to.equal(Rarity.R)
            expect(card.event).to.be.false
            expect(card.attribute).to.equal(Attribute.FIRE)
            expect(card.characterName).to.equal('星咲 あかり')
            expect(card.skill).to.deep.equal(new Skill(SkillType.ATTACK, 5, true))
        })
        it('should return new instance based on card data for card with additional skill', () => {
            const card = Card.fromJson(
                {
                    characterName: '井之原 小星',
                    rarity: 'SSR',
                    attribute: 'LEAF',
                    cardNumber: '1.05-0030',
                    skill: {
                        type: 'ATTACK',
                        name: '小星フュージョン +5（ボスアタック +2）',
                        details: '【井之原 小星】のカード1枚につき、自身の攻撃力5％アップ\nバトル後半で自身の攻撃力2％アップ',
                    },
                },
            )

            expect(card.rarity).to.equal(Rarity.SSR)
            expect(card.event).to.be.false
            expect(card.attribute).to.equal(Attribute.LEAF)
            expect(card.characterName).to.equal('井之原 小星')
            expect(card.skill).to.deep.equal(
                new Skill(SkillType.ATTACK, 5, false, new CardMatcher(null, null, ['井之原 小星'])),
            )
            expect(card.additionalSkill).to.deep.equal(new Skill(SkillType.ATTACK, 2, true))
        })
        it('should create special skill with 25 percentageChoukaika for N cards', () => {
            const card = Card.fromJson(
                {
                    rarity: 'N',
                    attribute: 'FIRE',
                    characterName: '星咲 あかり',
                    cardNumber: '1.00-0001',
                    skill: {
                        type: 'ATTACK',
                        name: 'ボスアタック +5',
                        details: 'バトル後半で、自身の攻撃力5％アップ',
                    },
                },
            )

            expect(card.rarity).to.equal(Rarity.N)
            expect(card.event).to.be.false
            expect(card.attribute).to.equal(Attribute.FIRE)
            expect(card.characterName).to.equal('星咲 あかり')
            const expectedSkill = new Skill(SkillType.ATTACK, 5, true)
            expectedSkill.percentageChoukaika = 25
            expect(card.skill).to.deep.equal(expectedSkill)
        })
        it('should return new instance based on card data for event card', () => {
            const card = Card.fromJson(
                {
                    rarity: 'SR',
                    attribute: 'AQUA',
                    characterName: '東条 遥',
                    cardNumber: '1.00-E-0062',
                    skill: {
                        type: 'BOOST',
                        name: 'ボスアクアブースト +15',
                        details: 'バトル後半で、\n属性【AQUA】かつ【ATTACK】の攻撃力15％アップ',
                    },
                },
            )

            expect(card.rarity).to.equal(Rarity.SR)
            expect(card.event).to.be.true
            expect(card.attribute).to.equal(Attribute.AQUA)
            expect(card.characterName).to.equal('東条 遥')
            expect(card.skill).to.deep.equal(
                new Skill(SkillType.BOOST, 15, true, new CardMatcher(SkillType.ATTACK, Attribute.AQUA, null)),
            )
        })
        it('should throw error when rarity is invalid', () => {
            expect(Card.fromJson.bind(Card,
                {
                    rarity: 'INV',
                    attribute: 'FIRE',
                    characterName: '星咲 あかり',
                    cardNumber: '1.00-0001',
                    skill: {
                        type: 'ATTACK',
                        name: 'ボスアタック +5',
                        details: 'バトル後半で、自身の攻撃力5％アップ',
                    },
                },
            )).to.throw('Invalid rarity: INV')
        })
        it('should throw error when attribute is invalid', () => {
            expect(Card.fromJson.bind(Card,
                {
                    rarity: 'N',
                    attribute: 'INVAL',
                    characterName: '星咲 あかり',
                    cardNumber: '1.00-0001',
                    skill: {
                        type: 'ATTACK',
                        name: 'ボスアタック +5',
                        details: 'バトル後半で、自身の攻撃力5％アップ',
                    },
                },
            )).to.throw('Invalid attribute: INVAL')
        })
        it('should throw error when card number is invalid', () => {
            expect(Card.fromJson.bind(Card,
                {
                    rarity: 'N',
                    attribute: 'FIRE',
                    characterName: '星咲 あかり',
                    cardNumber: '1000.inv',
                    skill: {
                        type: 'ATTACK',
                        name: 'ボスアタック +5',
                        details: 'バトル後半で、自身の攻撃力5％アップ',
                    },
                },
            )).to.throw('Invalid card number: 1000.inv')
        })
        it('should create cards instances from json file', () => {
            for (const card of cards) {
                Card.fromJson(card)
            }
        })
    })
})
