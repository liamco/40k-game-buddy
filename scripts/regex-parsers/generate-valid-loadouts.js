/**
 * Generate Valid Loadouts Script
 *
 * Parses wargear options and generates:
 * 1. Weapon eligibility rules (which models can see/select each weapon)
 * 2. Valid loadout combinations for validation
 *
 * Output structure:
 * wargear: {
 *   defaultLoadout: { raw: "...", parsed: ["id1", "id2"] },
 *   weapons: [
 *     { id: "...", name: "...", eligibility: [{ type: "any" }], ... },
 *     { id: "...", name: "...", eligibility: [{ type: "ratio", ratio: 5, count: 1, modelType: ["Terminator"] }], ... }
 *   ],
 *   validLoadouts: [
 *     { modelType: "any", items: [["id1", "id2"], ["id1", "id3"]] },
 *     { modelType: "Sergeant", items: [["id1", "id4"]] }
 *   ],
 *   loadoutsParsed: true/false
 * }
 *
 * Usage:
 *   npm run generate-loadouts
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
// BASIC UTILITIES
// ============================================================================

/**
 * Strip HTML tags from text
 */
function stripHtml(text) {
    return text.replace(/<[^>]*>/g, "").trim();
}

/**
 * Convert a weapon/ability name to its ID format
 */
function nameToId(name, datasheetId, isAbility = false) {
    const slug = name.toLowerCase().trim().replace(/\s+/g, "-");
    if (isAbility) {
        return `wargear-ability:${slug}`;
    }
    return `${datasheetId}:${slug}`;
}

/**
 * Find weapon/ability by name and return its ID
 */
function resolveNameToId(name, weapons, abilities, datasheetId) {
    const normalizedName = name.toLowerCase().trim();

    const weapon = weapons.find((w) => w.name.toLowerCase().trim() === normalizedName);
    if (weapon) {
        return weapon.id;
    }

    const ability = abilities.find((a) => a.name.toLowerCase().trim() === normalizedName);
    if (ability) {
        return `wargear-ability:${normalizedName.replace(/\s+/g, "-")}`;
    }

    return nameToId(name, datasheetId, false);
}

/**
 * Clean model type from unit composition description
 */
function cleanModelType(description) {
    return description
        .replace(/^\d+[-\s]*\d*\s*/, "")
        .replace(/s$/, "")
        .trim();
}

// ============================================================================
// WEAPON EXTRACTION UTILITIES (from parse-wargear-options.js)
// ============================================================================

function cleanWeaponName(name) {
    return name
        .replace(/\s*\(.*?\)\s*/g, "")
        .replace(/[.,;:*]+$/, "")
        .replace(/^\s*\d+\s+/, "")
        .replace(/\s+and\s*$/i, "")
        .replace(/\s+/g, " ")
        .trim();
}

function parseWeaponChoiceItem(text) {
    const cleaned = text.trim();
    if (!cleaned) return null;

    if (/\s+and\s+\d+\s+/i.test(cleaned)) {
        const parts = cleaned.split(/\s+and\s+/i);
        const weapons = [];

        for (const part of parts) {
            const match = part.trim().match(/^(\d+)\s+(.+)$/);
            if (match) {
                weapons.push({
                    name: cleanWeaponName(match[2]),
                    count: parseInt(match[1], 10),
                });
            }
        }

        if (weapons.length > 1) {
            return { weapons, isPackage: true };
        }
    }

    const match = cleaned.match(/^(\d+)\s+(.+)$/);
    if (match) {
        const name = cleanWeaponName(match[2]);
        if (name) {
            return {
                weapons: [{ name, count: parseInt(match[1], 10) }],
                isPackage: false,
            };
        }
    }

    const name = cleanWeaponName(cleaned);
    if (name) {
        return {
            weapons: [{ name, count: 1 }],
            isPackage: false,
        };
    }

    return null;
}

function parseSingleWeaponRef(text) {
    if (!text) return null;

    const match = text.match(/^(\d+)?\s*(.+)$/);
    if (!match) return null;

    const count = match[1] ? parseInt(match[1], 10) : 1;
    const name = cleanWeaponName(match[2]);

    if (!name) return null;

    return { name, count };
}

