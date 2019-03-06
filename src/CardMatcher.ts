import { Card, Attribute } from './Card'
import { SkillType } from './Skill'
/**
 * This class contains condition to match a card,
 * It is used by boost skills to indicate boost conditions.
 */
export class CardMatcher {
    // Card should have same skill type
    skillType: SkillType
    // Card should have same attribute
    attribute: Attribute
    // Card should math one of the names
    characterNames: string[]

    constructor(skillType: SkillType, attribute: Attribute, characterNames: string[]) {
        this.skillType = skillType
        this.attribute = attribute
        this.characterNames = characterNames
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

        if (this.characterNames && !this.characterNames.includes(card.characterName)) {
            return false
        }

        return true
    }

}

