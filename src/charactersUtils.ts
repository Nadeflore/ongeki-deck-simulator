import characters from '../characters.json'

/**
 * Convert first name to full name
 * For character with one name only, just return name as is
 * @param name Character first name
 * @return Full name if matched
 * @throws Error when character is not found
 */
export function convertLastNameToFullName(name: string) {
    const character = characters.find(e => e.firstName === name || e.name === name)

    if (!character) {
        throw new Error("Could not find character: " + name)
    }

    if (character.name) {
        return character.name
    } else {
        return character.lastName + " " + character.firstName
    }
}

