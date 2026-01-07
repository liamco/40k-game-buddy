/**
 * Mechanic Schema Values for OpenAI Prompt Generation
 *
 * IMPORTANT: This file should mirror the values in src/app/game-engine/mechanic-schema.ts
 * If you update the TypeScript schema, update this file as well.
 *
 * TODO: Consider auto-generating this file from the TypeScript source.
 */

// ============================================
// ENTITY VALUES
// ============================================

export const ENTITIES = [
    "thisArmy",      // The unit/model's army
    "thisUnit",      // The unit itself
    "thisModel",     // A specific model
    "opponentArmy",  // The opponent's army
    "opposingUnit",  // A unit from the opponent's army
    "opposingModel", // A model from the opponent's army
    "targetUnit",    // The unit being targeted (attacked)
    "targetModel",   // The model being targeted
];

// ============================================
// EFFECT VALUES
// ============================================

export const EFFECTS = [
    "rollBonus",    // Add to a roll (positive modifier)
    "rollPenalty",  // Subtract from a roll (negative modifier)
    "staticNumber", // Set a characteristic to a fixed value
    "addsKeyword",  // Grant keywords to an entity
    "addsAbility",  // Grant abilities to an entity
    "reroll",       // Allow re-rolling dice
    "autoSuccess",  // Auto-succeed (e.g., auto-hit from TORRENT)
    "mortalWounds", // Deal mortal wounds
];

// ============================================
// ATTRIBUTE VALUES
// ============================================

export const ROLL_ATTRIBUTES = [
    "h", // Hit rolls
    "w", // Wound rolls
    "s", // Save rolls
];

export const UNIT_ATTRIBUTES = [
    "m",     // Movement
    "t",     // Toughness
    "sv",    // Save
    "invSv", // Invulnerable Save
    "w",     // Wounds
    "ld",    // Leadership
    "oc",    // Objective Control
];

export const WEAPON_ATTRIBUTES = [
    "range", // Weapon range
    "a",     // Attacks
    "bsWs",  // Ballistic Skill / Weapon Skill
    "s",     // Strength
    "ap",    // Armour Penetration
    "d",     // Damage
];

export const ATTRIBUTES = [...ROLL_ATTRIBUTES, ...UNIT_ATTRIBUTES, ...WEAPON_ATTRIBUTES];

// ============================================
// OPERATOR VALUES
// ============================================

export const OPERATORS = [
    "equals",
    "notEquals",
    "greaterThan",
    "greaterThanOrEqualTo",
    "lessThan",
    "lessThanOrEqualTo",
    "includes",    // For array checks (keywords, abilities)
    "notIncludes",
];

// ============================================
// COMBAT STATUS FLAGS
// ============================================

export const COMBAT_STATUS_FLAGS = [
    { name: "isStationary", label: "Stationary" },
    { name: "inCover", label: "In Cover" },
    { name: "inEngagementRange", label: "In Engagement Range" },
    { name: "inRangeOfObjective", label: "In Range of Objective" },
    { name: "inRangeOfContestedObjective", label: "In Range of Contested Objective" },
    { name: "inRangeOfFriendlyObjective", label: "In Range of Friendly Objective" },
    { name: "inRangeOfEnemyObjective", label: "In Range of Enemy Objective" },
    { name: "isBattleShocked", label: "Battle-shocked" },
    { name: "hasFiredThisPhase", label: "Fired This Phase" },
    { name: "hasChargedThisTurn", label: "Charged This Turn" },
    { name: "isBelowHalfStrength", label: "Below Half Strength" },
    { name: "isBelowStartingStrength", label: "Below Starting Strength" },
    { name: "isDamaged", label: "Damaged (Bracketed)" },
    { name: "isLeadingUnit", label: "Leading a Unit" },
    { name: "isBeingLed", label: "Being Led" },
];

// ============================================
// HELPER FUNCTIONS FOR PROMPT GENERATION
// ============================================

/**
 * Generates the entity documentation for the OpenAI prompt.
 */
export function generateEntityDocs() {
    const entityDescriptions = {
        thisArmy: "the unit/model's army",
        thisUnit: "the unit itself",
        thisModel: "this specific model",
        opponentArmy: "the opponent's army",
        opposingUnit: "a unit from the opponent's army",
        opposingModel: "a model from the opponent's army",
        targetUnit: "the unit being targeted (attacked)",
        targetModel: "the model being targeted",
    };

    return ENTITIES.map(e => `  * "${e}" - ${entityDescriptions[e] || e}`).join('\n');
}

/**
 * Generates the effect documentation for the OpenAI prompt.
 */
export function generateEffectDocs() {
    const effectDescriptions = {
        rollBonus: "adds a value to a dice roll",
        rollPenalty: "subtracts a value from a dice roll",
        staticNumber: "sets a static number for a roll or a characteristic value",
        addsKeyword: "adds a keyword to the entity",
        addsAbility: "adds an ability to the entity",
        reroll: "allows re-rolling dice (value: 'ones', 'failed', or 'all')",
        autoSuccess: "automatically succeeds (e.g., auto-hit from TORRENT)",
        mortalWounds: "deals mortal wounds",
    };

    return EFFECTS.map(e => `  * "${e}" - ${effectDescriptions[e] || e}`).join('\n');
}

