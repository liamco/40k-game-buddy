/**
 * Model Type Extraction Utilities
 *
 * Extracts and normalizes model type names from wargear option text.
 */

/**
 * Normalize a model type name for comparison.
 * Handles variations like "Sergeant", "sergeant's", "SERGEANT"
 */
export function normalizeModelType(modelType: string): string {
    return modelType
        .toLowerCase()
        .replace(/'s$/, "") // Remove possessive
        .replace(/\s+/g, " ") // Normalize whitespace
        .trim();
}

/**
 * Check if two model type names refer to the same type.
 */
export function modelTypesMatch(type1: string, type2: string): boolean {
    return normalizeModelType(type1) === normalizeModelType(type2);
}

/**
 * Extract model type from targeting text patterns.
 * Returns the model type name or null if not found.
 */
export function extractModelTypeFromText(text: string): string | null {
    // Pattern: "The X's" or "The X can"
    const thePattern = /^the\s+([\w\s]+?)(?:'s|'s|\s+can)/i;
    const theMatch = text.match(thePattern);
    if (theMatch) {
        return theMatch[1].trim();
    }

    // Pattern: "N X's" or "N X can"
    const countPattern = /^\d+\s+([\w\s]+?)(?:'s|'s|\s+can)/i;
    const countMatch = text.match(countPattern);
    if (countMatch) {
        return countMatch[1].trim();
    }

    // Pattern: "Each X's"
    const eachPattern = /^each\s+([\w\s]+?)(?:'s|'s|\s+can)/i;
    const eachMatch = text.match(eachPattern);
    if (eachMatch) {
        return eachMatch[1].trim();
    }

    return null;
}

/**
 * Common model type suffixes that indicate a leader/character model.
 */
const LEADER_SUFFIXES = [
    "sergeant",
    "superior",
    "champion",
    "exarch",
    "sybarite",
    "alpha",
    "prime",
    "nob",
    "boss",
    "leader",
    "veteran",
];

/**
 * Check if a model type name indicates a leader/character model.
 */
export function isLeaderModelType(modelType: string): boolean {
    const normalized = normalizeModelType(modelType);
    return LEADER_SUFFIXES.some(
        (suffix) =>
            normalized.includes(suffix) || normalized.endsWith(suffix)
    );
}
