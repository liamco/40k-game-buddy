/**
 * CombatEngine - Core combat resolution logic
 *
 * Evaluates all game mechanics and produces combat resolution with attributed modifiers.
 */

import type { CombatContext } from "./types/CombatContext";
import type { Mechanic, Condition, Entity, Attribute } from "./types/Mechanic";
import type { EffectSource } from "./types/EffectSource";
import { createEffectSource } from "./types/EffectSource";
import type { StepModifiers, CombatResolution, AttackStepType, AttributedModifier, SpecialEffect } from "./types/ModifierResult";
import { createEmptyStepModifiers } from "./types/ModifierResult";
import { extractWeaponMechanics } from "./weaponAttributes";
import { extractAbilityMechanics } from "./abilityMechanics";

/**
 * A mechanic paired with its source for attribution
 */
interface SourcedMechanic {
    mechanic: Mechanic;
    source: EffectSource;
    /** For leader abilities: the name of the leader unit that granted this ability */
    leaderSourceName?: string;
}

/**
 * CombatEngine resolves combat by:
 * 1. Collecting all applicable mechanics from various sources
 * 2. Evaluating conditions against the combat context
 * 3. Aggregating modifiers with proper capping
 * 4. Returning a complete CombatResolution
 */
export class CombatEngine {
    private context: CombatContext;
    private collectedMechanics: SourcedMechanic[] = [];
    private weaponEffects: SpecialEffect[] = [];

    constructor(context: CombatContext) {
        this.context = context;
    }

    /**
     * Main entry point - resolve complete combat
     */
    resolve(): CombatResolution {
        // 1. Collect all potentially applicable mechanics
        this.collectAllMechanics();

        // 2. Calculate base values
        const baseValues = this.calculateBaseValues();

        // 2b. Derive FNP from collected mechanics (must happen after collection)
        // FNP is ability-granted, not a base model stat
        const derivedFnp = this.deriveFnpFromMechanics();

        // 3. Evaluate modifiers for each step
        const attacksMods = this.evaluateStep("attacks");
        const hitMods = this.evaluateStep("hitRoll");
        const woundMods = this.evaluateStep("woundRoll");
        const saveMods = this.evaluateStep("saveRoll");
        const fnpMods = this.evaluateStep("feelNoPain");
        const damageMods = this.evaluateStep("damageRoll");

        // 4. Compute final values
        const finalToHit = this.computeFinalToHit(baseValues.toHit, hitMods);
        const finalToWound = this.computeFinalToWound(baseValues.toWound, woundMods);
        const { finalSave, useInvuln } = this.computeFinalSave(baseValues.armorSave, baseValues.invulnSave, baseValues.ap, saveMods);

        // 5. Compute critical thresholds
        const { criticalHitThreshold } = this.computeCriticalHitThreshold();
        const { criticalWoundThreshold, criticalWoundSource } = this.computeCriticalWoundThreshold();

        // 6. Compute BLAST bonus
        const blastEffect = this.computeBlastEffect();

        return {
            baseAttacks: baseValues.attacks,
            baseToHit: baseValues.toHit,
            baseToWound: baseValues.toWound,
            baseSave: baseValues.armorSave,
            baseInvuln: baseValues.invulnSave,
            baseFnp: derivedFnp,
            baseDamage: baseValues.damage,

            weaponStrength: baseValues.strength,
            weaponAp: baseValues.ap,
            targetToughness: baseValues.toughness,

            attacksModifiers: attacksMods,
            hitModifiers: hitMods,
            woundModifiers: woundMods,
            saveModifiers: saveMods,
            fnpModifiers: fnpMods,
            damageModifiers: damageMods,

            finalToHit,
            finalToWound,
            finalSave,
            useInvuln,
            finalFnp: derivedFnp,

            criticalHitThreshold,
            criticalWoundThreshold,
            criticalWoundSource,

            blastBonusPerModel: blastEffect?.bonusPerModel ?? null,
            defenderModelCount: this.context.defender.modelCount,

            weaponEffects: this.weaponEffects,
        };
    }

