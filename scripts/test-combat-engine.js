/**
 * Combat Engine Test Script
 *
 * Run with: node scripts/test-combat-engine.js
 *
 * Tests various combat scenarios through the CombatEngine to verify calculations.
 */

import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, "..");

// ============================================================================
// Mini CombatEngine Implementation (standalone for testing)
// ============================================================================

/**
 * Parse weapon attributes into special effects
 */
function parseWeaponAttributes(attributes) {
    const effects = [];

    for (const attr of attributes || []) {
        const upper = attr.toUpperCase().trim();

        if (upper === "TORRENT") {
            effects.push({ type: "autoSuccess", value: true });
        } else if (upper === "HEAVY") {
            effects.push({ type: "heavy", value: true });
        } else if (upper === "ASSAULT") {
            effects.push({ type: "assault", value: true });
        } else if (upper === "BLAST") {
            effects.push({ type: "blast", value: true });
        } else if (upper === "LETHAL HITS") {
            effects.push({ type: "lethalHits", value: true });
        } else if (upper === "DEVASTATING WOUNDS") {
            effects.push({ type: "devastatingWounds", value: true });
        } else if (upper === "IGNORES COVER") {
            effects.push({ type: "ignoresCover", value: true });
        } else if (upper.startsWith("SUSTAINED HITS")) {
            const val = parseInt(upper.replace("SUSTAINED HITS", "").trim(), 10) || 1;
            effects.push({ type: "sustainedHits", value: val });
        } else if (upper.startsWith("ANTI-")) {
            const match = upper.match(/^ANTI-(.+)\s+(\d)\+$/);
            if (match) {
                effects.push({ type: "antiKeyword", value: `${match[1]} ${match[2]}+` });
            }
        }
    }

    return effects;
}

/**
 * Calculate wound roll target based on S vs T
 */
function calculateToWound(strength, toughness) {
    if (strength >= toughness * 2) return 2;
    if (strength > toughness) return 3;
    if (strength === toughness) return 4;
    if (strength * 2 <= toughness) return 6;
    return 5;
}

/**
 * Resolve combat and return results
 */
