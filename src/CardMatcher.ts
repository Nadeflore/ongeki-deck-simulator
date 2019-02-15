import { Card, Attribute } from './Card'
import { SkillType } from './Skill'
/**
 * This class contains condition to match a card,
 * It is used by boost skills to indicate boost conditions.
 */
export class CardMatcher {
    skillType: SkillType
    attribute: Attribute
    characterName: string

    constructor(skillType: SkillType, attribute: Attribute, characterName: string) {
        this.skillType = skillType
        this.attribute = attribute
        this.characterName = characterName
    }

    /**
     * Check if a card match conditions
     * @param card Card to check
     * @return True if card match conditions
     */
    match(card: Card) {
        if (this.skillType && card.skill.type !== this.skillType) {
            return false
        }

        if (this.attribute && card.attribute !== this.attribute) {
            return false
        }

        if (this.characterName && card.characterName !== this.characterName) {
            return false
        }

        return true
    }

}