    /**
     * Calculate base values from weapon and target model
     */
    private calculateBaseValues() {
        const weapon = this.context.attacker.weaponProfile;
        const targetModel = this.context.defender.targetModel;

        const strength = weapon.s;
        const toughness = targetModel.t;

        return {
            attacks: weapon.a,
            toHit: weapon.bsWs,
            toWound: this.calculateToWound(strength, toughness),
            armorSave: targetModel.sv,
            invulnSave: targetModel.invSv ?? null,
            ap: weapon.ap,
            damage: weapon.d,
            strength,
            toughness,
        };
    }

    /**
     * Calculate to-wound roll target based on strength vs toughness
     */
    private calculateToWound(strength: number, toughness: number): number {
        if (strength >= toughness * 2) return 2;
        if (strength > toughness) return 3;
        if (strength === toughness) return 4;
        if (strength * 2 <= toughness) return 6;
        return 5;
    }

    /**
     * Collect all mechanics from all sources
     */
    private collectAllMechanics(): void {
        // Weapon attributes (HEAVY, TORRENT, etc.)
        this.collectFromWeapon();

        // Unit abilities (STEALTH, FEEL NO PAIN, etc.)
        this.collectFromUnitAbilities();

        // Cover: Improves save by 1 if defender is in cover (unless weapon ignores cover)
        // For saves, a lower number is better, so we use -1 to improve the roll target
        // This must come after collectFromWeapon so ignoreModifier mechanics are available
        if (this.context.defender.unit.combatState?.isInCover) {
            const ignoresCover = this.hasIgnoreModifierFor("s", "cover");
            if (!ignoresCover) {
                this.collectedMechanics.push({
                    mechanic: {
                        entity: "targetUnit",
                        effect: "rollBonus",
                        attribute: "s",
                        value: -1,
                    },
                    source: createEffectSource("coreRule", "Cover"),
                });
            }
        }

        // Convert addsAbility mechanics to special effects (LETHAL HITS, SUSTAINED HITS, etc.)
        this.processAbilityGrantingMechanics();

        // Future: stratagems, etc.
        // this.collectFromStratagems();
    }

    /**
     * Process mechanics that grant weapon abilities (addsAbility effect).
     * Converts them to special effects that display on attack steps.
     */
    private processAbilityGrantingMechanics(): void {
        for (const { mechanic, source, leaderSourceName } of this.collectedMechanics) {
            if (mechanic.effect !== "addsAbility") continue;
            if (!mechanic.abilities || !Array.isArray(mechanic.abilities)) continue;

            // Evaluate conditions (including isLeadingUnit for leader abilities)
            if (!this.evaluateConditions(mechanic.conditions, leaderSourceName)) continue;

            for (const abilityName of mechanic.abilities) {
                const upperName = abilityName.toUpperCase();
                const specialEffect = this.createSpecialEffectForAbility(upperName, source, mechanic.value);
                if (specialEffect) {
                    this.weaponEffects.push(specialEffect);
                }
            }
        }
    }

    /**
     * Create a special effect for a granted ability name.
     */
    private createSpecialEffectForAbility(abilityName: string, source: EffectSource, value?: any): SpecialEffect | null {
        switch (abilityName) {
            case "LETHAL HITS":
                return { type: "lethalHits", value: true, source };
            case "SUSTAINED HITS":
                return { type: "sustainedHits", value: typeof value === "number" ? value : 1, source };
            case "DEVASTATING WOUNDS":
                return { type: "devastatingWounds", value: true, source };
            case "PRECISION":
                return { type: "precision", value: true, source };
            default:
                return null;
        }
    }