function resolveCombat(context) {
    const { attacker, defender } = context;
    const weapon = attacker.weaponProfile;
    const targetModel = defender.targetModel;

    const weaponEffects = parseWeaponAttributes(weapon.attributes);

    // Base values
    const baseToHit = weapon.bsWs;
    const baseToWound = calculateToWound(weapon.s, targetModel.t);
    const baseArmor = targetModel.sv;
    const baseInvuln = targetModel.invSv || null;
    const ap = weapon.ap;

    // Hit modifiers
    let hitModifier = 0;
    const hitModifierSources = [];

    // HEAVY bonus when stationary
    const hasHeavy = weaponEffects.some((e) => e.type === "heavy");
    const isStationary = attacker.unit?.combatState?.movementBehaviour === "hold";
    if (hasHeavy && isStationary) {
        hitModifier += 1;
        hitModifierSources.push({ name: "HEAVY", value: 1 });
    }

    // STEALTH penalty on defender (ranged attacks only)
    const phase = context.phase || "shooting";
    const defenderAbilities = defender.unit?.abilities || [];
    const hasStealth = defenderAbilities.some((a) => a.name?.toUpperCase() === "STEALTH" && a.type === "Core");
    if (hasStealth && phase === "shooting") {
        hitModifier -= 1; // -1 to hit (penalty)
        hitModifierSources.push({ name: "Stealth", value: -1 });
    }

    // Save modifiers
    let saveModifier = 0;
    const saveModifierSources = [];

    // Cover bonus (unless IGNORES COVER)
    const hasIgnoresCover = weaponEffects.some((e) => e.type === "ignoresCover");
    const inCover = defender.unit?.combatState?.isInCover;
    if (inCover && !hasIgnoresCover) {
        saveModifier -= 1; // Lower save is better
        saveModifierSources.push({ name: "Cover", value: 1 });
    }

    // Final calculations
    const hasTorrent = weaponEffects.some((e) => e.type === "autoSuccess");
    const finalToHit = hasTorrent ? "auto" : Math.max(2, Math.min(6, baseToHit - hitModifier));
    const finalToWound = Math.max(2, Math.min(6, baseToWound));

    // Save calculation
    const modifiedArmor = baseArmor - ap + saveModifier;
    const useInvuln = baseInvuln !== null && baseInvuln < modifiedArmor;
    const finalSave = useInvuln ? baseInvuln : modifiedArmor;

    // Critical wound threshold (ANTI-X)
    let criticalWoundThreshold = 6;
    let criticalWoundSource = null;

    const defenderKeywords = (defender.unit?.keywords || []).map((k) => (typeof k === "string" ? k : k.keyword).toUpperCase());

    for (const effect of weaponEffects) {
        if (effect.type === "antiKeyword") {
            const match = effect.value.match(/^(.+)\s+(\d)\+$/);
            if (match) {
                const keyword = match[1].toUpperCase();
                const threshold = parseInt(match[2], 10);
                if (defenderKeywords.includes(keyword) && threshold < criticalWoundThreshold) {
                    criticalWoundThreshold = threshold;
                    criticalWoundSource = `ANTI-${keyword} ${threshold}+`;
                }
            }
        }
    }

    // BLAST bonus
    const hasBlast = weaponEffects.some((e) => e.type === "blast");
    const blastBonusPerModel = hasBlast ? Math.floor(defender.modelCount / 5) : null;

    return {
        // Base values
        baseAttacks: weapon.a,
        baseToHit,
        baseToWound,
        baseSave: baseArmor,
        baseInvuln,
        baseDamage: weapon.d,

        // Weapon stats
        weaponStrength: weapon.s,
        weaponAp: ap,
        targetToughness: targetModel.t,

        // Modifiers
        hitModifiers: { sources: hitModifierSources, total: hitModifier },
        saveModifiers: { sources: saveModifierSources, total: saveModifier },

        // Final values
        finalToHit,
        finalToWound,
        finalSave,
        useInvuln,

        // Critical thresholds
        criticalHitThreshold: 6,
        criticalWoundThreshold,
        criticalWoundSource,

        // BLAST
        blastBonusPerModel,
        defenderModelCount: defender.modelCount,

        // Effects
        weaponEffects,
    };
}

// ============================================================================
// Test Helpers
// ============================================================================

function loadDatasheet(faction, id) {
    const path = join(rootDir, `src/app/data/output/factions/${faction}/datasheets/${id}.json`);
    return JSON.parse(readFileSync(path, "utf-8"));
}

function createMockUnit(datasheet, options = {}) {
    return {
        id: datasheet.id,
        name: datasheet.name,
        keywords: datasheet.keywords,
        abilities: options.abilities || datasheet.abilities || [],
        combatState: {
            movementBehaviour: options.movement || "hold",
            isInCover: options.inCover || false,
            modelCount: options.modelCount || 1,
            deadModelIds: options.deadModelIds || [],
        },
    };
}

function findWeapon(datasheet, weaponName) {
    const wargear = datasheet.availableWargear.find((w) => w.name.toLowerCase() === weaponName.toLowerCase());
    if (!wargear) {
        console.error(`Weapon "${weaponName}" not found in ${datasheet.name}`);
        console.log(
            "Available weapons:",
            datasheet.availableWargear.map((w) => w.name)
        );
        return null;
    }
    return wargear.profiles[0];
}

function findModel(datasheet, modelName) {
    if (modelName) {
        return datasheet.models.find((m) => m.name.toLowerCase().includes(modelName.toLowerCase()));
    }
    return datasheet.models[0];
}

// ============================================================================
// Test Runner
// ============================================================================

