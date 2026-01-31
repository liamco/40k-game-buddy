import React, { Fragment, useMemo } from "react";

import type { EngagementForceItem } from "#types/Engagements";
import type { WeaponProfile, Model, GamePhase } from "#types/index";

import AttackStep from "./AttackStep";

export interface AttackerData {
    unit: EngagementForceItem | null;
    attachedLeaders: EngagementForceItem[];
    bodyguardUnit?: EngagementForceItem;
    weaponProfile: WeaponProfile | null;
    modelCount: number;
}

export interface DefenderData {
    unit: EngagementForceItem | null;
    attachedLeaders: EngagementForceItem[];
    bodyguardUnit?: EngagementForceItem;
    model: Model | null;
}

interface AttackResolverProps {
    gamePhase: GamePhase;
    attacker: AttackerData;
    defender: DefenderData;
}

/**
 * Calculate to-wound roll target based on strength vs toughness
 */
function calculateToWound(strength: number, toughness: number): number {
    if (strength >= toughness * 2) return 2;
    if (strength > toughness) return 3;
    if (strength === toughness) return 4;
    if (strength * 2 <= toughness) return 6;
    return 5;
}

/**
 * Calculate save roll target based on armor save and AP
 */
function calculateSave(armorSave: number, ap: number, invulnSave?: number): { save: number; isInvuln: boolean } {
    const modifiedArmorSave = armorSave - ap; // AP is negative, so subtracting makes it worse

    if (invulnSave && invulnSave < modifiedArmorSave) {
        return { save: invulnSave, isInvuln: true };
    }

    return { save: modifiedArmorSave, isInvuln: false };
}

export function AttackResolver({ gamePhase, attacker, defender }: AttackResolverProps) {
    const result = useMemo(() => {
        if (!attacker.unit || !defender.unit || !attacker.weaponProfile || !defender.model) {
            return null;
        }

        const weapon = attacker.weaponProfile;
        const targetModel = defender.model;
        const combatState = attacker.unit.combatState;

        // Check for auto-hit (TORRENT)
        const autoHit = weapon.attributes?.includes("TORRENT") ?? false;

        // Calculate to-hit (BS/WS from weapon profile)
        const toHit = weapon.bsWs;

        // Calculate to-wound
        const strength = weapon.s;
        const toughness = targetModel.T;
        const toWound = calculateToWound(strength, toughness);

        // Calculate save
        const armorSave = targetModel.sv;
        const ap = weapon.ap;
        const invulnSave = targetModel.invSv;
        const { save: toSave, isInvuln } = calculateSave(armorSave, ap, invulnSave);

        // Check for Feel No Pain
        const fnp = targetModel.fnp || null;

        return {
            toHit,
            autoHit,
            toWound,
            toSave,
            isInvuln,
            fnp,
            weapon,
            targetModel,
        };
    }, [attacker, defender]);

    // Calculate total attacks display
    const attacksDisplay = useMemo(() => {
        if (!attacker.weaponProfile || attacker.modelCount === 0) {
            return { perModel: "-", total: "-" };
        }

        const attacksPerModel = attacker.weaponProfile.a;

        if (typeof attacksPerModel === "number") {
            return {
                perModel: String(attacksPerModel),
                total: String(attacksPerModel * attacker.modelCount),
            };
        }

        // Dice expression (e.g., "D6", "D3+1")
        return {
            perModel: String(attacksPerModel),
            total: attacker.modelCount > 1 ? `${attacksPerModel} x${attacker.modelCount}` : String(attacksPerModel),
        };
    }, [attacker.weaponProfile, attacker.modelCount]);

    return (
        <section className="grid grid-rows-5 rounded border-2 border-skarsnikGreen overflow-auto h-[calc(100vh-161.5px)]">
            {result ? (
                <Fragment>
                    <AttackStep stepType="attacks" label="Attacks" statLabel="A" statValue={attacksDisplay.perModel} bonuses={[]} penalties={[]} finalValue={attacksDisplay.total} />
                    <AttackStep stepType="hitChance" label="To hit" statLabel="BS/WS" statValue={result.autoHit ? "N/A" : `${result.toHit}+`} bonuses={[]} penalties={[]} finalValue={result.autoHit ? "Auto" : `${result.toHit}+`} />
                    <AttackStep stepType="woundChance" label="To wound" statLabel={`S${result.weapon.s} vs T${result.targetModel.T}`} statValue="" bonuses={[]} penalties={[]} finalValue={`${result.toWound}+`} />
                    <AttackStep
                        stepType="saveChance"
                        label="To save"
                        statLabel="Save"
                        statValue={`${result.targetModel.sv}+`}
                        bonuses={[]}
                        penalties={result.weapon.ap !== 0 ? [{ label: "AP", value: result.weapon.ap }] : []}
                        finalValue={result.toSave < 7 ? `${result.toSave}+${result.isInvuln ? "+" : ""}` : "-"}
                    />
                    <AttackStep stepType="feelNoPain" label="Feel no pain" bonuses={[]} penalties={[]} finalValue={result.fnp ? `${result.fnp}+` : "-"} disabled={!result.fnp} />
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