    /**
     * Collect mechanics from attacker and defender unit abilities
     */
    private collectFromUnitAbilities(): void {
        const attackerUnit = this.context.attacker.unit;
        const defenderUnit = this.context.defender.unit;

        // Attacker abilities (affect attacks made by this unit)
        const attackerMechanics = extractAbilityMechanics(attackerUnit.abilities, attackerUnit.name, "unitAbility");

        for (const { mechanic, source, appliesTo, leaderSourceName } of attackerMechanics) {
            if (appliesTo === "attacksMade") {
                this.collectedMechanics.push({ mechanic, source, leaderSourceName });
            }
        }

        // Defender abilities (affect attacks received by this unit)
        const defenderMechanics = extractAbilityMechanics(defenderUnit.abilities, defenderUnit.name, "unitAbility");

        for (const { mechanic, source, appliesTo, leaderSourceName } of defenderMechanics) {
            if (appliesTo === "attacksAgainst") {
                this.collectedMechanics.push({ mechanic, source, leaderSourceName });
            }
        }
    }

    /**
     * Collect mechanics from weapon attributes
     */
    private collectFromWeapon(): void {
        const weapon = this.context.attacker.weaponProfile;
        const attributes = weapon.attributes || [];

        const { mechanics, specialEffects } = extractWeaponMechanics(attributes, weapon.name);

        for (const mechanic of mechanics) {
            this.collectedMechanics.push({
                mechanic,
                source: createEffectSource("weaponAttribute", weapon.name, {
                    attribute: this.getAttributeForMechanic(mechanic, attributes),
                }),
            });
        }

        this.weaponEffects = specialEffects;
    }

    /**
     * Get the attribute name that generated a mechanic
     */
    private getAttributeForMechanic(mechanic: Mechanic, attributes: string[]): string | undefined {
        // Try to match the mechanic back to an attribute
        if (mechanic.effect === "autoSuccess" && mechanic.attribute === "h") {
            return attributes.find((a) => a.toUpperCase() === "TORRENT");
        }
        if (mechanic.effect === "rollBonus" && mechanic.attribute === "h" && mechanic.conditions?.some((c) => c.state === "isStationary")) {
            return attributes.find((a) => a.toUpperCase() === "HEAVY");
        }
        if (mechanic.effect === "rollBonus" && mechanic.attribute === "w" && mechanic.conditions?.some((c) => c.state === "hasChargedThisTurn")) {
            return attributes.find((a) => a.toUpperCase() === "LANCE");
        }
        return undefined;
    }

    /**
     * Evaluate modifiers for a specific attack step
     */
    private evaluateStep(step: AttackStepType): StepModifiers {
        const result = createEmptyStepModifiers(step);
        const attribute = this.stepToAttribute(step);

        for (const { mechanic, source, leaderSourceName } of this.collectedMechanics) {
            // Check if mechanic applies to this step
            if (!this.mechanicAppliesToStep(mechanic, step, attribute)) continue;

            // Evaluate conditions (pass leader source name for leader-specific checks)
            if (!this.evaluateConditions(mechanic.conditions, leaderSourceName)) continue;

            // Apply the effect
            if (mechanic.effect === "rollBonus" && typeof mechanic.value === "number") {
                result.bonuses.push({
                    value: mechanic.value,
                    source,
                    description: source.attribute || source.name,
                });
            } else if (mechanic.effect === "rollPenalty" && typeof mechanic.value === "number") {
                result.penalties.push({
                    value: mechanic.value,
                    source,
                    description: source.attribute || source.name,
                });
            }
        }

        // Calculate totals
        const bonusTotal = result.bonuses.reduce((sum, b) => sum + b.value, 0);
        const penaltyTotal = result.penalties.reduce((sum, p) => sum + p.value, 0);
        result.rawTotal = bonusTotal - penaltyTotal;

        // Apply capping for hit and wound rolls
        const shouldCap = step === "hitRoll" || step === "woundRoll";
        result.cappedTotal = shouldCap ? Math.max(-1, Math.min(1, result.rawTotal)) : result.rawTotal;
        result.isCapped = shouldCap && result.rawTotal !== result.cappedTotal;

        // Build display format
        // For save rolls, bonuses have negative values (lower roll needed = better)
        // but should display as positive numbers in the UI
        const isSaveRoll = step === "saveRoll";
        result.forDisplay = {
            bonuses: result.bonuses.map((b) => ({
                label: b.source.attribute || b.source.name,
                value: isSaveRoll ? Math.abs(b.value) : b.value,
                leaderName: b.source.isFromLeader ? b.source.sourceUnitName : undefined,
                isFromLeader: b.source.isFromLeader,
            })),
            penalties: result.penalties.map((p) => ({
                label: p.source.attribute || p.source.name,
                value: isSaveRoll ? Math.abs(p.value) : p.value,
                leaderName: p.source.isFromLeader ? p.source.sourceUnitName : undefined,
                isFromLeader: p.source.isFromLeader,
            })),
        };

        return result;
    }