function runTest(name, context, expected) {
    console.log(`\n${"=".repeat(70)}`);
    console.log(`TEST: ${name}`);
    console.log("=".repeat(70));

    const result = resolveCombat(context);

    console.log("\n--- INPUT ---");
    console.log(`Attacker: ${context.attacker.unit.name}`);
    console.log(`Weapon: ${context.attacker.weaponProfile.name} (A:${context.attacker.weaponProfile.a}, BS:${context.attacker.weaponProfile.bsWs}+, S:${context.attacker.weaponProfile.s}, AP:${context.attacker.weaponProfile.ap}, D:${context.attacker.weaponProfile.d})`);
    console.log(`Attributes: [${(context.attacker.weaponProfile.attributes || []).join(", ")}]`);
    console.log(`Movement: ${context.attacker.unit.combatState?.movementBehaviour || "hold"}`);
    console.log(`Defender: ${context.defender.unit.name}`);
    console.log(`Target Model: T:${context.defender.targetModel.t}, Sv:${context.defender.targetModel.sv}+${context.defender.targetModel.invSv ? `, Inv:${context.defender.targetModel.invSv}+` : ""}`);
    console.log(`Defender Models: ${context.defender.modelCount} alive`);
    console.log(`In Cover: ${context.defender.unit.combatState?.isInCover || false}`);

    console.log("\n--- RESULTS ---");
    console.log(`Base Attacks: ${result.baseAttacks}`);
    if (result.blastBonusPerModel !== null) {
        console.log(`BLAST Bonus: +${result.blastBonusPerModel} per model (${result.defenderModelCount} defender models / 5)`);
    }
    console.log(`To Hit: ${result.finalToHit === "auto" ? "AUTO-HIT (TORRENT)" : `${result.finalToHit}+`}${result.hitModifiers.sources.length ? ` (${result.hitModifiers.sources.map((s) => `${s.name}: +${s.value}`).join(", ")})` : ""}`);
    console.log(`To Wound: ${result.finalToWound}+ (S${result.weaponStrength} vs T${result.targetToughness})`);
    if (result.criticalWoundThreshold < 6) {
        console.log(`Critical Wound: ${result.criticalWoundThreshold}+ (${result.criticalWoundSource})`);
    }
    console.log(`Save: ${result.finalSave}+${result.useInvuln ? " (Invuln)" : ""} (Base ${result.baseSave}+, AP ${result.weaponAp}${result.saveModifiers.sources.length ? `, ${result.saveModifiers.sources.map((s) => `${s.name}: +${s.value}`).join(", ")}` : ""})`);
    console.log(`Damage: ${result.baseDamage}`);

    // Verify expected values
    console.log("\n--- VERIFICATION ---");
    let allPassed = true;

    for (const [key, expectedValue] of Object.entries(expected)) {
        const actualValue = result[key];
        const passed = actualValue === expectedValue;
        const status = passed ? "PASS" : "FAIL";
        console.log(`${status}: ${key} = ${actualValue} (expected: ${expectedValue})${passed ? "" : " <-- MISMATCH"}`);
        if (!passed) allPassed = false;
    }

    return allPassed;
}

// ============================================================================
// Test Cases
// ============================================================================

