import React, { Fragment, useMemo } from "react";

import type { CombatResolution } from "#game-engine";

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
    // Calculate total attacks display
    const attacksDisplay = useMemo(() => {
        if (!resolution || modelCount === 0) {
            return { perModel: "-", total: "-" };
        }

        const attacksPerModel = resolution.baseAttacks;

        if (typeof attacksPerModel === "number") {
            return {
                perModel: String(attacksPerModel),
                total: String(attacksPerModel * modelCount),
            };
        }

        // Dice expression (e.g., "D6", "D3+1")
        return {
            perModel: String(attacksPerModel),
            total: modelCount > 1 ? `${attacksPerModel} x${modelCount}` : String(attacksPerModel),
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

    return (
        <section className="grid grid-rows-5 rounded overflow-auto h-[calc(100vh-161.5px)]">
            {resolution ? (
                <Fragment>
                    <AttackStep stepType="attacks" label="Attacks" statLabel="A" statValue={attacksDisplay.perModel} bonuses={resolution.attacksModifiers.forDisplay.bonuses} penalties={resolution.attacksModifiers.forDisplay.penalties} finalValue={attacksDisplay.total} />
                    <AttackStep stepType="hitChance" label="To hit" statLabel="BS/WS" statValue={toHitDisplay.statValue} bonuses={resolution.hitModifiers.forDisplay.bonuses} penalties={resolution.hitModifiers.forDisplay.penalties} finalValue={toHitDisplay.finalValue} />
                    <AttackStep
                        stepType="woundChance"
                        label="To wound"
                        statLabel={`S${resolution.weaponStrength} vs T${resolution.targetToughness}`}
                        statValue=""
                        bonuses={resolution.woundModifiers.forDisplay.bonuses}
                        penalties={resolution.woundModifiers.forDisplay.penalties}
                        finalValue={woundDisplay.finalValue}
                        isCritical={woundDisplay.isCritical}
                    />
                    <AttackStep
                        stepType="saveChance"
                        label="To save"
                        statLabel="Save"
                        statValue={`${resolution.baseSave}+`}
                        bonuses={resolution.saveModifiers.forDisplay.bonuses}
                        penalties={resolution.weaponAp !== 0 ? [{ label: "AP", value: resolution.weaponAp }] : []}
                        finalValue={saveDisplay.finalValue}
                    />
                    <AttackStep stepType="feelNoPain" label="Feel no pain" bonuses={resolution.fnpModifiers.forDisplay.bonuses} penalties={resolution.fnpModifiers.forDisplay.penalties} finalValue={resolution.finalFnp ? `${resolution.finalFnp}+` : "-"} disabled={!resolution.finalFnp} />
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