    /**
     * Convert attack step to attribute
     */
    private stepToAttribute(step: AttackStepType): string | null {
        switch (step) {
            case "attacks":
                return "a";
            case "hitRoll":
                return "h";
            case "woundRoll":
                return "w";
            case "saveRoll":
                return "s";
            case "feelNoPain":
                return "fnp";
            case "damageRoll":
                return "d";
            default:
                return null;
        }
    }

    /**
     * Check if a mechanic applies to a specific step
     */
    private mechanicAppliesToStep(mechanic: Mechanic, step: AttackStepType, attribute: string | null): boolean {
        if (!mechanic.attribute) return false;
        return mechanic.attribute === attribute;
    }

    /**
     * Evaluate all conditions for a mechanic
     * @param conditions - The conditions to evaluate
     * @param leaderSourceName - For leader abilities, the name of the leader (for isLeadingUnit checks)
     */
    private evaluateConditions(conditions?: Condition[], leaderSourceName?: string): boolean {
        if (!conditions || conditions.length === 0) return true;
        return conditions.every((condition) => this.evaluateCondition(condition, leaderSourceName));
    }

    /**
     * Evaluate a single condition against the current context
     * @param condition - The condition to evaluate
     * @param leaderSourceName - For leader abilities, the name of the leader (for isLeadingUnit checks)
     */
    private evaluateCondition(condition: Condition, leaderSourceName?: string): boolean {
        const { entity, state, attribute, keywords, operator, value } = condition;

        // State-based conditions
        if (state) {
            const stateValue = this.getStateValue(entity, state, leaderSourceName);
            return this.compare(stateValue, operator, value);
        }

        // Keyword-based conditions
        if (keywords && Array.isArray(keywords)) {
            const unitKeywords = this.getUnitKeywords(entity);
            if (operator === "includes") {
                return keywords.some((k) => unitKeywords.includes(k.toUpperCase()));
            }
            if (operator === "notIncludes") {
                return !keywords.some((k) => unitKeywords.includes(k.toUpperCase()));
            }
        }

        return true;
    }

    /**
     * Get a state flag value for an entity
     * @param entity - The entity to check
     * @param state - The state to check
     * @param leaderSourceName - For leader abilities, the name of the specific leader to check
     */
    private getStateValue(entity: Entity, state: string, leaderSourceName?: string): boolean {
        const unit = this.resolveEntityToUnit(entity);
        if (!unit) return false;

        const combatState = unit.combatState;
        if (!combatState) return false;

        switch (state) {
            case "isStationary":
                return combatState.movementBehaviour === "hold";
            case "isBattleShocked":
                return combatState.isBattleShocked ?? false;
            case "inCover":
            case "isInCover":
                return combatState.isInCover ?? false;
            case "inEngagementRange":
            case "isInEngagementRange":
                return combatState.isInEngagementRange ?? false;
            case "hasChargedThisTurn":
            case "hasCharged":
                return combatState.hasCharged ?? false;
            case "hasFiredThisPhase":
            case "hasShot":
                return combatState.hasShot ?? false;
            case "isBelowHalfStrength":
                return combatState.unitStrength === "belowHalf";
            case "isBelowStartingStrength":
                return combatState.unitStrength === "belowStarting" || combatState.unitStrength === "belowHalf";
            case "isDamaged":
                return combatState.isDamaged ?? false;
            // Phase-based conditions (check context, not unit state)
            case "isRangedPhase":
            case "isShootingPhase":
                return this.context.phase === "shooting";
            case "isMeleePhase":
            case "isFightPhase":
                return this.context.phase === "fight";
            // Leader condition: unit has an attached leader who is still alive
            // If leaderSourceName provided, check that specific leader; otherwise any leader
            case "isLeadingUnit":
                return this.isLeaderAlive(unit, leaderSourceName);
            default:
                return false;
        }
    }

