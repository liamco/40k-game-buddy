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
    "thisArmy", // The unit/model's army
    "thisUnit", // The unit itself
    "thisModel", // A specific model
    "opponentArmy", // The opponent's army
    "opposingUnit", // A unit from the opponent's army
    "opposingModel", // A model from the opponent's army
    "targetUnit", // The unit being targeted (attacked)
    "targetModel", // The model being targeted
];

// ============================================
// EFFECT VALUES
// ============================================

export const EFFECTS = [
    "rollBonus", // Add to a roll (positive modifier)
    "rollPenalty", // Subtract from a roll (negative modifier)
    "staticNumber", // Set a characteristic to a fixed value
    "addsKeyword", // Grant keywords to an entity
    "addsAbility", // Grant abilities to an entity
    "reroll", // Allow re-rolling dice
    "autoSuccess", // Auto-succeed (e.g., auto-hit from TORRENT)
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
    "m", // Movement
    "t", // Toughness
    "sv", // Save
    "invSv", // Invulnerable Save
    "w", // Wounds
    "ld", // Leadership
    "oc", // Objective Control
];

export const WEAPON_ATTRIBUTES = [
    "range", // Weapon range
    "a", // Attacks
    "bsWs", // Ballistic Skill / Weapon Skill
    "s", // Strength
    "ap", // Armour Penetration
    "d", // Damage
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
    "includes", // For array checks (keywords, abilities)
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
    { name: "isBelowStartingStrength", label: "Below Starting Strength" },
    { name: "isBelowHalfStrength", label: "Below Half Strength" },
    { name: "isDamaged", label: "Damaged (Bracketed)" },
    { name: "isLeadingUnit", label: "Leading a Unit" },
    { name: "isBeingLed", label: "Being Led" },
    // Faction-specific flags (like isOathOfMomentTarget) are defined in faction.json
];

// ============================================
// WEAPON ABILITIES (granted by unit abilities)
// ============================================

export const WEAPON_ABILITIES = [
    // Hit roll modifiers
    { name: "LETHAL HITS", description: "Critical hits (unmodified 6s) automatically wound" },
    { name: "SUSTAINED HITS", description: "Critical hits score extra hits. Has a value (e.g., SUSTAINED HITS 1, SUSTAINED HITS 2)" },
    { name: "TORRENT", description: "Automatically hits (no hit roll needed)" },
    { name: "HEAVY", description: "+1 to hit if unit remained stationary" },
    { name: "ASSAULT", description: "Can shoot after Advancing" },

    // Wound roll modifiers
    { name: "DEVASTATING WOUNDS", description: "Critical wounds deal mortal wounds instead of normal damage" },
    { name: "TWIN-LINKED", description: "Re-roll wound rolls" },
    { name: "LANCE", description: "+1 to wound if unit charged this turn" },
    { name: "ANTI-X", description: "Critical wounds on specific targets (e.g., ANTI-INFANTRY 4+, ANTI-VEHICLE 2+)" },

    // Save modifiers
    { name: "IGNORES COVER", description: "Target does not benefit from cover" },

    // Damage modifiers
    { name: "MELTA", description: "Extra damage at half range. Has a value (e.g., MELTA 2)" },

    // Other weapon abilities
    { name: "PRECISION", description: "Can target CHARACTER models in units" },
    { name: "INDIRECT FIRE", description: "Can target units not visible" },
    { name: "BLAST", description: "Extra attacks vs larger units" },
    { name: "HAZARDOUS", description: "Risk of mortal wounds to bearer" },
    { name: "PISTOL", description: "Can shoot in Engagement Range" },
    { name: "RAPID FIRE", description: "Extra attacks at half range. Has a value (e.g., RAPID FIRE 1)" },
    { name: "EXTRA ATTACKS", description: "These attacks are in addition to other weapons" },
    { name: "ONE SHOT", description: "Can only be used once per battle" },
    { name: "PSYCHIC", description: "Psychic weapon" },
];

// ============================================
// COMMON UNIT KEYWORDS (for conditions)
// ============================================