/**
 * Generates the attribute documentation for the OpenAI prompt.
 */
export function generateAttributeDocs() {
    const attrDescriptions = {
        h: "Hit rolls",
        w: "Wound rolls",
        s: "Save rolls",
        m: "Movement characteristic",
        t: "Toughness characteristic",
        sv: "Save characteristic",
        invSv: "Invulnerable Save characteristic",
        ld: "Leadership characteristic",
        oc: "Objective Control characteristic",
        range: "Weapon range",
        a: "Attacks characteristic",
        bsWs: "Ballistic Skill / Weapon Skill",
        ap: "Armour Penetration characteristic",
        d: "Damage characteristic",
    };

    return ATTRIBUTES.map(a => `  * "${a}" - ${attrDescriptions[a] || a}`).join('\n');
}

/**
 * Generates the state documentation for the OpenAI prompt.
 */
export function generateStateDocs() {
    return COMBAT_STATUS_FLAGS.map(s => `  * "${s.name}" - ${s.label}`).join('\n');
}

/**
 * Generates the operator documentation for the OpenAI prompt.
 */
export function generateOperatorDocs() {
    return OPERATORS.map(o => `"${o}"`).join(', ');
}

/**
 * Builds the complete OpenAI prompt with schema values.
 */
export function buildMechanicsPrompt(cleanDescription) {
    return `Analyze the following Warhammer 40k game rule description and extract structured mechanics in JSON format.

Description: "${cleanDescription}"

Extract all mechanics including dice roll modifiers (hit, wound, save, damage, AP), defensive abilities (Feel No Pain, invulnerable saves), keyword additions, and ability additions. Return them as a JSON array following this exact structure:

"mechanics": [ {
  entity:<what does this mechanic target>,
  effect:<what does this mechanic do>,
  attribute?: <any base attributes this mechanic can modify>,
  abilities?: <any abilities this mechanic can add>,
  keywords?: <any keywords this mechanic can add>,
  state?: <information about the state of the entity>,
  value: <a boolean, number, or string value>,
  conditions: [
    {
      entity:<what entity does this condition rely on>,
      attribute?: <any base attributes this condition needs to check>,
      abilities?: <any abilities this condition needs to check>,
      state?: <any states this condition needs to check>,
      keywords?: <any keywords this condition needs to check>,
      operator: <how to compare the value to the condition>,
      value: <can be a boolean, number, or string>,
    }
  ]
} ]

Rules:

- "entity" must be one of:
${generateEntityDocs()}

- "effect" must be one of:
${generateEffectDocs()}

- "attribute" must be one of:
${generateAttributeDocs()}

- "state" (for conditions) must be one of:
${generateStateDocs()}

- "keywords" is optional - only include if the mechanic adds a keyword to the entity
- "keywords" should be an array of strings (e.g., ["INFANTRY", "CHARACTER"])

- "abilities" is optional - only include if the mechanic adds an ability to the entity
- "abilities" should be an array of strings (e.g., ["DEEP STRIKE", "STEALTH"])

- "value" should usually be an integer (even if it's negative), but can be a string e.g. "D3", "2D6"

- "conditions" is optional - only include if the mechanic needs specific conditions to trigger (e.g., "if target is battle-shocked", "while leading a unit")

- "conditions.operator" must be one of: ${generateOperatorDocs()}

Special cases:
- Saving throw modifications: The higher the number, the worse the save. A roll bonus should be a negative number and a roll penalty should be a positive number.
- When adding an ability which carries a number e.g. "SUSTAINED HITS 1" or "FEEL NO PAIN 5+", the value should be the number as an integer.
- The ability "Leader" can be completely ignored
- If an ability requires a dice roll such as D3, D6, 2D6, etc, add that to the value exactly as it is written.
- For reroll effects, the value should be "ones", "failed", or "all"

Examples:
- "this model gets +1 to Hit rolls" → {entity:"thisModel", effect:"rollBonus", attribute:"h", value:1}
- "this model gets a 5+ Feel No Pain" → {entity:"thisModel", effect:"addsAbility", abilities:["FEEL NO PAIN"], value:5}
- "this model gets a 4+ invulnerable save" → {entity:"thisModel", effect:"staticNumber", attribute:"invSv", value:4}
- "+1 to Wound if target is battle-shocked" → {entity:"thisModel", effect:"rollBonus", attribute:"w", value:1, conditions:[{entity:"targetUnit", state:"isBattleShocked", operator:"equals", value:true}]}
- "gains the INFANTRY keyword" → {entity:"thisModel", effect:"addsKeyword", keywords:["INFANTRY"]}
- "has the Deep Strike ability" → {entity:"thisModel", effect:"addsAbility", abilities:["DEEP STRIKE"]}
- "While this model is leading a unit, add 1 to Hit rolls" → {entity:"thisUnit", effect:"rollBonus", attribute:"h", value:1, conditions:[{entity:"thisUnit", state:"isLeadingUnit", operator:"equals", value:true}]}
- "re-roll hit rolls of 1" → {entity:"thisUnit", effect:"reroll", attribute:"h", value:"ones"}
- "automatically hits" → {entity:"thisUnit", effect:"autoSuccess", attribute:"h", value:true}

If no mechanics are found, return: {"mechanics": []}`;
}