function stripPossessivePrefix(text) {
    return text
        .replace(/^for every \d+ models in (?:this|the) unit,?\s+\d+\s+[\w\s]+?'s\s+/i, "")
        .replace(/^this model's\s+/i, "")
        .replace(/^the\s+[\w\s]+?'s\s+/i, "")
        .replace(/^each\s+[\w\s]+?'s\s+/i, "")
        .replace(/^\d+\s+[\w\s]+?'s\s+/i, "");
}

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

function extractWeaponChoices(text) {
    if (!text) return [];

    const cleaned = text.trim();
    const choices = [];

    if (cleaned.includes("<li>")) {
        const liPattern = /<li>([\s\S]*?)<\/li>/gi;
        let liMatch;

        while ((liMatch = liPattern.exec(cleaned)) !== null) {
            const itemText = stripHtml(liMatch[1]);
            const choice = parseWeaponChoiceItem(itemText);
            if (choice) {
                choices.push(choice);
            }
        }

        if (choices.length > 0) {
            return choices;
        }
    }

    const singleChoice = parseWeaponChoiceItem(cleaned);
    if (singleChoice) {
        return [singleChoice];
    }

    return extractChoicesFallback(cleaned);
}

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
    { name: "none", pattern: /^none\.?$/i, extract: () => ({ type: "unknown" }) },
    { name: "footnote", pattern: /^\*\s/, extract: () => ({ type: "unknown" }) },
    {
        name: "if-unit-size",
        pattern: /^if this unit contains (?:between )?(\d+)(?: and \d+)? models/i,
        extract: (match) => ({ type: "if-unit-size", unitSizeThreshold: parseInt(match[1], 10) }),
    },
    {
        name: "if-unit-size-threshold",
        pattern: /^if this unit contains (\d+) or (?:more|fewer) models/i,
        extract: (match) => ({ type: "if-unit-size", unitSizeThreshold: parseInt(match[1], 10) }),
    },
    {
        name: "if-model-equipped",
        pattern: /^if this unit'?s?\s+(.+?)\s+is equipped with/i,
        extract: (match) => ({ type: "conditional", modelType: match[1].trim(), condition: { type: "equipped-with" } }),
    },
    {
        name: "conditional-equipped",
        pattern: /^if (?:this model is )?equipped with (.+?),/i,
        extract: (match) => ({ type: "conditional", condition: parseEquippedCondition(match[1]) }),
    },
    { name: "this-unit", pattern: /^this unit can be equipped/i, extract: () => ({ type: "this-unit" }) },
    { name: "all-models", pattern: /^all (?:of the )?models in this unit/i, extract: () => ({ type: "all-models" }) },
    {
        name: "ratio-capped",
        pattern: /^for every (\d+) models in (?:this|the) unit,? (?:.*?)up to (\d+)/i,
        extract: (match) => ({ type: "ratio-capped", ratio: parseInt(match[1], 10), maxPerRatio: parseInt(match[2], 10) }),
    },
    {
        name: "ratio-with-model-type",
        pattern: /^for every (\d+) models in (?:this|the) unit,?\s+(\d+)\s+([\w\s]+?)'s/i,
        extract: (match) => ({ type: "ratio", ratio: parseInt(match[1], 10), count: parseInt(match[2], 10), modelType: match[3].trim() }),
    },
    {
        name: "ratio",
        pattern: /^for every (\d+) models/i,
        extract: (match) => ({ type: "ratio", ratio: parseInt(match[1], 10) }),
    },
    { name: "any-number", pattern: /^any number of (?:models|[\w\s]+)/i, extract: () => ({ type: "any-number" }) },
    {
        name: "up-to-n",
        pattern: /^up to (\d+|one|two|three|four|five|six|seven|eight|nine|ten)/i,
        extract: (match) => ({ type: "up-to-n", maxTotal: parseNumber(match[1]) }),
    },
    {
        name: "each-model-type",
        pattern: /^each ([\w\s]+?)(?:'s|'s|\s+can)/i,
        extract: (match) => ({ type: "each-model-type", modelType: match[1].trim() }),
    },
    {
        name: "specific-model-dual",
        pattern: /^the ([\w\s]+?)'s\s+(.+?)\s+and\s+(.+?)\s+can be replaced/i,
        extract: (match) => ({ type: "specific-model", modelType: match[1].trim() }),
    },
    {
        name: "specific-model",
        pattern: /^the ([\w\s]+?)(?:'s|'s|\s+can)/i,
        extract: (match) => ({ type: "specific-model", modelType: match[1].trim() }),
    },
    {
        name: "n-model-specific",
        pattern: /^(\d+|one|two|three|four|five|six|seven|eight|nine|ten)\s+([\w\s]+?)(?:'s|'s|\s+can|\s+(?:model\s+)?(?:already\s+)?equipped)/i,
        extract: (match) => ({ type: "n-model-specific", count: parseNumber(match[1]), modelType: match[2].trim() }),
    },
    { name: "this-model", pattern: /^this model(?:'s|'s|\s+can)?/i, extract: () => ({ type: "this-model" }) },
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
    {
        name: "replace-with-choice",
        pattern: /(.+?)\s+can be replaced with one of the following[:\s<]*(.*)$/is,
        extract: (match, text) => {
            const removes = extractWeaponRefs(match[1]);
            const choiceText = match[2] || extractChoiceListAfterColon(text);
            const adds = extractWeaponChoices(choiceText);
            return { type: "replace", removes, adds, isChoiceList: true };
        },
    },
    {
        name: "equip-with-choice",
        pattern: /can be equipped with one of the following[:\s<]*(.*)$/is,
        extract: (match, text) => {
            const choiceText = match[1] || extractChoiceListAfterColon(text);
            const adds = extractWeaponChoices(choiceText);
            return { type: "add", removes: [], adds, isChoiceList: true };
        },
    },
    {
        name: "equip-up-to",
        pattern: /can be equipped with up to (\d+|one|two|three|four|five|six) of the following[:\s<]*(.*)$/is,
        extract: (match, text) => {
            const choiceText = match[2] || extractChoiceListAfterColon(text);
            const adds = extractWeaponChoices(choiceText);
            return { type: "add", removes: [], adds, isChoiceList: true };
        },
    },
    {
        name: "equip-with-list",
        pattern: /can be equipped with[:\s]*<ul>/is,
        extract: (match, text) => {
            const choiceText = extractChoiceListAfterColon(text);
            const adds = extractWeaponChoices(choiceText);
            return { type: "add", removes: [], adds, isChoiceList: adds.length > 1 };
        },
    },
    {
        name: "replace-multiple-with",
        pattern: /(.+?)\s+and\s+(.+?)\s+can be replaced with[:\s]*(.+)$/is,
        extract: (match) => {
            const removes = [...extractWeaponRefs(match[1]), ...extractWeaponRefs(match[2])];
            const adds = extractWeaponChoices(match[3]);
            return { type: "replace", removes, adds, isChoiceList: adds.length > 1 };
        },
    },
    {
        name: "replace-with-package",
        pattern: /(.+?)\s+can be replaced with\s+(\d+)\s+(.+?)\s+and\s+(\d+)\s+(.+?)(?:\.|$)/i,
        extract: (match) => {
            const removes = extractWeaponRefs(match[1]);
            const weapon1 = { name: cleanWeaponName(match[3]), count: parseInt(match[2], 10) };
            const weapon2 = { name: cleanWeaponName(match[5]), count: parseInt(match[4], 10) };
            return { type: "replace", removes, adds: [{ weapons: [weapon1, weapon2], isPackage: true }], isChoiceList: false };
        },
    },
    {
        name: "replace-with-single",
        pattern: /(.+?)\s+can be replaced with\s+(\d+)\s+(.+?)(?:\.|$)/i,
        extract: (match) => {
            const removes = extractWeaponRefs(match[1]);
            const weaponRef = { name: cleanWeaponName(match[3]), count: parseInt(match[2], 10) };
            return { type: "replace", removes, adds: [{ weapons: [weaponRef], isPackage: false }], isChoiceList: false };
        },
    },
    {
        name: "equip-with-single",
        pattern: /can be equipped with\s+(\d+)\s+(.+?)(?:\s*\(|\.|\*|$)/i,
        extract: (match) => {
            const weaponRef = { name: cleanWeaponName(match[2]), count: parseInt(match[1], 10) };
            return { type: "add", removes: [], adds: [{ weapons: [weaponRef], isPackage: false }], isChoiceList: false };
        },
    },
    {
        name: "each-equip-with-single",
        pattern: /can each be equipped with\s+(\d+)\s+(.+?)(?:\s*\(|\.|\*|$)/i,
        extract: (match) => {
            const weaponRef = { name: cleanWeaponName(match[2]), count: parseInt(match[1], 10) };
            return { type: "add", removes: [], adds: [{ weapons: [weaponRef], isPackage: false }], isChoiceList: false };
        },
    },
    {
        name: "have-replaced-with",
        pattern: /can (?:each )?have (?:their|its)\s+(.+?)\s+replaced with\s+(.+?)(?:\.|$)/is,
        extract: (match, text) => {
            const removes = extractWeaponRefs(match[1]);
            const addText = match[2];

            if (addText.toLowerCase().includes("one of the following")) {
                const choiceText = extractChoiceListAfterColon(text);
                const adds = extractWeaponChoices(choiceText);
                return { type: "replace", removes, adds, isChoiceList: true };
            }

            const adds = extractWeaponChoices(addText);
            return { type: "replace", removes, adds, isChoiceList: adds.length > 1 };
        },
    },
    {
        name: "have-token",
        pattern: /it can have\s+(\d+)\s+(.+?)(?:\.|$)/i,
        extract: (match) => {
            const weaponRef = { name: cleanWeaponName(match[2]), count: parseInt(match[1], 10) };
            return { type: "add", removes: [], adds: [{ weapons: [weaponRef], isPackage: false }], isChoiceList: false };
        },
    },
    {
        name: "each-replace-with-choice",
        pattern: /can each replace (?:their|its)\s+(.+?)\s+with one of the following[:\s<]*(.*)$/is,
        extract: (match, text) => {
            const removes = extractWeaponRefs(match[1]);
            const choiceText = match[2] || extractChoiceListAfterColon(text);
            const adds = extractWeaponChoices(choiceText);
            return { type: "replace", removes, adds, isChoiceList: true };
        },
    },
    {
        name: "each-replace-with-single",
        pattern: /can each replace (?:their|its)\s+(.+?)\s+with\s+(\d+)\s+(.+?)(?:\.|$)/i,
        extract: (match) => {
            const removes = extractWeaponRefs(match[1]);
            const weaponRef = { name: cleanWeaponName(match[3]), count: parseInt(match[2], 10) };
            return { type: "replace", removes, adds: [{ weapons: [weaponRef], isPackage: false }], isChoiceList: false };
        },
    },
    {
        name: "replace-with-choice-active",
        pattern: /can replace (?:its|their)\s+(.+?)\s+with one of the following[:\s<]*(.*)$/is,
        extract: (match, text) => {
            const removes = extractWeaponRefs(match[1]);
            const choiceText = match[2] || extractChoiceListAfterColon(text);
            const adds = extractWeaponChoices(choiceText);
            return { type: "replace", removes, adds, isChoiceList: true };
        },
    },
    {
        name: "replace-with-single-active",
        pattern: /can replace (?:its|their)\s+(.+?)\s+with\s+(\d+)\s+(.+?)(?:\.|$)/i,
        extract: (match) => {
            const removes = extractWeaponRefs(match[1]);
            const weaponRef = { name: cleanWeaponName(match[3]), count: parseInt(match[2], 10) };
            return { type: "replace", removes, adds: [{ weapons: [weaponRef], isPackage: false }], isChoiceList: false };
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

    return { type: "unknown", removes: [], adds: [], isChoiceList: false };
}

// ============================================================================
// CONSTRAINT MATCHERS
// ============================================================================

const CONSTRAINT_PATTERNS = [
    {
        name: "restricted-weapon",
        pattern: /\(that model'?s?\s+(.+?)\s+cannot be replaced\)/i,
        extract: (match, current) => ({ ...current, restrictedWeapons: [...(current.restrictedWeapons || []), match[1].trim()] }),
    },
    {
        name: "mutually-exclusive",
        pattern: /cannot be equipped with both (?:a |an )?(.+?) and (?:a |an )?(.+?)(?:\.|,|$)/gi,
        extract: (match, current) => ({ ...current, mutuallyExclusive: [...(current.mutuallyExclusive || []), [cleanWeaponName(match[1]), cleanWeaponName(match[2])]] }),
    },
    {
        name: "max-weapon-count",
        pattern: /cannot be equipped with more than (\d+) (.+?)(?:\.|,|and|$)/gi,
        extract: (match, current) => ({ ...current, maxWeaponCount: [...(current.maxWeaponCount || []), { weapon: cleanWeaponName(match[2]), max: parseInt(match[1], 10) }] }),
    },
    {
        name: "excluded-weapons",
        pattern: /cannot be equipped with (?:a |an )?([^,.]+?)(?: or (?:a |an )?([^,.]+?))?(?:\.|,|$)/i,
        extract: (match, current) => {
            if (/^both /i.test(match[1]) || /^more than /i.test(match[1])) return current;
            const excluded = [cleanWeaponName(match[1])];
            if (match[2]) excluded.push(cleanWeaponName(match[2]));
            return { ...current, excludedWeapons: [...(current.excludedWeapons || []), ...excluded] };
        },
    },
    { name: "no-duplicates", pattern: /cannot take duplicates/i, extract: (_, current) => ({ ...current, noDuplicates: true }) },
    { name: "allow-duplicates", pattern: /can take duplicates/i, extract: (_, current) => ({ ...current, allowDuplicates: true }) },
    { name: "must-be-different", pattern: /two different (?:weapons|items)/i, extract: (_, current) => ({ ...current, mustBeDifferent: true }) },
    { name: "max-selections-two", pattern: /up to two of the following/i, extract: (_, current) => ({ ...current, maxSelections: 2 }) },
    { name: "max-selections-three", pattern: /up to three of the following/i, extract: (_, current) => ({ ...current, maxSelections: 3 }) },
    { name: "max-selections-n", pattern: /up to (\d+) of the following/i, extract: (match, current) => ({ ...current, maxSelections: parseInt(match[1], 10) }) },
];

function matchConstraints(text) {
    let constraints = {};

    for (const { pattern, extract } of CONSTRAINT_PATTERNS) {
        if (pattern.global) {
            let match;
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
// OPTION PARSING
// ============================================================================

function isNoneKeyword(text) {
    const normalized = text.trim().toLowerCase();
    return normalized === "none" || normalized === "none.";
}

function isFootnote(text) {
    return text.trim().startsWith("*");
}

function parseOption(option) {
    const text = option.description.trim();

    const targeting = matchTargeting(text);
    const action = matchAction(text);
    const constraints = matchConstraints(text);

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

function parseAllOptions(options) {
    if (!options || options.length === 0) return [];
    return options.map(parseOption);
}

function resolveWargearReference(ref, weapons, abilities) {
    const normalizedName = ref.name.toLowerCase().trim();

    const matchesWeapon = weapons.some((w) => w.name.toLowerCase().trim() === normalizedName);
    if (matchesWeapon) {
        return { ...ref, isAbility: false };
    }

    const matchesAbility = abilities.some((a) => a.name.toLowerCase().trim() === normalizedName);
    if (matchesAbility) {
        return { ...ref, isAbility: true };
    }

    return { ...ref, isAbility: false };
}

function resolveOptionReferences(parsedOption, weapons, abilities) {
    if (!parsedOption.action || parsedOption.action.type === "unknown") {
        return parsedOption;
    }

    const updatedAction = { ...parsedOption.action };

    if (updatedAction.removes && Array.isArray(updatedAction.removes)) {
        updatedAction.removes = updatedAction.removes.map((ref) => resolveWargearReference(ref, weapons, abilities));
    }

    if (updatedAction.adds && Array.isArray(updatedAction.adds)) {
        updatedAction.adds = updatedAction.adds.map((choice) => ({
            ...choice,
            weapons: choice.weapons.map((ref) => resolveWargearReference(ref, weapons, abilities)),
        }));
    }

    return { ...parsedOption, action: updatedAction };
}

// ============================================================================
// DEFAULT LOADOUT PARSING
// ============================================================================

function parseDefaultLoadout(defaultLoadoutText, unitComposition) {
    if (!defaultLoadoutText) return [];

    const text = stripHtml(defaultLoadoutText);
    const loadouts = [];

    const modelPatterns = [/(?:The\s+)?(\w[\w\s]+?)\s+(?:model\s+)?is equipped with:\s*([^.]+)/gi, /Every\s+(\w[\w\s]+?)\s+(?:model\s+)?is equipped with:\s*([^.]+)/gi];

    for (const pattern of modelPatterns) {
        let match;
        while ((match = pattern.exec(text)) !== null) {
            const modelType = match[1].trim();
            const itemsText = match[2].trim();
            const items = itemsText
                .split(/[;,]/)
                .map((s) => s.trim())
                .filter((s) => s && s.length > 0)
                .map((s) => s.replace(/^\d+\s+/, ""));

            if (items.length > 0) {
                loadouts.push({ modelType, items });
            }
        }
    }

    if (loadouts.length === 0) {
        const genericMatch = text.match(/equipped with:\s*([^.]+)/i);
        if (genericMatch) {
            const items = genericMatch[1]
                .split(/[;,]/)
                .map((s) => s.trim())
                .filter((s) => s && s.length > 0)
                .map((s) => s.replace(/^\d+\s+/, ""));

            const modelType = unitComposition?.[0]?.description ? cleanModelType(stripHtml(unitComposition[0].description)) : "any";

            if (items.length > 0) {
                loadouts.push({ modelType, items });
            }
        }
    }

    return loadouts;
}

function getModelTypes(unitComposition) {
    if (!unitComposition || unitComposition.length === 0) {
        return [{ modelType: "any", min: 1, max: 1 }];
    }

    return unitComposition.map((comp) => ({
        modelType: cleanModelType(stripHtml(comp.description)),
        min: comp.min,
        max: comp.max,
    }));
}

function parseDefaultLoadoutStructured(defaultLoadoutText, weapons, abilities, datasheetId, unitComposition) {
    if (!defaultLoadoutText) {
        return { raw: "", parsed: [] };
    }

    const parsed = parseDefaultLoadout(defaultLoadoutText, unitComposition);

    if (parsed.length > 0) {
        const ids = parsed[0].items.map((name) => resolveNameToId(name, weapons, abilities, datasheetId));
        return { raw: defaultLoadoutText, parsed: ids };
    }

    return { raw: defaultLoadoutText, parsed: [] };
}

// ============================================================================
// LOADOUT GENERATION
// ============================================================================

function loadoutContainsAll(loadout, itemNames, weapons, abilities, datasheetId) {
    for (const name of itemNames) {
        const id = resolveNameToId(name, weapons, abilities, datasheetId);
        if (!loadout.includes(id)) {
            return false;
        }
    }
    return true;
}

function applyReplacement(loadout, removes, adds, weapons, abilities, datasheetId) {
    let newLoadout = [...loadout];

    for (const ref of removes) {
        const name = typeof ref === "string" ? ref : ref.name;
        const id = resolveNameToId(name, weapons, abilities, datasheetId);
        newLoadout = newLoadout.filter((item) => item !== id);
    }

    for (const ref of adds) {
        const name = typeof ref === "string" ? ref : ref.name;
        const isAbility = typeof ref === "object" && ref.isAbility;
        const id = isAbility ? `wargear-ability:${name.toLowerCase().trim().replace(/\s+/g, "-")}` : resolveNameToId(name, weapons, abilities, datasheetId);
        if (!newLoadout.includes(id)) {
            newLoadout.push(id);
        }
    }

    return newLoadout;
}

function deduplicateLoadouts(loadouts) {
    const seen = new Set();
    return loadouts.filter((loadout) => {
        const key = [...loadout].sort().join("|");
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

/**
 * Check if two model type names match.
 * Handles pluralization (e.g., "Terminator" matches "Terminators")
 * but does NOT do substring matching (e.g., "Terminator" should NOT match "Terminator Sergeant")
 */
function modelTypesMatch(typeA, typeB) {
    const a = typeA.toLowerCase().trim();
    const b = typeB.toLowerCase().trim();

    // Exact match
    if (a === b) return true;

    // Plural handling: "terminator" matches "terminators"
    if (a === b + "s" || a + "s" === b) return true;

    return false;
}

function targetingAppliesToModel(targeting, modelType) {
    switch (targeting.type) {
        case "this-model":
        case "all-models":
        case "any-number":
        case "this-unit":
            return true;

        case "specific-model":
        case "each-model-type":
        case "n-model-specific":
            if (targeting.modelType) {
                return modelTypesMatch(targeting.modelType, modelType);
            }
            return false;

        case "conditional":
            return true;

        case "ratio":
        case "ratio-capped":
            if (targeting.modelType) {
                return modelTypesMatch(targeting.modelType, modelType);
            }
            return true;

        case "up-to-n":
            return true;

        default:
            return true;
    }
}

function getTargetingForModelType(modelType, options) {
    for (const option of options) {
        if (!option.wargearParsed) continue;

        const targeting = option.targeting;

        if (targeting.type === "ratio" || targeting.type === "ratio-capped") {
            if (targetingAppliesToModel(targeting, modelType)) {
                return {
                    type: "ratio",
                    ratio: targeting.ratio,
                    count: targeting.count || 1,
                    ...(targeting.maxPerRatio && { maxPerRatio: targeting.maxPerRatio }),
                };
            }
        }

        if (targeting.type === "up-to-n") {
            if (targetingAppliesToModel(targeting, modelType)) {
                return { type: "up-to-n", max: targeting.maxTotal };
            }
        }

        if (targeting.type === "n-model-specific") {
            if (targetingAppliesToModel(targeting, modelType)) {
                return { type: "n-model-specific", count: targeting.count };
            }
        }
    }

    return null;
}

function conditionMet(condition, loadout, weapons, abilities, datasheetId) {
    if (!condition) return true;

    if (condition.type === "equipped-with") {
        if (condition.weaponName) {
            const cleanName = condition.weaponName.replace(/^(a |an )/i, "").trim();
            const id = resolveNameToId(cleanName, weapons, abilities, datasheetId);
            return loadout.includes(id);
        }

        if (condition.weaponNames && Array.isArray(condition.weaponNames)) {
            return condition.weaponNames.every((name) => {
                const cleanName = name.replace(/^(a |an )/i, "").trim();
                const id = resolveNameToId(cleanName, weapons, abilities, datasheetId);
                return loadout.includes(id);
            });
        }
    }

    return true;
}

function generateLoadoutsForModelType(modelType, baseLoadout, options, weapons, abilities, datasheetId) {
    let loadouts = [baseLoadout];

    for (const option of options) {
        if (!option.wargearParsed) continue;
        if (option.action.type === "unknown") continue;
        if (!targetingAppliesToModel(option.targeting, modelType)) continue;

        const newLoadouts = [];

        for (const loadout of loadouts) {
            if (option.targeting.type === "conditional") {
                if (!conditionMet(option.targeting.condition, loadout, weapons, abilities, datasheetId)) {
                    newLoadouts.push(loadout);
                    continue;
                }
            }

            if (option.action.type === "replace") {
                const removeNames = option.action.removes.map((r) => r.name);

                if (loadoutContainsAll(loadout, removeNames, weapons, abilities, datasheetId)) {
                    newLoadouts.push(loadout);

                    for (const choice of option.action.adds) {
                        const newLoadout = applyReplacement(loadout, option.action.removes, choice.weapons, weapons, abilities, datasheetId);
                        newLoadouts.push(newLoadout);
                    }
                } else {
                    newLoadouts.push(loadout);
                }
            } else if (option.action.type === "add") {
                const isUnconditionalAdd = option.targeting.type !== "conditional";

                if (isUnconditionalAdd) {
                    newLoadouts.push(loadout);
                } else {
                    newLoadouts.push(loadout);

                    for (const choice of option.action.adds) {
                        const addItems = choice.weapons.map((ref) => {
                            const isAbility = ref.isAbility;
                            return isAbility ? `wargear-ability:${ref.name.toLowerCase().trim().replace(/\s+/g, "-")}` : resolveNameToId(ref.name, weapons, abilities, datasheetId);
                        });

                        const newLoadout = [...loadout, ...addItems.filter((id) => !loadout.includes(id))];
                        newLoadouts.push(newLoadout);
                    }
                }
            }
        }

        loadouts = deduplicateLoadouts(newLoadouts);
    }

    return loadouts;
}

// ============================================================================
// WEAPON ELIGIBILITY GENERATION
// ============================================================================

/**
 * Compute eligibility rules for each weapon based on parsed options.
 *
 * This determines which models can see/select each weapon:
 * - Weapons in the default loadout get { type: "any" }
 * - Weapons only available via model-specific options get { type: "modelType", modelType: [...] }
 * - Weapons with ratio constraints get { type: "ratio", ratio: N, count: M, modelType?: [...] }
 */
function computeWeaponEligibility(datasheet, parsedOptions) {
    const weapons = datasheet.wargear?.weapons || [];
    const defaultLoadout = datasheet.wargear?.defaultLoadout?.parsed || [];
    const datasheetId = datasheet.id;

    // Track eligibility info per weapon
    // Key: weapon ID, Value: { modelTypes: Set, ratio: { ratio, count } | null, isDefault: boolean }
    const eligibilityMap = new Map();

    // Initialize all weapons
    for (const weapon of weapons) {
        eligibilityMap.set(weapon.id, {
            modelTypes: new Set(),
            ratio: null,
            isDefault: defaultLoadout.includes(weapon.id),
        });
    }

    // Process each parsed option to extract eligibility info
    for (const option of parsedOptions) {
        if (!option.wargearParsed) continue;
        if (option.action.type === "unknown") continue;

        const targeting = option.targeting;
        const action = option.action;

        // Get weapon IDs that this option adds
        const addedWeaponIds = new Set();
        if (action.adds && Array.isArray(action.adds)) {
            for (const choice of action.adds) {
                if (choice.weapons && Array.isArray(choice.weapons)) {
                    for (const ref of choice.weapons) {
                        const name = ref.name;
                        const matchingWeapon = weapons.find((w) => w.name.toLowerCase().trim() === name.toLowerCase().trim());
                        if (matchingWeapon) {
                            addedWeaponIds.add(matchingWeapon.id);
                        }
                    }
                }
            }
        }

        if (addedWeaponIds.size === 0) continue;

        // Determine eligibility based on targeting type
        for (const weaponId of addedWeaponIds) {
            const eligibility = eligibilityMap.get(weaponId);
            if (!eligibility) continue;

            switch (targeting.type) {
                case "any-number":
                case "all-models":
                case "this-unit":
                case "this-model":
                    // Available to all models - mark as "any" by adding a special marker
                    eligibility.modelTypes.add("*any*");
                    break;

                case "specific-model":
                case "each-model-type":
                case "n-model-specific":
                    // Only specific model types
                    if (targeting.modelType) {
                        eligibility.modelTypes.add(targeting.modelType);
                    }
                    break;

                case "ratio":
                case "ratio-capped":
                    // Ratio-based targeting
                    eligibility.ratio = {
                        ratio: targeting.ratio || 5,
                        count: targeting.count || 1,
                    };
                    // If there's a model type restriction, add it
                    if (targeting.modelType) {
                        eligibility.modelTypes.add(targeting.modelType);
                    }
                    break;

                case "up-to-n":
                    // Up to N models can take this - treat similar to ratio for now
                    // but without the ratio calculation
                    eligibility.modelTypes.add("*any*");
                    break;

                case "conditional":
                    // Conditional targeting - for now treat as available to all
                    eligibility.modelTypes.add("*any*");
                    break;

                default:
                    // Unknown - assume available to all
                    eligibility.modelTypes.add("*any*");
                    break;
            }
        }
    }

    // Convert eligibility map to the final eligibility array format for each weapon
    for (const weapon of weapons) {
        const eligibility = eligibilityMap.get(weapon.id);
        if (!eligibility) {
            weapon.eligibility = [{ type: "any" }];
            continue;
        }

        const rules = [];

        // If it's a default weapon or has "*any*" marker, it's available to all
        if (eligibility.isDefault || eligibility.modelTypes.has("*any*")) {
            rules.push({ type: "any" });
        } else if (eligibility.ratio) {
            // Ratio-based eligibility
            const rule = {
                type: "ratio",
                ratio: eligibility.ratio.ratio,
                count: eligibility.ratio.count,
            };
            // Add model type restriction if present (excluding the *any* marker)
            const realModelTypes = [...eligibility.modelTypes].filter((t) => t !== "*any*");
            if (realModelTypes.length > 0) {
                rule.modelType = realModelTypes;
            }
            rules.push(rule);
        } else if (eligibility.modelTypes.size > 0) {
            // Model type specific
            const realModelTypes = [...eligibility.modelTypes].filter((t) => t !== "*any*");
            if (realModelTypes.length > 0) {
                rules.push({ type: "modelType", modelType: realModelTypes });
            } else {
                rules.push({ type: "any" });
            }
        } else {
            // No eligibility info found - default to "any" if no options reference it
            // This handles weapons that exist but aren't mentioned in options
            rules.push({ type: "any" });
        }

        weapon.eligibility = rules;
    }
}

// ============================================================================
// LOADOUT CONSTRAINT APPLICATION
// ============================================================================

function applyConstraints(loadouts, options, weapons, abilities, datasheetId) {
    const allConstraints = { mutuallyExclusive: [], maxWeaponCount: [] };

    for (const option of options) {
        if (option.constraints) {
            if (option.constraints.mutuallyExclusive) {
                allConstraints.mutuallyExclusive.push(...option.constraints.mutuallyExclusive);
            }
            if (option.constraints.maxWeaponCount) {
                allConstraints.maxWeaponCount.push(...option.constraints.maxWeaponCount);
            }
        }
    }

    return loadouts.filter((loadout) => {
        for (const [a, b] of allConstraints.mutuallyExclusive) {
            const idA = resolveNameToId(a, weapons, abilities, datasheetId);
            const idB = resolveNameToId(b, weapons, abilities, datasheetId);
            if (loadout.includes(idA) && loadout.includes(idB)) return false;
        }

        for (const { weapon, max } of allConstraints.maxWeaponCount) {
            const id = resolveNameToId(weapon, weapons, abilities, datasheetId);
            const count = loadout.filter((item) => item === id).length;
            if (count > max) return false;
        }

        return true;
    });
}

function generateValidLoadouts(datasheet, parsedOptions) {
    const weapons = datasheet.wargear?.weapons || [];
    const abilities = datasheet.wargear?.abilities || [];
    const datasheetId = datasheet.id;

    const modelTypes = getModelTypes(datasheet.unitComposition);

    const rawDefaultLoadout = datasheet.wargear?.defaultLoadout;
    const defaultLoadoutText = typeof rawDefaultLoadout === "string" ? rawDefaultLoadout : rawDefaultLoadout?.raw || "";

    const defaultLoadouts = parseDefaultLoadout(defaultLoadoutText, datasheet.unitComposition);

    const loadoutsByModelType = new Map();
    const sharedLoadouts = new Map();

    for (const { modelType } of modelTypes) {
        let baseLoadout = defaultLoadouts.find((dl) => {
            const dlType = dl.modelType.toLowerCase();
            const mtType = modelType.toLowerCase();
            return dlType === mtType || dlType.includes(mtType) || mtType.includes(dlType) || dlType === mtType + "s" || dlType + "s" === mtType;
        });

        if (!baseLoadout && defaultLoadouts.length > 0) {
            baseLoadout = defaultLoadouts[0];
        }

        if (!baseLoadout) continue;

        const baseLoadoutIds = baseLoadout.items.map((name) => resolveNameToId(name, weapons, abilities, datasheetId));

        let loadouts = generateLoadoutsForModelType(modelType, baseLoadoutIds, parsedOptions, weapons, abilities, datasheetId);
        loadouts = applyConstraints(loadouts, parsedOptions, weapons, abilities, datasheetId);

        loadoutsByModelType.set(modelType, {
            loadouts,
            targeting: getTargetingForModelType(modelType, parsedOptions),
        });

        for (const loadout of loadouts) {
            const key = [...loadout].sort().join("|");
            sharedLoadouts.set(key, (sharedLoadouts.get(key) || 0) + 1);
        }
    }

    const result = [];
    const totalModelTypes = modelTypes.length;

    const anyLoadouts = [];
    const modelTypeSpecificLoadouts = new Map();

    for (const [modelType, data] of loadoutsByModelType) {
        const specificLoadouts = [];

        for (const loadout of data.loadouts) {
            const key = [...loadout].sort().join("|");
            const sharedCount = sharedLoadouts.get(key) || 0;

            if (sharedCount === totalModelTypes && totalModelTypes > 1) {
                if (!anyLoadouts.some((l) => [...l].sort().join("|") === key)) {
                    anyLoadouts.push(loadout);
                }
            } else {
                specificLoadouts.push(loadout);
            }
        }

        if (specificLoadouts.length > 0) {
            modelTypeSpecificLoadouts.set(modelType, { loadouts: specificLoadouts, targeting: data.targeting });
        }
    }

    if (anyLoadouts.length > 0) {
        result.push({ modelType: "any", items: anyLoadouts });
    }

    for (const [modelType, data] of modelTypeSpecificLoadouts) {
        // Note: targeting is now on weapons via eligibility, not on validLoadouts
        result.push({ modelType, items: data.loadouts });
    }

    if (result.length === 1 && result[0].modelType !== "any") {
        result[0].modelType = "any";
    }

    return result;
}

// ============================================================================
// FILE PROCESSING
// ============================================================================

function hasWargearOptions(datasheet) {
    const rawOptions = datasheet.wargear?.options?.raw || [];
    if (rawOptions.length === 0) return false;

    return rawOptions.some((opt) => {
        const desc = (opt.description || "").trim().toLowerCase();
        if (desc === "none" || desc === "none.") return false;
        if (desc.startsWith("*")) return false;
        return true;
    });
}

function processDatasheetFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, "utf-8");
        const datasheet = JSON.parse(content);

        if (!datasheet.wargear) {
            return { modified: false, loadouts: 0, noOptions: true };
        }

        const weapons = datasheet.wargear.weapons || [];
        const abilities = datasheet.wargear.abilities || [];

        // Update defaultLoadout structure
        const oldDefaultLoadout = datasheet.wargear.defaultLoadout;
        const defaultLoadoutRaw = typeof oldDefaultLoadout === "string" ? oldDefaultLoadout : oldDefaultLoadout?.raw || "";
        datasheet.wargear.defaultLoadout = parseDefaultLoadoutStructured(defaultLoadoutRaw, weapons, abilities, datasheet.id, datasheet.unitComposition);

        // Parse options from raw (internally, not persisted)
        let parsedOptions = [];
        if (datasheet.wargear.options?.raw) {
            parsedOptions = parseAllOptions(datasheet.wargear.options.raw);
            parsedOptions = parsedOptions.map((opt) => resolveOptionReferences(opt, weapons, abilities));
        }

        // Check if all options were parsed
        const allOptionsParsed = parsedOptions.length === 0 || parsedOptions.every((o) => o.wargearParsed);

        // Compute weapon eligibility (which models can see/select each weapon)
        computeWeaponEligibility(datasheet, parsedOptions);

        // Skip loadout generation if no real options
        if (!hasWargearOptions(datasheet)) {
            datasheet.wargear.validLoadouts = [];
            datasheet.wargear.loadoutsParsed = true;
            // Clean up any old parsed data
            if (datasheet.wargear.options) {
                delete datasheet.wargear.options.parsed;
                delete datasheet.wargear.options.allParsed;
            }
            fs.writeFileSync(filePath, JSON.stringify(datasheet, null, 2), "utf-8");
            return { modified: true, loadouts: 0, noOptions: true };
        }

        // Generate valid loadouts (for validation only - targeting is now on weapons)
        const validLoadouts = generateValidLoadouts(datasheet, parsedOptions);
        datasheet.wargear.validLoadouts = validLoadouts;

        // Count total loadouts
        const totalLoadouts = validLoadouts.reduce((sum, group) => sum + group.items.length, 0);

        // Set flag: true only if options were parsed AND loadouts were generated
        datasheet.wargear.loadoutsParsed = allOptionsParsed && totalLoadouts > 0;

        // Clean up any old parsed data (not needed in output)
        if (datasheet.wargear.options) {
            delete datasheet.wargear.options.parsed;
            delete datasheet.wargear.options.allParsed;
        }

        fs.writeFileSync(filePath, JSON.stringify(datasheet, null, 2), "utf-8");

        return { modified: true, loadouts: totalLoadouts, groups: validLoadouts.length, allParsed: allOptionsParsed };
    } catch (error) {
        console.error(`Error processing ${filePath}:`, error.message);
        return { modified: false, error: error.message };
    }
}

function findDatasheetFiles(dir) {
    const files = [];

    function walk(currentDir) {
        const entries = fs.readdirSync(currentDir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(currentDir, entry.name);

            if (entry.isDirectory()) {
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
    console.log("  Generate Valid Loadouts");
    console.log("═".repeat(60));
    console.log("");

    const outputPath = path.join(__dirname, "..", "..", "src", "app", "data", "output", "factions");

    if (!fs.existsSync(outputPath)) {
        console.error(`❌ Output directory not found: ${outputPath}`);
        process.exit(1);
    }

    const datasheetFiles = findDatasheetFiles(outputPath);
    console.log(`📁 Found ${datasheetFiles.length} datasheet files to process`);
    console.log(`📂 Source: ${outputPath}`);
    console.log("");

    let totalModified = 0;
    let totalLoadouts = 0;
    let totalErrors = 0;
    let totalNoOptions = 0;
    let totalUnparsed = 0;
    const anomalies = { zeroLoadouts: [], highLoadouts: [] };

    for (let i = 0; i < datasheetFiles.length; i++) {
        const filePath = datasheetFiles[i];
        const relativePath = path.relative(outputPath, filePath);

        const result = processDatasheetFile(filePath);

        if (result.error) {
            totalErrors++;
            console.log(`❌ [${i + 1}/${datasheetFiles.length}] Error: ${relativePath}`);
        } else if (result.noOptions) {
            totalNoOptions++;
        } else if (result.modified) {
            totalModified++;
            totalLoadouts += result.loadouts;

            if (!result.allParsed) {
                totalUnparsed++;
            }

            if (result.loadouts === 0) {
                anomalies.zeroLoadouts.push(relativePath);
            } else if (result.loadouts > 100) {
                anomalies.highLoadouts.push({ path: relativePath, count: result.loadouts });
            }

            if ((i + 1) % 100 === 0) {
                console.log(`   Processed ${i + 1}/${datasheetFiles.length} files...`);
            }
        }
    }

    console.log("");
    console.log("═".repeat(60));
    console.log("📊 Summary:");
    console.log(`   📄 Files processed: ${datasheetFiles.length}`);
    console.log(`   ⏭️  Skipped (no options): ${totalNoOptions}`);
    console.log(`   ✏️  With loadouts generated: ${totalModified}`);
    console.log(`   📦 Total loadouts generated: ${totalLoadouts}`);
    if (totalModified > 0) {
        console.log(`   📈 Average loadouts per datasheet: ${(totalLoadouts / totalModified).toFixed(1)}`);
    }
    if (totalUnparsed > 0) {
        console.log(`   ⚠️  Datasheets with unparsed options: ${totalUnparsed}`);
    }
    if (totalErrors > 0) {
        console.log(`   ❌ Errors: ${totalErrors}`);
    }
    console.log("═".repeat(60));

    if (anomalies.zeroLoadouts.length > 0) {
        console.log("");
        console.log("⚠️  Datasheets with 0 loadouts:");
        anomalies.zeroLoadouts.slice(0, 10).forEach((p) => console.log(`   - ${p}`));
        if (anomalies.zeroLoadouts.length > 10) {
            console.log(`   ... and ${anomalies.zeroLoadouts.length - 10} more`);
        }
    }

    if (anomalies.highLoadouts.length > 0) {
        console.log("");
        console.log("⚠️  Datasheets with >100 loadouts (may indicate bug):");
        anomalies.highLoadouts.slice(0, 10).forEach(({ path, count }) => console.log(`   - ${path}: ${count} loadouts`));
    }
}

main().catch(console.error);
