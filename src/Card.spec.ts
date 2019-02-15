import { Card, Rarity } from './Card'

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
})