export const COMMON_KEYWORDS = [
    // Unit types
    "INFANTRY",
    "VEHICLE",
    "MONSTER",
    "MOUNTED",
    "BEAST",
    "SWARM",
    "WALKER",
    "AIRCRAFT",

    // Special unit types
    "CHARACTER",
    "EPIC HERO",
    "PSYKER",
    "DAEMON",
    "TITANIC",
    "TOWERING",

    // Movement/deployment
    "FLY",
    "TRANSPORT",
    "DEDICATED TRANSPORT",

    // Role
    "BATTLELINE",

    // Equipment
    "GRENADES",
    "SMOKE",

    // Allegiance (often in conditions)
    "IMPERIUM",
    "CHAOS",
];

// ============================================
// GAME PHASES (for timing context)
// ============================================

export const GAME_PHASES = ["Command phase", "Movement phase", "Shooting phase", "Charge phase", "Fight phase", "Morale phase"];

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

    return ENTITIES.map((e) => `  * "${e}" - ${entityDescriptions[e] || e}`).join("\n");
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

    return EFFECTS.map((e) => `  * "${e}" - ${effectDescriptions[e] || e}`).join("\n");
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

    return ATTRIBUTES.map((a) => `  * "${a}" - ${attrDescriptions[a] || a}`).join("\n");
}

/**
 * Generates the state documentation for the OpenAI prompt.
 * @param {Array} factionStateFlags - Optional faction-specific state flags to include
 */
export function generateStateDocs(factionStateFlags = []) {
    const allFlags = [...COMBAT_STATUS_FLAGS, ...factionStateFlags];
    return allFlags.map((s) => `  * "${s.name}" - ${s.label}`).join("\n");
}

/**
 * Generates the operator documentation for the OpenAI prompt.
 */
export function generateOperatorDocs() {
    return OPERATORS.map((o) => `"${o}"`).join(", ");
}

/**
 * Generates weapon abilities documentation for the OpenAI prompt.
 */
export function generateWeaponAbilitiesDocs() {
    return WEAPON_ABILITIES.map((wa) => `  * "${wa.name}" - ${wa.description}`).join("\n");
}

/**
 * Generates common keywords documentation for the OpenAI prompt.
 */
export function generateKeywordsDocs() {
    return COMMON_KEYWORDS.map((k) => `"${k}"`).join(", ");
}

/**
 * Builds the complete OpenAI prompt with schema values.
 * @param {string} cleanDescription - The cleaned description text to analyze
 * @param {Array} factionStateFlags - Optional faction-specific state flags to include
 * @param {object} unitContext - Optional unit context (keywords, name, etc.)
 */
