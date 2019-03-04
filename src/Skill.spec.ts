import { Card, Attribute, Deck } from './Card'
import { CardMatcher } from './CardMatcher'
import { Skill, SkillType } from './Skill'

import { expect } from 'chai'
import 'mocha';

describe('Skill', () => {
    describe('calculateSelfIncreasePercent()', () => {
        it('should return 0 if skill is boost type', () => {
            const skill = new Skill(SkillType.BOOST, 10)
            expect(skill.calculateSelfIncreasePercent(true, null)).to.equal(0)
        })
        it('should return percentage when there is no condition', () => {
            const skill = new Skill(SkillType.GUARD, 5)
            expect(skill.calculateSelfIncreasePercent(false, null)).to.equal(5)
        })
        it('should return 0 if skill is only active during boss phase, while not in boss phase', () => {
            const skill = new Skill(SkillType.ATTACK, 15, true)
            expect(skill.calculateSelfIncreasePercent(false, null)).to.equal(0)
            expect(skill.calculateSelfIncreasePercent(true, null)).to.equal(15)
        })
        it('should return percentage multiplied by the number of card matching the conditon', () => {
            const skill = new Skill(SkillType.ATTACK, 7, true)
            skill.condition = new CardMatcher(null, null, '結城 莉玖')

            // No deck specified, condition is ignored, return percentage
            expect(skill.calculateSelfIncreasePercent(true, null)).to.equal(7)

            const card1 = new Card()
            card1.characterName = '結城 莉玖'
            const card2 = new Card()
            card2.characterName = '藍原 椿結'
            const card3 = new Card()
            card3.characterName = '桜井 春菜'
            const deck = new Deck(card1, card2, card3)

            // Only one card in deck match condiiton, should return percentage
            expect(skill.calculateSelfIncreasePercent(true, deck)).to.equal(7)

            card2.characterName = '結城 莉玖'
            card3.characterName = '結城 莉玖'

            // All cards in deck match condiiton, should return 3 times percentage
            expect(skill.calculateSelfIncreasePercent(true, deck)).to.equal(7*3)

        })
    })
    describe('calculateBoostPercent()', () => {
        it('should return 0 if skill is not boost type', () => {
            const skill = new Skill(SkillType.ASSIST, 5)

            expect(skill.calculateBoostPercent(true, new Card())).to.equal(0)
        })
        it('should return percentage if condition match card', () => {
            const skill = new Skill(SkillType.BOOST, 14)
            skill.condition = new CardMatcher(SkillType.ATTACK, null, null)

            const card = new Card()
            card.baseSkill = new Skill(SkillType.GUARD)
            
            // card does not match condition, should return 0
            expect(skill.calculateBoostPercent(true, card)).to.equal(0)

            card.baseSkill = new Skill(SkillType.ATTACK)

            // Card match condition, should return percent
            expect(skill.calculateBoostPercent(true, card)).to.equal(14)
        })
        it('should return 0 if skill is only active during boss phase, while not in boss phase', () => {
            const skill = new Skill(SkillType.BOOST, 14, true)
            skill.condition = new CardMatcher(SkillType.ATTACK, null, null)

            const card = new Card()
            card.baseSkill = new Skill(SkillType.ATTACK)

            expect(skill.calculateBoostPercent(false, card)).to.equal(0)
            expect(skill.calculateBoostPercent(true, card)).to.equal(14)
        })
    })

})