    /**
     * Check if a unit has an attached leader who is still alive.
     *
     * @param unit - The unit to check
     * @param specificLeaderName - If provided, check only this specific leader; otherwise check any leader
     * @returns true if the leader (or any leader if not specified) is still alive
     */
    private isLeaderAlive(unit: any, specificLeaderName?: string): boolean {
        const sourceUnits = unit.sourceUnits;
        if (!sourceUnits || !Array.isArray(sourceUnits)) return false;

        const leaderSources = sourceUnits.filter((su: any) => su.isLeader);
        if (leaderSources.length === 0) return false;

        // Check if at least one leader model is still alive
        const modelInstances = unit.modelInstances || [];
        const deadModelIds = unit.combatState?.deadModelIds || [];

        for (const leaderSource of leaderSources) {
            // If checking a specific leader, skip others
            if (specificLeaderName && leaderSource.name !== specificLeaderName) {
                continue;
            }

            // Find models that belong to this leader
            const leaderModels = modelInstances.filter((m: any) => m.sourceUnitName === leaderSource.name);

            // If at least one model from this leader is alive, the leader is active
            const hasAliveModel = leaderModels.some((m: any) => !deadModelIds.includes(m.instanceId));

            if (hasAliveModel) return true;
        }

        return false;
    }

    /**
     * Resolve entity to the appropriate unit
     */
    private resolveEntityToUnit(entity: Entity) {
        switch (entity) {
            case "thisUnit":
            case "thisModel":
            case "thisArmy":
                return this.context.attacker.unit;
            case "targetUnit":
            case "targetModel":
            case "opposingUnit":
            case "opposingModel":
            case "opponentArmy":
                return this.context.defender.unit;
            default:
                return null;
        }
    }

    /**
     * Get keywords for an entity
     */
    private getUnitKeywords(entity: Entity): string[] {
        const unit = this.resolveEntityToUnit(entity);
        if (!unit) return [];

        const keywords = unit.keywords || [];

        // Keywords can be either strings or objects with a 'keyword' property
        return keywords.map((k: string | { keyword: string }) => {
            const keyword = typeof k === "string" ? k : k.keyword;
            return keyword.toUpperCase();
        });
    }

    /**
     * Compare values using the specified operator
     */
    private compare(actual: any, operator: string, expected: any): boolean {
        switch (operator) {
            case "equals":
                return actual === expected;
            case "notEquals":
                return actual !== expected;
            case "greaterThan":
                return actual > expected;
            case "greaterThanOrEqualTo":
                return actual >= expected;
            case "lessThan":
                return actual < expected;
            case "lessThanOrEqualTo":
                return actual <= expected;
            case "includes":
                return Array.isArray(actual) && actual.includes(expected);
            case "notIncludes":
                return Array.isArray(actual) && !actual.includes(expected);
            default:
                return false;
        }
    }

    /**
     * Compute final to-hit value
     */
    private computeFinalToHit(baseToHit: number | string, modifiers: StepModifiers): number | "auto" {
        // Check for auto-hit (TORRENT) via mechanics
        const hasAutoHit = this.hasAutoSuccessForAttribute("h");
        if (hasAutoHit) return "auto";

        if (typeof baseToHit === "string") {
            // Variable BS/WS (rare, but handle it)
            return baseToHit as any;
        }

        return Math.max(2, Math.min(6, baseToHit - modifiers.cappedTotal));
    }

    /**
     * Check if any collected mechanic grants autoSuccess for a given attribute
     */
    private hasAutoSuccessForAttribute(attribute: Attribute): boolean {
        return this.collectedMechanics.some(({ mechanic }) => mechanic.effect === "autoSuccess" && mechanic.attribute === attribute && this.evaluateConditions(mechanic.conditions));
    }