export function buildMechanicsPrompt(cleanDescription, factionStateFlags = [], unitContext = null) {
    let contextSection = "";
    if (unitContext) {
        const parts = [];
        if (unitContext.unitName) {
            parts.push(`Unit Name: ${unitContext.unitName}`);
        }
        if (unitContext.keywords && unitContext.keywords.length > 0) {
            parts.push(`Unit Keywords: ${unitContext.keywords.join(", ")}`);
        }
        if (parts.length > 0) {
            contextSection = `\nUnit Context:\n${parts.join("\n")}\n`;
        }
    }

    return `Analyze the following Warhammer 40k game rule description and extract structured mechanics in JSON format.

Description: "${cleanDescription}"
${contextSection}
Extract all mechanics that affect dice rolls, characteristics, or grant abilities/keywords. Return them as a JSON array following this exact structure:

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

=== SCHEMA REFERENCE ===

"entity" must be one of:
${generateEntityDocs()}

"effect" must be one of:
${generateEffectDocs()}

"attribute" must be one of:
${generateAttributeDocs()}

"state" (for conditions) must be one of:
${generateStateDocs(factionStateFlags)}

"conditions.operator" must be one of: ${generateOperatorDocs()}

=== WEAPON ABILITIES REFERENCE ===
When an ability grants weapon abilities (shown in [BRACKETS] in rules), use effect:"addsAbility":
${generateWeaponAbilitiesDocs()}

=== COMMON KEYWORDS REFERENCE ===
Keywords often appear in conditions (e.g., "if target has INFANTRY keyword"):
${generateKeywordsDocs()}

=== IMPORTANT RULES ===

1. For weapon abilities with values (SUSTAINED HITS 1, MELTA 2, FEEL NO PAIN 5+), put the number in "value"
2. For reroll effects, value must be "ones", "failed", or "all"
3. Save modifications: Higher = worse save, so +1 to save is a PENALTY (rollPenalty), -1 to save is a BONUS (rollBonus)
4. "thisUnit" vs "thisModel": Use "thisUnit" for abilities affecting the whole unit, "thisModel" for single model effects
5. Leader abilities: When text says "while this model is leading a unit", the entity is usually "thisUnit" (the combined unit) with condition {state:"isLeadingUnit"}
6. Ignore the "Leader" ability itself - it just allows attachment, no combat effect

=== WHAT TO SKIP (return empty mechanics) ===

Do NOT extract mechanics for:
- Deployment/setup rules (Deep Strike setup, Infiltrators setup, Reserves)
- Unit organization rules (Combat Squads splitting)
- Transport capacity or embark/disembark rules
- CP cost reductions or Stratagem interactions
- Movement abilities (Scouts move, Fall Back and shoot/charge)
- Once per battle abilities that don't have combat effects
- Aura ranges without specific effects
- Narrative/flavor text

Only extract mechanics that directly affect:
- Dice rolls (hit, wound, save, damage)
- Unit/weapon characteristics
- Granting keywords or abilities

=== EXAMPLES ===

Simple modifiers:
- "add 1 to Hit rolls" → {entity:"thisUnit", effect:"rollBonus", attribute:"h", value:1}
- "subtract 1 from Wound rolls" → {entity:"thisUnit", effect:"rollPenalty", attribute:"w", value:1}
- "a 4+ invulnerable save" → {entity:"thisUnit", effect:"staticNumber", attribute:"invSv", value:4}
- "a 5+ Feel No Pain" → {entity:"thisUnit", effect:"addsAbility", abilities:["FEEL NO PAIN"], value:5}

Weapon abilities granted:
- "weapons have the [LETHAL HITS] ability" → {entity:"thisUnit", effect:"addsAbility", abilities:["LETHAL HITS"]}
- "weapons have the [SUSTAINED HITS 1] ability" → {entity:"thisUnit", effect:"addsAbility", abilities:["SUSTAINED HITS"], value:1}
- "weapons have the [DEVASTATING WOUNDS] ability" → {entity:"thisUnit", effect:"addsAbility", abilities:["DEVASTATING WOUNDS"]}

Conditional effects:
- "While this model is leading a unit, add 1 to Hit rolls for models in that unit" → {entity:"thisUnit", effect:"rollBonus", attribute:"h", value:1, conditions:[{entity:"thisModel", state:"isLeadingUnit", operator:"equals", value:true}]}
- "+1 to Wound against MONSTER or VEHICLE units" → {entity:"thisUnit", effect:"rollBonus", attribute:"w", value:1, conditions:[{entity:"targetUnit", keywords:["MONSTER", "VEHICLE"], operator:"includes", value:true}]}
- "re-roll hit rolls if target is below half strength" → {entity:"thisUnit", effect:"reroll", attribute:"h", value:"all", conditions:[{entity:"targetUnit", state:"isBelowHalfStrength", operator:"equals", value:true}]}

Rerolls:
- "re-roll hit rolls of 1" → {entity:"thisUnit", effect:"reroll", attribute:"h", value:"ones"}
- "re-roll failed wound rolls" → {entity:"thisUnit", effect:"reroll", attribute:"w", value:"failed"}
- "re-roll all hit rolls" → {entity:"thisUnit", effect:"reroll", attribute:"h", value:"all"}

Target effects:
- "subtract 1 from hit rolls that target this unit" → {entity:"opposingUnit", effect:"rollPenalty", attribute:"h", value:1, conditions:[{entity:"targetUnit", operator:"equals", value:"thisUnit"}]}
- "enemy units within 6\" get -1 to Leadership" → {entity:"opposingUnit", effect:"rollPenalty", attribute:"ld", value:1}

Mortal wounds:
- "inflict D3 mortal wounds" → {entity:"targetUnit", effect:"mortalWounds", value:"D3"}
- "on a 2+, inflict 1 mortal wound" → {entity:"targetUnit", effect:"mortalWounds", value:1}

If no extractable mechanics are found, return: {"mechanics": []}`;
}
