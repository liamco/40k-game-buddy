/**
 * Parse Wargear Options Script
 *
 * Parses wargear option descriptions and adds structured `parsedWargearOptions`
 * to each datasheet JSON file. This runs at build time so the browser doesn't
 * need to parse options at runtime.
 *
 * Usage:
 *   npm run parse-wargear-options
 *
 * Or to run directly:
 *   node scripts/regex-parsers/parse-wargear-options.js
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// WORD-TO-NUMBER MAPPING
// ============================================================================

const WORD_TO_NUMBER = {
    one: 1,
    two: 2,
    three: 3,
    four: 4,
    five: 5,
    six: 6,
    seven: 7,
    eight: 8,
    nine: 9,
    ten: 10,
};

function parseNumber(str) {
    const lower = str.toLowerCase();
    return WORD_TO_NUMBER[lower] ?? parseInt(str, 10);
}

// ============================================================================
// WEAPON EXTRACTION UTILITIES
// ============================================================================

/**
 * Clean weapon name by removing trailing punctuation, parenthetical notes,
 * and normalizing whitespace
 */
function cleanWeaponName(name) {
    return name
        .replace(/\s*\(.*?\)\s*/g, "") // Remove parenthetical notes
        .replace(/[.,;:*]+$/, "") // Remove trailing punctuation
        .replace(/^\s*\d+\s+/, "") // Remove leading count if present
        .replace(/\s+/g, " ") // Normalize whitespace
        .trim();
}

/**
 * Parse a single weapon reference like "1 bolt pistol" or "power fist"
 */
function parseSingleWeaponRef(text) {
    if (!text) return null;

    const match = text.match(/^(\d+)?\s*(.+)$/);
    if (!match) return null;

    const count = match[1] ? parseInt(match[1], 10) : 1;
    const name = cleanWeaponName(match[2]);

    if (!name) return null;

    return { name, count };
}

/**
 * Strip possessive prefixes like "This model's", "The Sergeant's", etc.
 * Also handles ratio prefixes like "For every 10 models in this unit, 1 model's"
 */