    /**
     * Check if any collected mechanic has ignoreModifier for a given attribute and modifier type
     */
    private hasIgnoreModifierFor(attribute: Attribute, modifierType: string): boolean {
        return this.collectedMechanics.some(({ mechanic }) => mechanic.effect === "ignoreModifier" && mechanic.attribute === attribute && mechanic.value === modifierType && this.evaluateConditions(mechanic.conditions));
    }

    /**
     * Compute final to-wound value
     */
    private computeFinalToWound(baseToWound: number, modifiers: StepModifiers): number {
        return Math.max(2, Math.min(6, baseToWound - modifiers.cappedTotal));
    }

    /**
     * Compute final save value
     */
    private computeFinalSave(armorSave: number, invulnSave: number | null, ap: number, modifiers: StepModifiers): { finalSave: number; useInvuln: boolean } {
        // AP worsens save (AP is negative, so we subtract it which adds to the save number)
        const modifiedArmor = armorSave - ap + modifiers.cappedTotal;

        if (invulnSave && invulnSave < modifiedArmor) {
            return { finalSave: invulnSave, useInvuln: true };
        }

        return { finalSave: modifiedArmor, useInvuln: false };
    }

    /**
     * Compute critical hit threshold (normally 6)
     * Can be lowered by abilities like "Critical Hit on 5+"
     */
    private computeCriticalHitThreshold(): { criticalHitThreshold: number } {
        // Default critical hit threshold is 6
        // Future: check for abilities that modify this
        return { criticalHitThreshold: 6 };
    }

    /**
     * Compute critical wound threshold (normally 6)
     * Can be lowered by ANTI-X abilities when target has matching keyword
     */
    private computeCriticalWoundThreshold(): { criticalWoundThreshold: number; criticalWoundSource?: string } {
        // Default critical wound threshold is 6
        let threshold = 6;
        let source: string | undefined;

        // Check for ANTI-X effects
        const defenderKeywords = this.getUnitKeywords("targetUnit");

        for (const effect of this.weaponEffects) {
            if (effect.type === "antiKeyword" && typeof effect.value === "string") {
                // Parse "KEYWORD X+" format from value
                const match = effect.value.match(/^(.+)\s+(\d)\+$/);
                if (match) {
                    const keyword = match[1].toUpperCase();
                    const antiThreshold = parseInt(match[2], 10);

                    // Check if defender has the keyword
                    if (defenderKeywords.includes(keyword)) {
                        // Use the lowest threshold if multiple ANTI-X apply
                        if (antiThreshold < threshold) {
                            threshold = antiThreshold;
                            source = `ANTI-${keyword} ${antiThreshold}+`;
                        }
                    }
                }
            }
        }

        return { criticalWoundThreshold: threshold, criticalWoundSource: source };
    }

    /**
     * Compute BLAST bonus attacks per model
     * BLAST: +1 attack per 5 models in target unit
     */
    private computeBlastEffect(): { bonusPerModel: number } | null {
        const hasBlast = this.weaponEffects.some((e) => e.type === "blast");
        if (!hasBlast) return null;

        const defenderModelCount = this.context.defender.modelCount;
        const bonusPerModel = Math.floor(defenderModelCount / 5);

        return { bonusPerModel };
    }

    /**
     * Derive FNP value from collected mechanics with setsFnp effect.
     * FNP is an ability-granted characteristic, not a base model stat.
     * Returns the best (lowest) FNP value, or null if none.
     */
    private deriveFnpFromMechanics(): number | null {
        let bestFnp: number | null = null;

        for (const { mechanic, leaderSourceName } of this.collectedMechanics) {
            if (mechanic.effect === "setsFnp" && typeof mechanic.value === "number") {
                // Evaluate conditions (e.g., phase-specific FNP, leader alive check)
                if (!this.evaluateConditions(mechanic.conditions, leaderSourceName)) continue;

                // Take the best (lowest) FNP value
                if (bestFnp === null || mechanic.value < bestFnp) {
                    bestFnp = mechanic.value;
                }
            }
        }

        return bestFnp;
    }
}

/**
 * Convenience function to resolve combat
 */
export function resolveCombat(context: CombatContext): CombatResolution {
    const engine = new CombatEngine(context);
    return engine.resolve();
}
