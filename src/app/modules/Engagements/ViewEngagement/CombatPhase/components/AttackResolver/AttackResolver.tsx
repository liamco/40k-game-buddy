import React, { Fragment, useMemo } from "react";

import type { CombatResolution } from "#game-engine";

import { getCriticalEffectForStep } from "../../utils/combatUtils";

import AttackStep from "./AttackStep";

interface AttackResolverProps {
    resolution: CombatResolution | null;
    modelCount: number;
}

/**
 * AttackResolver - Display component for combat resolution
 *
 * Receives pre-calculated CombatResolution from the game engine and renders
 * each attack step with attributed modifiers.
 */
export function AttackResolver({ resolution, modelCount }: AttackResolverProps) {
    // Calculate total attacks display (including BLAST bonus and weapon count)
    const attacksDisplay = useMemo(() => {
        if (!resolution || modelCount === 0) {
            return { perModel: "-", total: "-" };
        }

        const baseAttacks = resolution.baseAttacks;
        const blastBonus = resolution.blastBonusPerModel;
        const weaponCount = resolution.weaponCount || 1;

        if (typeof baseAttacks === "number") {
            // Apply BLAST bonus per model, then multiply by weapon count
            const attacksPerWeapon = blastBonus !== null ? baseAttacks + blastBonus : baseAttacks;
            const attacksPerModel = attacksPerWeapon * weaponCount;

            return {
                perModel: weaponCount > 1 ? `${attacksPerWeapon} x${weaponCount}` : String(attacksPerModel),
                total: String(attacksPerModel * modelCount),
            };
        }

        // Dice expression (e.g., "D6", "D3+1") - BLAST adds flat bonus, then multiply by weapon count
        let perWeaponDisplay = String(baseAttacks);
        if (blastBonus !== null && blastBonus > 0) {
            perWeaponDisplay = `${baseAttacks}+${blastBonus}`;
        }

        const perModelDisplay = weaponCount > 1 ? `(${perWeaponDisplay}) x${weaponCount}` : perWeaponDisplay;

        return {
            perModel: perModelDisplay,
            total: modelCount > 1 ? `(${perModelDisplay}) x${modelCount}` : perModelDisplay,
        };
    }, [resolution, modelCount]);

    // Format to-hit display
    const toHitDisplay = useMemo(() => {
        if (!resolution) return { statValue: "-", finalValue: "-" };

        const isAutoHit = resolution.finalToHit === "auto";
        const baseValue = typeof resolution.baseToHit === "number" ? `${resolution.baseToHit}+` : String(resolution.baseToHit);

        return {
            statValue: isAutoHit ? "N/A" : baseValue,
            finalValue: isAutoHit ? "Auto" : `${resolution.finalToHit}+`,
        };
    }, [resolution]);

    // Format save display
    const saveDisplay = useMemo(() => {
        if (!resolution) return { finalValue: "-" };

        if (resolution.finalSave >= 7) {
            return { finalValue: "-" };
        }

        const invulnMarker = resolution.useInvuln ? "+" : "";
        return { finalValue: `${resolution.finalSave}+${invulnMarker}` };
    }, [resolution]);

    // Format wound display with critical threshold
    // If critical threshold is lower than the normal wound roll, display the critical value instead
    const woundDisplay = useMemo(() => {
        if (!resolution) return { finalValue: "-", isCritical: false };

        const normalWound = resolution.finalToWound;
        const criticalThreshold = resolution.criticalWoundThreshold;

        // Use critical threshold if it's lower than the normal wound roll
        const useCritical = criticalThreshold < normalWound;
        const displayValue = useCritical ? criticalThreshold : normalWound;

        return {
            finalValue: `${displayValue}+`,
            isCritical: useCritical,
        };
    }, [resolution]);

    // Get critical effects for hit and wound steps
    const hitCriticalEffect = useMemo(() => (resolution ? getCriticalEffectForStep(resolution.weaponEffects, "hitRoll") : null), [resolution]);

    const woundCriticalEffect = useMemo(() => (resolution ? getCriticalEffectForStep(resolution.weaponEffects, "woundRoll") : null), [resolution]);

    return (
        <section className="grid grid-rows-5 rounded overflow-auto h-full">
            {resolution ? (
                <Fragment>
                    <AttackStep stepType="attacks" label="Attacks" statLabel="A" statValue={attacksDisplay.perModel} bonuses={resolution.attacksModifiers.forDisplay.bonuses} penalties={resolution.attacksModifiers.forDisplay.penalties} finalValue={attacksDisplay.total} rerollSource={resolution.rerolls["a"]?.name} />
                    <AttackStep
                        stepType="hitChance"
                        label="To hit"
                        statLabel="BS/WS"
                        statValue={toHitDisplay.statValue}
                        bonuses={resolution.hitModifiers.forDisplay.bonuses}
                        penalties={resolution.hitModifiers.forDisplay.penalties}
                        finalValue={toHitDisplay.finalValue}
                        criticalEffect={hitCriticalEffect}
                        rerollSource={resolution.rerolls["h"]?.name}
                    />
                    <AttackStep
                        stepType="woundChance"
                        label="To wound"
                        statLabel={`S${resolution.weaponStrength} vs T${resolution.targetToughness}`}
                        statValue=""
                        bonuses={resolution.woundModifiers.forDisplay.bonuses}
                        penalties={resolution.woundModifiers.forDisplay.penalties}
                        finalValue={woundDisplay.finalValue}
                        isCritical={woundDisplay.isCritical}
                        criticalEffect={woundCriticalEffect}
                        rerollSource={resolution.rerolls["w"]?.name}
                    />
                    <AttackStep
                        stepType="saveChance"
                        label="To save"
                        statLabel="Save"
                        statValue={`${resolution.baseSave}+`}
                        bonuses={resolution.saveModifiers.forDisplay.bonuses}
                        penalties={resolution.weaponAp !== 0 ? [{ label: "AP", value: resolution.weaponAp }] : []}
                        finalValue={saveDisplay.finalValue}
                        rerollSource={resolution.rerolls["s"]?.name}
                    />
                    <AttackStep stepType="feelNoPain" label="Feel no pain" bonuses={resolution.fnpModifiers.forDisplay.bonuses} penalties={resolution.fnpModifiers.forDisplay.penalties} finalValue={resolution.finalFnp ? `${resolution.finalFnp}+` : "-"} disabled={!resolution.finalFnp} rerollSource={resolution.rerolls["fnp"]?.name} />
                </Fragment>
            ) : (
                <div className="col-span-5 py-8 text-center w-full flex items-center justify-center gap-4">
                    <span>+++</span>
                    <span className="text-blockcaps-m">Select attacker and target to calculate attack resolution</span>
                    <span>+++</span>
                </div>
            )}
        </section>
    );
}

export default AttackResolver;