function runAllTests() {
    console.log("\n" + "=".repeat(70));
    console.log("COMBAT ENGINE TEST SUITE");
    console.log("=".repeat(70));

    let passed = 0;
    let failed = 0;

    // Load datasheets
    const hiveTyrant = loadDatasheet("tyranids", "000000460");
    const orkBoyz = loadDatasheet("orks", "000000016");
    const warboss = loadDatasheet("orks", "000000001");
    const sternguard = loadDatasheet("space-marines", "000004137");
    const megaDread = loadDatasheet("orks", "000002453");
    const decimusKillTeam = loadDatasheet("space-marines", "000004175");

    // -------------------------------------------------------------------------
    // Test 1: BLAST weapon vs 20 models
    // -------------------------------------------------------------------------
    {
        const weapon = findWeapon(hiveTyrant, "Heavy venom cannon");
        const test = runTest(
            "BLAST vs 20 models (Hive Tyrant Heavy Venom Cannon vs 20 Ork Boyz)",
            {
                attacker: {
                    unit: createMockUnit(hiveTyrant),
                    weaponProfile: weapon,
                },
                defender: {
                    unit: createMockUnit(orkBoyz, { modelCount: 20 }),
                    targetModel: findModel(orkBoyz, "Boy"),
                    modelCount: 20,
                },
            },
            {
                finalToHit: 2,
                finalToWound: 3, // S9 vs T5 = 3+ (S > T, but S9 < 2*T5=10)
                blastBonusPerModel: 4, // 20/5 = 4
                finalSave: 7, // 5+ with -2 AP = 7+
            }
        );
        test ? passed++ : failed++;
    }

    // -------------------------------------------------------------------------
    // Test 2: BLAST vs 8 surviving models
    // -------------------------------------------------------------------------
    {
        const weapon = findWeapon(hiveTyrant, "Heavy venom cannon");
        const test = runTest(
            "BLAST vs 8 alive models (should get +1 bonus)",
            {
                attacker: {
                    unit: createMockUnit(hiveTyrant),
                    weaponProfile: weapon,
                },
                defender: {
                    unit: createMockUnit(orkBoyz, { modelCount: 20, deadModelIds: Array(12).fill("x") }),
                    targetModel: findModel(orkBoyz, "Boy"),
                    modelCount: 8, // 8 alive
                },
            },
            {
                blastBonusPerModel: 1, // 8/5 = 1
            }
        );
        test ? passed++ : failed++;
    }

    // -------------------------------------------------------------------------
    // Test 3: BLAST vs 4 models (no bonus)
    // -------------------------------------------------------------------------
    {
        const weapon = findWeapon(hiveTyrant, "Heavy venom cannon");
        const test = runTest(
            "BLAST vs 4 alive models (no bonus)",
            {
                attacker: {
                    unit: createMockUnit(hiveTyrant),
                    weaponProfile: weapon,
                },
                defender: {
                    unit: createMockUnit(orkBoyz, { modelCount: 4 }),
                    targetModel: findModel(orkBoyz, "Boy"),
                    modelCount: 4,
                },
            },
            {
                blastBonusPerModel: 0, // 4/5 = 0
            }
        );
        test ? passed++ : failed++;
    }

    // -------------------------------------------------------------------------
    // Test 4: TORRENT weapon (auto-hit)
    // -------------------------------------------------------------------------
    {
        const weapon = findWeapon(sternguard, "Pyrecannon");
        const test = runTest(
            "TORRENT weapon (Pyrecannon vs Ork Boyz)",
            {
                attacker: {
                    unit: createMockUnit(sternguard),
                    weaponProfile: weapon,
                },
                defender: {
                    unit: createMockUnit(orkBoyz, { modelCount: 10 }),
                    targetModel: findModel(orkBoyz, "Boy"),
                    modelCount: 10,
                },
            },
            {
                finalToHit: "auto", // TORRENT
                finalToWound: 3, // S6 vs T5 = 3+ (S > T)
                finalSave: 6, // 5+ with -1 AP = 6+
            }
        );
        test ? passed++ : failed++;
    }

    // -------------------------------------------------------------------------
    // Test 5: ANTI-INFANTRY + DEVASTATING WOUNDS vs Infantry
    // -------------------------------------------------------------------------
    {
        const weapon = findWeapon(warboss, "Kombi-weapon");
        const test = runTest(
            "ANTI-INFANTRY 4+ vs Infantry (Kombi-weapon vs Sternguard)",
            {
                attacker: {
                    unit: createMockUnit(warboss),
                    weaponProfile: weapon,
                },
                defender: {
                    unit: createMockUnit(sternguard, { modelCount: 5 }),
                    targetModel: findModel(sternguard),
                    modelCount: 5,
                },
            },
            {
                finalToHit: 5, // BS 5+
                finalToWound: 4, // S4 vs T4 = 4+
                criticalWoundThreshold: 4, // ANTI-INFANTRY 4+ triggers
                criticalWoundSource: "ANTI-INFANTRY 4+",
                finalSave: 3, // 3+ with 0 AP
            }
        );
        test ? passed++ : failed++;
    }

    // -------------------------------------------------------------------------
    // Test 6: ANTI-INFANTRY vs non-Infantry (no effect)
    // -------------------------------------------------------------------------
    {
        const weapon = findWeapon(warboss, "Kombi-weapon");
        const test = runTest(
            "ANTI-INFANTRY 4+ vs Vehicle (should NOT trigger)",
            {
                attacker: {
                    unit: createMockUnit(warboss),
                    weaponProfile: weapon,
                },
                defender: {
                    unit: createMockUnit(megaDread),
                    targetModel: findModel(megaDread),
                    modelCount: 1,
                },
            },
            {
                finalToWound: 6, // S4 vs T10 = 6+ (S*2 <= T)
                criticalWoundThreshold: 6, // ANTI-INFANTRY doesn't trigger on Vehicle
                finalSave: 2, // 2+ with 0 AP
            }
        );
        test ? passed++ : failed++;
    }

    // -------------------------------------------------------------------------
    // Test 7: HEAVY weapon while stationary (+1 to hit)
    // -------------------------------------------------------------------------
    {
        const weapon = findWeapon(sternguard, "Sternguard heavy bolter");
        const test = runTest(
            "HEAVY weapon while stationary (+1 to hit)",
            {
                attacker: {
                    unit: createMockUnit(sternguard, { movement: "hold" }),
                    weaponProfile: weapon,
                },
                defender: {
                    unit: createMockUnit(orkBoyz, { modelCount: 10 }),
                    targetModel: findModel(orkBoyz, "Boy"),
                    modelCount: 10,
                },
            },
            {
                finalToHit: 3, // BS 4+ with +1 = 3+
                finalToWound: 4, // S5 vs T5 = 4+
            }
        );
        test ? passed++ : failed++;
    }

    // -------------------------------------------------------------------------
    // Test 8: HEAVY weapon while moved (no bonus)
    // -------------------------------------------------------------------------
    {
        const weapon = findWeapon(sternguard, "Sternguard heavy bolter");
        const test = runTest(
            "HEAVY weapon while moved (no bonus)",
            {
                attacker: {
                    unit: createMockUnit(sternguard, { movement: "move" }),
                    weaponProfile: weapon,
                },
                defender: {
                    unit: createMockUnit(orkBoyz, { modelCount: 10 }),
                    targetModel: findModel(orkBoyz, "Boy"),
                    modelCount: 10,
                },
            },
            {
                finalToHit: 4, // BS 4+ (no HEAVY bonus)
            }
        );
        test ? passed++ : failed++;
    }

    // -------------------------------------------------------------------------
    // Test 9: Cover bonus on save
    // -------------------------------------------------------------------------
    {
        const weapon = findWeapon(warboss, "Kombi-weapon");
        const test = runTest(
            "Defender in Cover (+1 to save)",
            {
                attacker: {
                    unit: createMockUnit(warboss),
                    weaponProfile: weapon,
                },
                defender: {
                    unit: createMockUnit(orkBoyz, { modelCount: 10, inCover: true }),
                    targetModel: findModel(orkBoyz, "Boy"),
                    modelCount: 10,
                },
            },
            {
                finalSave: 4, // 5+ with Cover (+1) = 4+
            }
        );
        test ? passed++ : failed++;
    }

    // -------------------------------------------------------------------------
    // Test 10: IGNORES COVER negates cover
    // -------------------------------------------------------------------------
    {
        const weapon = findWeapon(sternguard, "Pyrecannon");
        const test = runTest(
            "IGNORES COVER negates defender cover",
            {
                attacker: {
                    unit: createMockUnit(sternguard),
                    weaponProfile: weapon,
                },
                defender: {
                    unit: createMockUnit(orkBoyz, { modelCount: 10, inCover: true }),
                    targetModel: findModel(orkBoyz, "Boy"),
                    modelCount: 10,
                },
            },
            {
                finalSave: 6, // 5+ with -1 AP = 6+ (no cover bonus due to IGNORES COVER)
            }
        );
        test ? passed++ : failed++;
    }

    // -------------------------------------------------------------------------
    // Test 11: Invulnerable save used when better than armor
    // -------------------------------------------------------------------------
    {
        const weapon = findWeapon(decimusKillTeam, "Frag cannon");
        const test = runTest(
            "Invulnerable save used when better (vs Mega Dread)",
            {
                attacker: {
                    unit: createMockUnit(decimusKillTeam, { movement: "hold" }),
                    weaponProfile: weapon,
                },
                defender: {
                    unit: createMockUnit(megaDread),
                    targetModel: findModel(megaDread),
                    modelCount: 1,
                },
            },
            {
                finalToHit: 2, // BS 3+ with HEAVY +1 = 2+
                finalToWound: 5, // S7 vs T10 = 5+ (S < T)
                finalSave: 4, // 2+ with -2 AP = 4+, Invuln 6+ is worse, so use armor
                useInvuln: false,
            }
        );
        test ? passed++ : failed++;
    }

    // -------------------------------------------------------------------------
    // Test 12: S vs T calculations
    // -------------------------------------------------------------------------
    {
        // S >= 2*T = 2+ (e.g., S10 vs T5)
        const weapon = { name: "Test", a: 1, bsWs: 3, s: 10, ap: 0, d: 1, attributes: [] };
        const test = runTest(
            "Wound roll: S >= 2*T = 2+ (S10 vs T5)",
            {
                attacker: {
                    unit: { name: "Test", keywords: [], combatState: { movementBehaviour: "hold" } },
                    weaponProfile: weapon,
                },
                defender: {
                    unit: { name: "Target", keywords: [], combatState: {} },
                    targetModel: { t: 5, sv: 4, invSv: null },
                    modelCount: 1,
                },
            },
            {
                finalToWound: 2,
            }
        );
        test ? passed++ : failed++;
    }

    {
        // S > T = 3+ (e.g., S6 vs T5)
        const weapon = { name: "Test", a: 1, bsWs: 3, s: 6, ap: 0, d: 1, attributes: [] };
        const test = runTest(
            "Wound roll: S > T = 3+ (S6 vs T5)",
            {
                attacker: {
                    unit: { name: "Test", keywords: [], combatState: { movementBehaviour: "hold" } },
                    weaponProfile: weapon,
                },
                defender: {
                    unit: { name: "Target", keywords: [], combatState: {} },
                    targetModel: { t: 5, sv: 4, invSv: null },
                    modelCount: 1,
                },
            },
            {
                finalToWound: 3,
            }
        );
        test ? passed++ : failed++;
    }

    {
        // S = T = 4+ (e.g., S5 vs T5)
        const weapon = { name: "Test", a: 1, bsWs: 3, s: 5, ap: 0, d: 1, attributes: [] };
        const test = runTest(
            "Wound roll: S = T = 4+ (S5 vs T5)",
            {
                attacker: {
                    unit: { name: "Test", keywords: [], combatState: { movementBehaviour: "hold" } },
                    weaponProfile: weapon,
                },
                defender: {
                    unit: { name: "Target", keywords: [], combatState: {} },
                    targetModel: { t: 5, sv: 4, invSv: null },
                    modelCount: 1,
                },
            },
            {
                finalToWound: 4,
            }
        );
        test ? passed++ : failed++;
    }

    {
        // S < T = 5+ (e.g., S4 vs T5)
        const weapon = { name: "Test", a: 1, bsWs: 3, s: 4, ap: 0, d: 1, attributes: [] };
        const test = runTest(
            "Wound roll: S < T = 5+ (S4 vs T5)",
            {
                attacker: {
                    unit: { name: "Test", keywords: [], combatState: { movementBehaviour: "hold" } },
                    weaponProfile: weapon,
                },
                defender: {
                    unit: { name: "Target", keywords: [], combatState: {} },
                    targetModel: { t: 5, sv: 4, invSv: null },
                    modelCount: 1,
                },
            },
            {
                finalToWound: 5,
            }
        );
        test ? passed++ : failed++;
    }

    {
        // S*2 <= T = 6+ (e.g., S4 vs T10)
        const weapon = { name: "Test", a: 1, bsWs: 3, s: 4, ap: 0, d: 1, attributes: [] };
        const test = runTest(
            "Wound roll: S*2 <= T = 6+ (S4 vs T10)",
            {
                attacker: {
                    unit: { name: "Test", keywords: [], combatState: { movementBehaviour: "hold" } },
                    weaponProfile: weapon,
                },
                defender: {
                    unit: { name: "Target", keywords: [], combatState: {} },
                    targetModel: { t: 10, sv: 4, invSv: null },
                    modelCount: 1,
                },
            },
            {
                finalToWound: 6,
            }
        );
        test ? passed++ : failed++;
    }

    // -------------------------------------------------------------------------
    // Test 13: STEALTH in shooting phase (-1 to hit)
    // -------------------------------------------------------------------------
    {
        const weapon = { name: "Bolt Rifle", a: 2, bsWs: 3, s: 4, ap: -1, d: 1, attributes: [] };
        const test = runTest(
            "STEALTH in shooting phase (-1 to hit)",
            {
                phase: "shooting",
                attacker: {
                    unit: { name: "Space Marine", keywords: [], abilities: [], combatState: { movementBehaviour: "hold" } },
                    weaponProfile: weapon,
                },
                defender: {
                    unit: {
                        name: "Stealth Unit",
                        keywords: [],
                        abilities: [{ name: "Stealth", type: "Core" }],
                        combatState: {},
                    },
                    targetModel: { t: 4, sv: 4, invSv: null },
                    modelCount: 5,
                },
            },
            {
                finalToHit: 4, // BS 3+ with -1 from Stealth = 4+
            }
        );
        test ? passed++ : failed++;
    }

    // -------------------------------------------------------------------------
    // Test 14: STEALTH in melee phase (no effect)
    // -------------------------------------------------------------------------
    {
        const weapon = { name: "Chainsword", a: 4, bsWs: 3, s: 4, ap: 0, d: 1, attributes: [] };
        const test = runTest(
            "STEALTH in melee phase (no effect)",
            {
                phase: "fight",
                attacker: {
                    unit: { name: "Space Marine", keywords: [], abilities: [], combatState: { movementBehaviour: "hold" } },
                    weaponProfile: weapon,
                },
                defender: {
                    unit: {
                        name: "Stealth Unit",
                        keywords: [],
                        abilities: [{ name: "Stealth", type: "Core" }],
                        combatState: {},
                    },
                    targetModel: { t: 4, sv: 4, invSv: null },
                    modelCount: 5,
                },
            },
            {
                finalToHit: 3, // WS 3+ (Stealth doesn't apply in melee)
            }
        );
        test ? passed++ : failed++;
    }

    // -------------------------------------------------------------------------
    // Test 15: STEALTH + HEAVY (both apply in shooting)
    // -------------------------------------------------------------------------
    {
        const weapon = { name: "Heavy Bolter", a: 3, bsWs: 4, s: 5, ap: -1, d: 2, attributes: ["HEAVY"] };
        const test = runTest(
            "STEALTH + HEAVY combined (net 0 modifier)",
            {
                phase: "shooting",
                attacker: {
                    unit: { name: "Space Marine", keywords: [], abilities: [], combatState: { movementBehaviour: "hold" } },
                    weaponProfile: weapon,
                },
                defender: {
                    unit: {
                        name: "Stealth Unit",
                        keywords: [],
                        abilities: [{ name: "Stealth", type: "Core" }],
                        combatState: {},
                    },
                    targetModel: { t: 4, sv: 4, invSv: null },
                    modelCount: 5,
                },
            },
            {
                finalToHit: 4, // BS 4+ with +1 HEAVY and -1 Stealth = 4+
            }
        );
        test ? passed++ : failed++;
    }

    // -------------------------------------------------------------------------
    // Summary
    // -------------------------------------------------------------------------
    console.log("\n" + "=".repeat(70));
    console.log("TEST SUMMARY");
    console.log("=".repeat(70));
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
    console.log(`Total:  ${passed + failed}`);
    console.log("=".repeat(70));

    if (failed > 0) {
        process.exit(1);
    }
}

runAllTests();
