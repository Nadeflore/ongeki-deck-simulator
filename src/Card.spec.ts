import { Card, Deck, Rarity, Attribute } from './Card'
import { Skill, SkillType } from './Skill'
import { CardMatcher } from './CardMatcher'

import { expect } from 'chai'
import 'mocha';

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
            card2.skill.condition = new CardMatcher(SkillType.ATTACK, null, '日向 美海')
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
})
