/**
 * Test script for wargear parser
 *
 * Runs the parser against all datasheet options to validate coverage.
 * Run with: node scripts/test-wargear-parser.js
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import parser patterns (we'll manually implement the matching logic here
// since this is a Node script, not TypeScript)

const TARGETING_PATTERNS = [
    { name: "none", pattern: /^none\.?$/i },
    { name: "footnote", pattern: /^\*\s/ },
    {
        name: "if-unit-size",
        pattern: /^if this unit contains (?:between )?(\d+)(?: and \d+)? models/i,
    },
    {
        name: "if-unit-size-threshold",
        pattern: /^if this unit contains (\d+) or (?:more|fewer) models/i,
    },
    {
        name: "if-model-equipped",
        pattern: /^if this unit'?s?\s+(.+?)\s+is equipped with/i,
    },
    {
        name: "conditional-equipped",
        pattern: /^if (?:this model is )?equipped with (.+?),/i,
    },
    { name: "this-unit", pattern: /^this unit can be equipped/i },
    { name: "all-models", pattern: /^all (?:of the )?models in this unit/i },
    {
        name: "ratio-capped",
        pattern: /^for every (\d+) models in (?:this|the) unit,? (?:.*?)up to (\d+)/i,
    },
    { name: "ratio", pattern: /^for every (\d+) models/i },
    { name: "any-number", pattern: /^any number of (?:models|[\w\s]+)/i },
    {
        name: "up-to-n",
        pattern: /^up to (\d+|one|two|three|four|five|six|seven|eight|nine|ten)/i,
    },
    { name: "each-model-type", pattern: /^each ([\w\s]+?)(?:'s|'s|\s+can)/i },
    {
        name: "specific-model-dual",
        pattern: /^the ([\w\s]+?)'s\s+(.+?)\s+and\s+(.+?)\s+can be replaced/i,
    },
    { name: "specific-model", pattern: /^the ([\w\s]+?)(?:'s|'s|\s+can)/i },
    {
        name: "n-model-specific",
        pattern: /^(\d+|one|two|three|four|five|six|seven|eight|nine|ten)\s+([\w\s]+?)(?:'s|'s|\s+can|\s+(?:model\s+)?(?:already\s+)?equipped)/i,
    },
    { name: "this-model", pattern: /^this model(?:'s|'s|\s+can)?/i },
];

const ACTION_PATTERNS = [
    {
        name: "replace-with-choice",
        pattern: /can be replaced with one of the following/i,
    },
    {
        name: "equip-with-choice",
        pattern: /can be equipped with one of the following/i,
    },
    {
        name: "equip-up-to",
        pattern: /can be equipped with up to (\d+) of the following/i,
    },
    {
        name: "equip-with-list",
        pattern: /can be equipped with[:\s]*<ul>/i,
    },
    {
        name: "replace-multiple-with",
        pattern: /(.+?)\s+and\s+(.+?)\s+can be replaced with/i,
    },
    {
        name: "replace-with-package",
        pattern: /can be replaced with\s+(\d+)\s+(.+?)\s+and\s+(\d+)\s+/i,
    },
    {
        name: "replace-with-single",
        pattern: /can be replaced with\s+(\d+)\s+/i,
    },
    {
        name: "equip-with-single",
        pattern: /can be equipped with\s+(\d+)\s+/i,
    },
    {
        name: "have-replaced-with",
        pattern: /can (?:each )?have (?:their|its)\s+(.+?)\s+replaced with/i,
    },
    { name: "have-token", pattern: /it can have\s+(\d+)\s+/i },
];

function matchTargeting(text) {
    for (const { name, pattern } of TARGETING_PATTERNS) {
        if (pattern.test(text)) {
            return name;
        }
    }
    return "unknown";
}

function matchAction(text) {
    for (const { name, pattern } of ACTION_PATTERNS) {
        if (pattern.test(text)) {
            return name;
        }
    }
    return "unknown";
}

// Load all datasheets
const factionsDir = path.join(__dirname, "../src/app/data/output/factions");

const results = {
    total: 0,
    parsed: 0,
    unparsed: 0,
    targetingCounts: {},
    actionCounts: {},
    unparsedExamples: [],
};

function processDatasheet(filePath, factionSlug) {
    try {
        const content = fs.readFileSync(filePath, "utf-8");
        const datasheet = JSON.parse(content);

        if (!datasheet.options || datasheet.options.length === 0) return;

        for (const option of datasheet.options) {
            const text = option.description.trim();
            results.total++;

            const targeting = matchTargeting(text);
            const action = matchAction(text);

            results.targetingCounts[targeting] = (results.targetingCounts[targeting] || 0) + 1;
            results.actionCounts[action] = (results.actionCounts[action] || 0) + 1;

            if (targeting === "unknown" || action === "unknown") {
                results.unparsed++;
                if (results.unparsedExamples.length < 20) {
                    results.unparsedExamples.push({
                        unit: datasheet.name,
                        faction: factionSlug,
                        text: text.substring(0, 100),
                        targeting,
                        action,
                    });
                }
            } else {
                results.parsed++;
            }
        }
    } catch (e) {
        // Skip invalid files
    }
}

// Process all factions
const factions = fs.readdirSync(factionsDir);
for (const faction of factions) {
    const datasheetsDir = path.join(factionsDir, faction, "datasheets");
    if (!fs.existsSync(datasheetsDir)) continue;

    const datasheets = fs.readdirSync(datasheetsDir);
    for (const file of datasheets) {
        if (!file.endsWith(".json")) continue;
        processDatasheet(path.join(datasheetsDir, file), faction);
    }
}

// Print results
console.log("\n=== WARGEAR PARSER TEST RESULTS ===\n");
console.log(`Total options: ${results.total}`);
console.log(`Successfully parsed: ${results.parsed} (${((results.parsed / results.total) * 100).toFixed(1)}%)`);
console.log(`Failed to parse: ${results.unparsed} (${((results.unparsed / results.total) * 100).toFixed(1)}%)`);

console.log("\n--- Targeting Pattern Counts ---");
const sortedTargeting = Object.entries(results.targetingCounts).sort((a, b) => b[1] - a[1]);
for (const [name, count] of sortedTargeting) {
    console.log(`  ${name}: ${count}`);
}

console.log("\n--- Action Pattern Counts ---");
const sortedActions = Object.entries(results.actionCounts).sort((a, b) => b[1] - a[1]);
for (const [name, count] of sortedActions) {
    console.log(`  ${name}: ${count}`);
}

if (results.unparsedExamples.length > 0) {
    console.log("\n--- Unparsed Examples ---");
    for (const ex of results.unparsedExamples) {
        console.log(`  [${ex.faction}] ${ex.unit}:`);
        console.log(`    "${ex.text}..."`);
        console.log(`    targeting: ${ex.targeting}, action: ${ex.action}`);
    }
}

console.log("\n=== END ===\n");