function stripPossessivePrefix(text) {
    return text
        .replace(/^for every \d+ models in (?:this|the) unit,?\s+\d+\s+[\w\s]+?'s\s+/i, "")
        .replace(/^this model's\s+/i, "")
        .replace(/^the\s+[\w\s]+?'s\s+/i, "")
        .replace(/^each\s+[\w\s]+?'s\s+/i, "")
        .replace(/^\d+\s+[\w\s]+?'s\s+/i, "");
}

/**
 * Extract weapon references from text like "bolt pistol", "2 power fists",
 * "bolt pistol and boltgun"
 */
function extractWeaponRefs(text) {
    const cleaned = stripPossessivePrefix(text.trim());
    const refs = [];

    const andParts = cleaned.split(/\s+and\s+/i);
    for (const part of andParts) {
        const ref = parseSingleWeaponRef(stripPossessivePrefix(part.trim()));
        if (ref) {
            refs.push(ref);
        }
    }

    return refs;
}

/**
 * Fallback extraction for edge cases
 */
function extractChoicesFallback(text) {
    const choices = [];

    const parts = text.split(/\s*[,;]\s*/).filter((p) => p.trim());

    for (const part of parts) {
        const ref = parseSingleWeaponRef(part.trim());
        if (ref) {
            choices.push({
                weapons: [ref],
                isPackage: false,
            });
        }
    }

    return choices;
}

/**
 * Extract weapon choices from a choice list.
 * Handles HTML lists like <ul><li>1 weapon</li><li>1 other</li></ul>
 */
function extractWeaponChoices(text) {
    if (!text) return [];

    const cleaned = text.trim();
    const choices = [];

    // If text contains <li> tags, extract items from each list item
    if (cleaned.includes("<li>")) {
        const liPattern = /<li>([^<]+)<\/li>/gi;
        let liMatch;

        while ((liMatch = liPattern.exec(cleaned)) !== null) {
            const itemText = liMatch[1].trim();
            // Parse "1 weapon name" or "weapon name"
            const itemMatch = itemText.match(/^(\d+)\s+(.+)$/);
            if (itemMatch) {
                const count = parseInt(itemMatch[1], 10);
                const rawName = itemMatch[2].trim();

                // Check for package (e.g., "1 weapon and 1 other")
                if (rawName.toLowerCase().includes(" and ")) {
                    const parts = rawName.split(/\s+and\s+/i);
                    const weapons = [];

                    for (let i = 0; i < parts.length; i++) {
                        const part = parts[i].trim();
                        const partMatch = part.match(/^(\d+)\s+(.+)$/);
                        if (partMatch) {
                            weapons.push({
                                name: cleanWeaponName(partMatch[2]),
                                count: parseInt(partMatch[1], 10),
                            });
                        } else {
                            weapons.push({
                                name: cleanWeaponName(part),
                                count: i === 0 ? count : 1,
                            });
                        }
                    }

                    choices.push({ weapons, isPackage: true });
                } else {
                    const name = cleanWeaponName(rawName);
                    if (name) {
                        choices.push({
                            weapons: [{ name, count }],
                            isPackage: false,
                        });
                    }
                }
            }
        }

        if (choices.length > 0) {
            return choices;
        }
    }

    // Fallback: original regex-based parsing for non-HTML text
    const weaponPattern = /(\d+)\s+([^0-9]+?)(?=\s+\d+\s+|\s*$)/g;
    let match;

    while ((match = weaponPattern.exec(cleaned)) !== null) {
        const count = parseInt(match[1], 10);
        const rawName = match[2].trim();

        if (rawName.toLowerCase().includes(" and ")) {
            const parts = rawName.split(/\s+and\s+/i);
            const weapons = [];

            for (let i = 0; i < parts.length; i++) {
                const part = parts[i].trim();
                const partMatch = part.match(/^(\d+)\s+(.+)$/);
                if (partMatch) {
                    weapons.push({
                        name: cleanWeaponName(partMatch[2]),
                        count: parseInt(partMatch[1], 10),
                    });
                } else {
                    weapons.push({
                        name: cleanWeaponName(part),
                        count: i === 0 ? count : 1,
                    });
                }
            }

            choices.push({ weapons, isPackage: true });
        } else {
            const name = cleanWeaponName(rawName);
            if (name) {
                choices.push({
                    weapons: [{ name, count }],
                    isPackage: false,
                });
            }
        }
    }

    if (choices.length === 0) {
        return extractChoicesFallback(cleaned);
    }

    return choices;
}

/**
 * Extract the choice list that appears after a colon in the text
 */
function extractChoiceListAfterColon(text) {
    const colonIndex = text.indexOf(":");
    if (colonIndex === -1) {
        const followingMatch = text.match(/following[:\s]*(.+)$/is);
        return followingMatch ? followingMatch[1] : "";
    }
    return text.substring(colonIndex + 1).trim();
}

// ============================================================================
// TARGETING MATCHERS
// ============================================================================

function parseEquippedCondition(text) {
    const andMatch = text.match(/(.+?)\s+and\s+(.+)/i);
    if (andMatch) {
        return {
            type: "equipped-with",
            weaponNames: [andMatch[1].trim(), andMatch[2].trim()],
        };
    }

    return {
        type: "equipped-with",
        weaponName: text.trim(),
    };
}

const TARGETING_PATTERNS = [
    // "None" - no options
    {
        name: "none",
        pattern: /^none\.?$/i,
        extract: () => ({ type: "unknown" }),
    },

    // Footnote starting with "*"
    {
        name: "footnote",
        pattern: /^\*\s/,
        extract: () => ({ type: "unknown" }),
    },

    // "If this unit contains X models"
    {
        name: "if-unit-size",
        pattern: /^if this unit contains (?:between )?(\d+)(?: and \d+)? models/i,
        extract: (match) => ({
            type: "if-unit-size",
            unitSizeThreshold: parseInt(match[1], 10),
        }),
    },

    // "If this unit contains X or more/fewer models"
    {
        name: "if-unit-size-threshold",
        pattern: /^if this unit contains (\d+) or (?:more|fewer) models/i,
        extract: (match) => ({
            type: "if-unit-size",
            unitSizeThreshold: parseInt(match[1], 10),
        }),
    },

    // "If this unit's X is equipped with"
    {
        name: "if-model-equipped",
        pattern: /^if this unit'?s?\s+(.+?)\s+is equipped with/i,
        extract: (match) => ({
            type: "conditional",
            modelType: match[1].trim(),
            condition: { type: "equipped-with" },
        }),
    },

    // "If this model is equipped with X"
    {
        name: "conditional-equipped",
        pattern: /^if (?:this model is )?equipped with (.+?),/i,
        extract: (match) => ({
            type: "conditional",
            condition: parseEquippedCondition(match[1]),
        }),
    },

    // "This unit can be equipped"
    {
        name: "this-unit",
        pattern: /^this unit can be equipped/i,
        extract: () => ({ type: "this-unit" }),
    },

    // "All models in this unit"
    {
        name: "all-models",
        pattern: /^all (?:of the )?models in this unit/i,
        extract: () => ({ type: "all-models" }),
    },

    // "For every N models in this unit, up to M"
    {
        name: "ratio-capped",
        pattern: /^for every (\d+) models in (?:this|the) unit,? (?:.*?)up to (\d+)/i,
        extract: (match) => ({
            type: "ratio-capped",
            ratio: parseInt(match[1], 10),
            maxPerRatio: parseInt(match[2], 10),
        }),
    },

    // "For every N models in this unit, X ModelType's..." (with model type targeting)
    {
        name: "ratio-with-model-type",
        pattern: /^for every (\d+) models in (?:this|the) unit,?\s+(\d+)\s+([\w\s]+?)'s/i,
        extract: (match) => ({
            type: "ratio",
            ratio: parseInt(match[1], 10),
            count: parseInt(match[2], 10),
            modelType: match[3].trim(),
        }),
    },

    // "For every N models" (generic, no model type specified)
    {
        name: "ratio",
        pattern: /^for every (\d+) models/i,
        extract: (match) => ({
            type: "ratio",
            ratio: parseInt(match[1], 10),
        }),
    },

    // "Any number of models"
    {
        name: "any-number",
        pattern: /^any number of (?:models|[\w\s]+)/i,
        extract: () => ({ type: "any-number" }),
    },

    // "Up to N models"
    {
        name: "up-to-n",
        pattern: /^up to (\d+|one|two|three|four|five|six|seven|eight|nine|ten)/i,
        extract: (match) => ({
            type: "up-to-n",
            maxTotal: parseNumber(match[1]),
        }),
    },

    // "Each ModelType's"
    {
        name: "each-model-type",
        pattern: /^each ([\w\s]+?)(?:'s|'s|\s+can)/i,
        extract: (match) => ({
            type: "each-model-type",
            modelType: match[1].trim(),
        }),
    },

    // "The ModelType's X and Y can be replaced"
    {
        name: "specific-model-dual",
        pattern: /^the ([\w\s]+?)'s\s+(.+?)\s+and\s+(.+?)\s+can be replaced/i,
        extract: (match) => ({
            type: "specific-model",
            modelType: match[1].trim(),
        }),
    },

    // "The ModelType's" or "The ModelType can"
    {
        name: "specific-model",
        pattern: /^the ([\w\s]+?)(?:'s|'s|\s+can)/i,
        extract: (match) => ({
            type: "specific-model",
            modelType: match[1].trim(),
        }),
    },

    // "1 ModelType" or "One ModelType"
    {
        name: "n-model-specific",
        pattern: /^(\d+|one|two|three|four|five|six|seven|eight|nine|ten)\s+([\w\s]+?)(?:'s|'s|\s+can|\s+(?:model\s+)?(?:already\s+)?equipped)/i,
        extract: (match) => ({
            type: "n-model-specific",
            count: parseNumber(match[1]),
            modelType: match[2].trim(),
        }),
    },

    // "This model"
    {
        name: "this-model",
        pattern: /^this model(?:'s|'s|\s+can)?/i,
        extract: () => ({ type: "this-model" }),
    },
];

function matchTargeting(text) {
    const trimmed = text.trim();

    for (const { pattern, extract } of TARGETING_PATTERNS) {
        const match = trimmed.match(pattern);
        if (match) {
            return extract(match, trimmed);
        }
    }

    return { type: "unknown" };
}

// ============================================================================
// ACTION MATCHERS
// ============================================================================

const ACTION_PATTERNS = [
    // "can be replaced with one of the following:"
    {
        name: "replace-with-choice",
        pattern: /(.+?)\s+can be replaced with one of the following[:\s<]*(.*)$/is,
        extract: (match, text) => {
            const removes = extractWeaponRefs(match[1]);
            const choiceText = match[2] || extractChoiceListAfterColon(text);
            const adds = extractWeaponChoices(choiceText);
            return {
                type: "replace",
                removes,
                adds,
                isChoiceList: true,
            };
        },
    },

    // "can be equipped with one of the following:"
    {
        name: "equip-with-choice",
        pattern: /can be equipped with one of the following[:\s<]*(.*)$/is,
        extract: (match, text) => {
            const choiceText = match[1] || extractChoiceListAfterColon(text);
            const adds = extractWeaponChoices(choiceText);
            return {
                type: "add",
                removes: [],
                adds,
                isChoiceList: true,
            };
        },
    },

    // "can be equipped with up to N of the following:"
    {
        name: "equip-up-to",
        pattern: /can be equipped with up to (\d+|one|two|three|four|five|six) of the following[:\s<]*(.*)$/is,
        extract: (match, text) => {
            const choiceText = match[2] || extractChoiceListAfterColon(text);
            const adds = extractWeaponChoices(choiceText);
            return {
                type: "add",
                removes: [],
                adds,
                isChoiceList: true,
            };
        },
    },

    // "can be equipped with:" (simple list)
    {
        name: "equip-with-list",
        pattern: /can be equipped with[:\s]*<ul>/is,
        extract: (match, text) => {
            const choiceText = extractChoiceListAfterColon(text);
            const adds = extractWeaponChoices(choiceText);
            return {
                type: "add",
                removes: [],
                adds,
                isChoiceList: adds.length > 1,
            };
        },
    },

    // "X and Y can be replaced with Z"
    {
        name: "replace-multiple-with",
        pattern: /(.+?)\s+and\s+(.+?)\s+can be replaced with[:\s]*(.+)$/is,
        extract: (match) => {
            const removes = [...extractWeaponRefs(match[1]), ...extractWeaponRefs(match[2])];
            const adds = extractWeaponChoices(match[3]);
            return {
                type: "replace",
                removes,
                adds,
                isChoiceList: adds.length > 1,
            };
        },
    },

    // "can be replaced with N X and N Y"
    {
        name: "replace-with-package",
        pattern: /(.+?)\s+can be replaced with\s+(\d+)\s+(.+?)\s+and\s+(\d+)\s+(.+?)(?:\.|$)/i,
        extract: (match) => {
            const removes = extractWeaponRefs(match[1]);
            const weapon1 = {
                name: cleanWeaponName(match[3]),
                count: parseInt(match[2], 10),
            };
            const weapon2 = {
                name: cleanWeaponName(match[5]),
                count: parseInt(match[4], 10),
            };
            const packageChoice = {
                weapons: [weapon1, weapon2],
                isPackage: true,
            };
            return {
                type: "replace",
                removes,
                adds: [packageChoice],
                isChoiceList: false,
            };
        },
    },

    // "can be replaced with N weapon"
    {
        name: "replace-with-single",
        pattern: /(.+?)\s+can be replaced with\s+(\d+)\s+(.+?)(?:\.|$)/i,
        extract: (match) => {
            const removes = extractWeaponRefs(match[1]);
            const weaponRef = {
                name: cleanWeaponName(match[3]),
                count: parseInt(match[2], 10),
            };
            const choice = {
                weapons: [weaponRef],
                isPackage: false,
            };
            return {
                type: "replace",
                removes,
                adds: [choice],
                isChoiceList: false,
            };
        },
    },

    // "can be equipped with N weapon"
    {
        name: "equip-with-single",
        pattern: /can be equipped with\s+(\d+)\s+(.+?)(?:\s*\(|\.|\*|$)/i,
        extract: (match) => {
            const weaponRef = {
                name: cleanWeaponName(match[2]),
                count: parseInt(match[1], 10),
            };
            const choice = {
                weapons: [weaponRef],
                isPackage: false,
            };
            return {
                type: "add",
                removes: [],
                adds: [choice],
                isChoiceList: false,
            };
        },
    },

    // "can each be equipped with N weapon"
    {
        name: "each-equip-with-single",
        pattern: /can each be equipped with\s+(\d+)\s+(.+?)(?:\s*\(|\.|\*|$)/i,
        extract: (match) => {
            const weaponRef = {
                name: cleanWeaponName(match[2]),
                count: parseInt(match[1], 10),
            };
            const choice = {
                weapons: [weaponRef],
                isPackage: false,
            };
            return {
                type: "add",
                removes: [],
                adds: [choice],
                isChoiceList: false,
            };
        },
    },

    // "can have their X replaced with"
    {
        name: "have-replaced-with",
        pattern: /can (?:each )?have (?:their|its)\s+(.+?)\s+replaced with\s+(.+?)(?:\.|$)/is,
        extract: (match, text) => {
            const removes = extractWeaponRefs(match[1]);
            const addText = match[2];

            if (addText.toLowerCase().includes("one of the following")) {
                const choiceText = extractChoiceListAfterColon(text);
                const adds = extractWeaponChoices(choiceText);
                return {
                    type: "replace",
                    removes,
                    adds,
                    isChoiceList: true,
                };
            }

            const adds = extractWeaponChoices(addText);
            return {
                type: "replace",
                removes,
                adds,
                isChoiceList: adds.length > 1,
            };
        },
    },

    // "it can have N Aspect Shrine token"
    {
        name: "have-token",
        pattern: /it can have\s+(\d+)\s+(.+?)(?:\.|$)/i,
        extract: (match) => {
            const weaponRef = {
                name: cleanWeaponName(match[2]),
                count: parseInt(match[1], 10),
            };
            const choice = {
                weapons: [weaponRef],
                isPackage: false,
            };
            return {
                type: "add",
                removes: [],
                adds: [choice],
                isChoiceList: false,
            };
        },
    },

    // "can each replace their X with one of the following" (active voice)
    {
        name: "each-replace-with-choice",
        pattern: /can each replace (?:their|its)\s+(.+?)\s+with one of the following[:\s<]*(.*)$/is,
        extract: (match, text) => {
            const removes = extractWeaponRefs(match[1]);
            const choiceText = match[2] || extractChoiceListAfterColon(text);
            const adds = extractWeaponChoices(choiceText);
            return {
                type: "replace",
                removes,
                adds,
                isChoiceList: true,
            };
        },
    },

    // "can each replace their X with N Y" (active voice, single replacement)
    {
        name: "each-replace-with-single",
        pattern: /can each replace (?:their|its)\s+(.+?)\s+with\s+(\d+)\s+(.+?)(?:\.|$)/i,
        extract: (match) => {
            const removes = extractWeaponRefs(match[1]);
            const weaponRef = {
                name: cleanWeaponName(match[3]),
                count: parseInt(match[2], 10),
            };
            const choice = {
                weapons: [weaponRef],
                isPackage: false,
            };
            return {
                type: "replace",
                removes,
                adds: [choice],
                isChoiceList: false,
            };
        },
    },

    // "can replace its/their X with one of the following" (active voice)
    {
        name: "replace-with-choice-active",
        pattern: /can replace (?:its|their)\s+(.+?)\s+with one of the following[:\s<]*(.*)$/is,
        extract: (match, text) => {
            const removes = extractWeaponRefs(match[1]);
            const choiceText = match[2] || extractChoiceListAfterColon(text);
            const adds = extractWeaponChoices(choiceText);
            return {
                type: "replace",
                removes,
                adds,
                isChoiceList: true,
            };
        },
    },

    // "can replace its/their X with N Y" (active voice, single replacement)
    {
        name: "replace-with-single-active",
        pattern: /can replace (?:its|their)\s+(.+?)\s+with\s+(\d+)\s+(.+?)(?:\.|$)/i,
        extract: (match) => {
            const removes = extractWeaponRefs(match[1]);
            const weaponRef = {
                name: cleanWeaponName(match[3]),
                count: parseInt(match[2], 10),
            };
            const choice = {
                weapons: [weaponRef],
                isPackage: false,
            };
            return {
                type: "replace",
                removes,
                adds: [choice],
                isChoiceList: false,
            };
        },
    },
];

function matchAction(text) {
    const trimmed = text.trim();

    for (const { pattern, extract } of ACTION_PATTERNS) {
        const match = trimmed.match(pattern);
        if (match) {
            return extract(match, trimmed);
        }
    }

    return {
        type: "unknown",
        removes: [],
        adds: [],
        isChoiceList: false,
    };
}

// ============================================================================
// CONSTRAINT MATCHERS
// ============================================================================

const CONSTRAINT_PATTERNS = [
    // "(that model's boltgun cannot be replaced)"
    {
        name: "restricted-weapon",
        pattern: /\(that model'?s?\s+(.+?)\s+cannot be replaced\)/i,
        extract: (match, current) => ({
            ...current,
            restrictedWeapons: [...(current.restrictedWeapons || []), match[1].trim()],
        }),
    },

    // "cannot be equipped with both X and Y"
    {
        name: "mutually-exclusive",
        pattern: /cannot be equipped with both (?:a |an )?(.+?) and (?:a |an )?(.+?)(?:\.|,|$)/gi,
        extract: (match, current) => ({
            ...current,
            mutuallyExclusive: [...(current.mutuallyExclusive || []), [cleanWeaponName(match[1]), cleanWeaponName(match[2])]],
        }),
    },

    // "cannot be equipped with more than N X"
    {
        name: "max-weapon-count",
        pattern: /cannot be equipped with more than (\d+) (.+?)(?:\.|,|and|$)/gi,
        extract: (match, current) => ({
            ...current,
            maxWeaponCount: [...(current.maxWeaponCount || []), { weapon: cleanWeaponName(match[2]), max: parseInt(match[1], 10) }],
        }),
    },

    // "cannot be equipped with X or Y" (standalone prohibition, not "both" or "more than")
    {
        name: "excluded-weapons",
        pattern: /cannot be equipped with (?:a |an )?([^,.]+?)(?: or (?:a |an )?([^,.]+?))?(?:\.|,|$)/i,
        extract: (match, current) => {
            // Skip if this is a "both X and Y" or "more than N" pattern (handled by other matchers)
            if (/^both /i.test(match[1]) || /^more than /i.test(match[1])) {
                return current;
            }
            const excluded = [cleanWeaponName(match[1])];
            if (match[2]) excluded.push(cleanWeaponName(match[2]));
            return {
                ...current,
                excludedWeapons: [...(current.excludedWeapons || []), ...excluded],
            };
        },
    },

    // "cannot take duplicates"
    {
        name: "no-duplicates",
        pattern: /cannot take duplicates/i,
        extract: (_, current) => ({
            ...current,
            noDuplicates: true,
        }),
    },

    // "can take duplicates"
    {
        name: "allow-duplicates",
        pattern: /can take duplicates/i,
        extract: (_, current) => ({
            ...current,
            allowDuplicates: true,
        }),
    },

    // "two different weapons"
    {
        name: "must-be-different",
        pattern: /two different (?:weapons|items)/i,
        extract: (_, current) => ({
            ...current,
            mustBeDifferent: true,
        }),
    },

    // "up to two of the following"
    {
        name: "max-selections-two",
        pattern: /up to two of the following/i,
        extract: (_, current) => ({
            ...current,
            maxSelections: 2,
        }),
    },

    // "up to three of the following"
    {
        name: "max-selections-three",
        pattern: /up to three of the following/i,
        extract: (_, current) => ({
            ...current,
            maxSelections: 3,
        }),
    },

    // "up to N of the following"
    {
        name: "max-selections-n",
        pattern: /up to (\d+) of the following/i,
        extract: (match, current) => ({
            ...current,
            maxSelections: parseInt(match[1], 10),
        }),
    },
];

function matchConstraints(text) {
    let constraints = {};

    for (const { pattern, extract } of CONSTRAINT_PATTERNS) {
        // Handle global patterns (multiple matches)
        if (pattern.global) {
            let match;
            // Reset lastIndex for global patterns
            pattern.lastIndex = 0;
            while ((match = pattern.exec(text)) !== null) {
                constraints = extract(match, constraints);
            }
        } else {
            const match = text.match(pattern);
            if (match) {
                constraints = extract(match, constraints);
            }
        }
    }

    return constraints;
}

// ============================================================================
// MAIN PARSING FUNCTION
// ============================================================================

/**
 * Check if text is a NONE_KEYWORD (indicates no wargear options)
 */
function isNoneKeyword(text) {
    const normalized = text.trim().toLowerCase();
    return normalized === "none" || normalized === "none.";
}

/**
 * Check if text is a FOOTNOTE (supplementary rule text, not an actionable option)
 */
function isFootnote(text) {
    return text.trim().startsWith("*");
}

/**
 * Parse a single wargear option into a structured definition.
 */
function parseOption(option) {
    const text = option.description.trim();

    const targeting = matchTargeting(text);
    const action = matchAction(text);
    const constraints = matchConstraints(text);

    // Determine if this option was successfully parsed
    // NONE_KEYWORD and FOOTNOTE are considered "parsed" because:
    // - NONE_KEYWORD is effectively null (no options to generate)
    // - FOOTNOTE is supplementary text (will be displayed but not interactive)
    const isNone = isNoneKeyword(text);
    const isNote = isFootnote(text);
    const wasActuallyParsed = targeting.type !== "unknown" && action.type !== "unknown";
    const wargearParsed = wasActuallyParsed || isNone || isNote;

    return {
        line: option.line,
        rawText: text,
        wargearParsed,
        targeting,
        action,
        constraints,
    };
}

/**
 * Parse all wargear options for a datasheet.
 */
function parseAllOptions(options) {
    if (!options || options.length === 0) return [];
    return options.map(parseOption);
}

// ============================================================================
// FILE PROCESSING
// ============================================================================

/**
 * Process a single datasheet JSON file.
 * Reads from wargear.options.raw and writes parsed options to wargear.options.parsed
 */
function processDatasheetFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, "utf-8");
        const datasheet = JSON.parse(content);

        // Skip if no wargear object or no raw options
        if (!datasheet.wargear || !datasheet.wargear.options || !datasheet.wargear.options.raw || datasheet.wargear.options.raw.length === 0) {
            return { modified: false, parsed: 0, unparsed: 0 };
        }

        // Parse all options from the raw options array
        const parsedOptions = parseAllOptions(datasheet.wargear.options.raw);

        // Add unit-level flag: true if ALL options were successfully parsed
        const allParsed = parsedOptions.every((o) => o.wargearParsed);

        // Write to consolidated wargear.options object
        datasheet.wargear.options.parsed = parsedOptions;
        datasheet.wargear.options.allParsed = allParsed;

        // Write back to file
        fs.writeFileSync(filePath, JSON.stringify(datasheet, null, 2), "utf-8");

        const parsed = parsedOptions.filter((o) => o.wargearParsed).length;
        const unparsed = parsedOptions.filter((o) => !o.wargearParsed).length;

        return { modified: true, parsed, unparsed };
    } catch (error) {
        console.error(`Error processing ${filePath}:`, error.message);
        return { modified: false, error: error.message };
    }
}

/**
 * Find all datasheet JSON files recursively.
 */
function findDatasheetFiles(dir) {
    const files = [];

    function walk(currentDir) {
        const entries = fs.readdirSync(currentDir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(currentDir, entry.name);

            if (entry.isDirectory()) {
                // Only process 'datasheets' directories
                if (entry.name === "datasheets") {
                    const datasheetFiles = fs.readdirSync(fullPath).filter((f) => f.endsWith(".json"));
                    files.push(...datasheetFiles.map((f) => path.join(fullPath, f)));
                } else {
                    walk(fullPath);
                }
            }
        }
    }

    walk(dir);
    return files;
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
    console.log("═".repeat(60));
    console.log("  Parse Wargear Options");
    console.log("═".repeat(60));
    console.log("");

    // Find output directory
    const outputPath = path.join(__dirname, "..", "..", "src", "app", "data", "output", "factions");

    if (!fs.existsSync(outputPath)) {
        console.error(`❌ Output directory not found: ${outputPath}`);
        console.error("   Run 'npm run parse-depot-data' first to generate output files.");
        process.exit(1);
    }

    // Find all datasheet files
    const datasheetFiles = findDatasheetFiles(outputPath);
    console.log(`📁 Found ${datasheetFiles.length} datasheet files to process`);
    console.log(`📂 Source: ${outputPath}`);
    console.log("");

    let totalModified = 0;
    let totalParsed = 0;
    let totalUnparsed = 0;
    let totalErrors = 0;

    for (let i = 0; i < datasheetFiles.length; i++) {
        const filePath = datasheetFiles[i];
        const relativePath = path.relative(outputPath, filePath);

        const result = processDatasheetFile(filePath);

        if (result.error) {
            totalErrors++;
            console.log(`❌ [${i + 1}/${datasheetFiles.length}] Error: ${relativePath}`);
        } else if (result.modified) {
            totalModified++;
            totalParsed += result.parsed;
            totalUnparsed += result.unparsed;

            if (result.unparsed > 0) {
                console.log(`⚠️  [${i + 1}/${datasheetFiles.length}] ${relativePath} (${result.parsed} parsed, ${result.unparsed} unparsed)`);
            }
        }
    }

    console.log("");
    console.log("═".repeat(60));
    console.log("📊 Summary:");
    console.log(`   📄 Files processed: ${datasheetFiles.length}`);
    console.log(`   ✏️  Files modified: ${totalModified}`);
    console.log(`   ✅ Options parsed: ${totalParsed}`);
    console.log(`   ⚠️  Options unparsed: ${totalUnparsed}`);
    if (totalErrors > 0) {
        console.log(`   ❌ Errors: ${totalErrors}`);
    }
    console.log(`   📈 Parse rate: ${((totalParsed / (totalParsed + totalUnparsed)) * 100).toFixed(1)}%`);
    console.log("═".repeat(60));
}

main().catch(console.error);
