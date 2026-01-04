import React from 'react';
import type { Datasheet, Weapon, Modifiers, AttackResult, WeaponProfile, Model, GamePhase, Ability } from "../../types";

interface AttackResolverProps {
    gamePhase: GamePhase;
    attackingUnit: Datasheet | null;
    defendingUnit: Datasheet | null;
    selectedWeaponProfile: WeaponProfile | null;
    selectedDefendingModel: Model | null;
    modifiers: Modifiers;
    activeAttackerStratagems: string[];
    activeDefenderStratagems: string[];
}

function calculateAttack(
    attackingWeapon: WeaponProfile | null,
    defendingUnit: Datasheet | null,
    defendingModel: Model | null,
    modifiers: Modifiers,
    activeAttackerStratagems: string[],
    activeDefenderStratagems: string[]
): AttackResult | null {
    if (!attackingWeapon || !defendingModel) return null;

    // Calculate To Hit
    let toHit = attackingWeapon.bsWs;
    let autoHit = false;
    const hitBonuses: { label: string; value: number }[] = [];
    const hitPenalties: { label: string; value: number }[] = [];

    const attackerHasHeavy = attackingWeapon.attributes.includes("HEAVY");
    const attackerHasTorrent = attackingWeapon.attributes.includes("TORRENT");

    if(attackerHasHeavy && modifiers.stationaryThisTurn) {
        hitBonuses.push({ label: "HEAVY", value: 1 });
        toHit -= 1;
    }

    if(attackerHasTorrent) { autoHit = true; }
    
    const defenderHasStealth = defendingUnit?.abilities?.some((ability:Ability)=>ability.name === 'Stealth');
    
    if (defenderHasStealth) {
        hitPenalties.push({ label: "STEALTH", value: -1 });
        toHit += 1;
    }

    // Calculate To Wound
    const woundBonuses: { label: string; value: number }[] = [];
    const woundPenalties: { label: string; value: number }[] = [];
    let toWound: number;

    const strengthVsToughness = attackingWeapon.s / defendingModel.t;
    
    if (strengthVsToughness >= 2) {
        toWound = 2;
    } else if (strengthVsToughness > 1) {
        toWound = 3;
    } else if (strengthVsToughness === 1) {
        toWound = 4;
    } else if (strengthVsToughness > 0.5) {
        toWound = 5;
    } else {
        toWound = 6;
    }

    // Calculate To Save
    const saveBonuses: { label: string; value: number }[] = [];
    const savePenalties: { label: string; value: number }[] = [];
    let toSave = defendingModel.sv;
    let invulnSave = false;

    if (attackingWeapon.ap < 0) {
        savePenalties.push({ label: "AP", value: attackingWeapon.ap });
        toSave -= attackingWeapon.ap;
    }

    if (modifiers.inCover && toSave > 3 && !attackingWeapon.attributes.includes('IGNORES COVER')) {
        saveBonuses.push({ label: "COVER", value: 1 });
        toSave -= 1;
    }
    
    if (defendingModel.invSv && defendingModel.invSv <= toSave) {
        toSave = defendingModel.invSv;
        invulnSave = true;
    }

    // Make sure values are at least 2+
    toHit = Math.max(2, toHit);
    toWound = Math.max(2, toWound);
    toSave = Math.max(2, toSave);

    // Feel No Pain
    let feelNoPain = null;

    if(defendingUnit) {
        feelNoPain = defendingUnit.abilities?.find((ability:Ability)=>ability.name === 'Feel No Pain')?.parameter || null;
    }

    return {
        toHit,
        autoHit,
        toWound,
        toSave,
        invulnSave,
        feelNoPain,
        hitBonuses,
        hitPenalties,
        woundBonuses,
        woundPenalties,
        saveBonuses,
        savePenalties,
    };
}

function ModifierBadge({ label, className }: { label: string; className?: string }) {
    return (
        <div className={`bg-[#b3b3b3] px-1 py-0.5 rounded-[2px] ${className || ""}`}>
            <p className=" font-bold text-[8px]  uppercase">
                {label}
            </p>
        </div>
    );
}

function ResultBox({
    label,
    value,
    modifiers,
}: {
    label?: string;
    value: string;
    modifiers?: { label: string; value: number }[];
}) {
    return (
        <div className="flex flex-col items-center justify-center gap-1">
            {label && (
                <p className=" font-bold text-[10px] ">
                    {label}
                </p>
            )}
            {modifiers && modifiers.length > 0 && modifiers.some((m) => m.value !== 0) && (
                <div className="flex flex-wrap gap-1 justify-center">
                    {modifiers
                        .filter((m) => m.value !== 0)
                        .map((mod, idx) => (
                            <ModifierBadge key={idx} label={mod.label} />
                        ))}
                </div>
            )}
            <p className=" font-bold text-[24px] ">
                {value}
            </p>
        </div>
    );
}

function FinalResultBox({ value }: { value: string }) {
    return (
        <div className="bg-[#2b344c] rounded-[4px] p-4 flex items-center justify-center">
            <p className=" font-bold text-[24px] text-white">
                {value}
            </p>
        </div>
    );
}

export function AttackResolver({
    attackingUnit,
    defendingUnit,
    selectedWeaponProfile,
    selectedDefendingModel,
    modifiers,
    activeAttackerStratagems,
    activeDefenderStratagems,
}: AttackResolverProps) {
    const result = calculateAttack(
        selectedWeaponProfile,
        defendingUnit,
        selectedDefendingModel,
        modifiers,
        activeAttackerStratagems,
        activeDefenderStratagems
    );

    if (!result) {
        return (
            <div className="bg-white rounded-[8px] border-4 border-[#e6e6e6] p-6 flex items-center justify-center min-h-[300px]">
                <p className="text-[#767676] text-center">
                    Select an attacking unit with a weapon and a target unit to calculate attack resolution
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-[8px] border-4 border-[#e6e6e6] p-6 space-y-6">
            
            <section>
                <p className=" font-bold text-[12px]  pb-2 border-b border-[#e6e6e6]">
                    To hit
                </p>
                <div className="grid grid-cols-4 gap-2 pt-4">
                    <ResultBox label="BS" value={(result.autoHit) ? 'N/A' : `${selectedWeaponProfile?.bsWs}+`} />
                    {result.hitBonuses.length 
                        ?
                        <ResultBox
                            value={result.hitBonuses[0].value > 0 ? `+${result.hitBonuses[0].value}` : `${result.hitBonuses[0].value}`}
                            modifiers={[result.hitBonuses[0]]}
                        />
                        :
                        <div className="flex items-center justify-center">
                            <p className=" font-bold text-[24px] ">
                                -
                            </p>
                        </div>
                    }
                    {result.hitPenalties.length 
                        ?
                        <ResultBox
                            value={result.hitPenalties[0].value > 0 ? `+${result.hitPenalties[0].value}` : `${result.hitPenalties[0].value}`}
                            modifiers={[result.hitPenalties[0]]}
                        />
                        :
                        <div className="flex items-center justify-center">
                            <p className=" font-bold text-[24px] ">
                                -
                            </p>
                        </div>
                    }
                    <FinalResultBox value={(result.autoHit) ? 'Auto' : `${result.toHit}+`} />
                </div>
            </section>

            <section>
                <p className=" font-bold text-[12px]  pb-2 border-b border-[#e6e6e6]">
                    To wound
                </p>
                <div className="grid grid-cols-4 gap-2 pt-4">
                    <div className="flex items-center justify-center">
                        <p className=" font-bold text-[24px] ">
                            -
                        </p>
                    </div>
                    {result.woundBonuses.length 
                        ?
                        <ResultBox
                            value={result.woundBonuses[0].value > 0 ? `+${result.woundBonuses[0].value}` : `${result.woundBonuses[0].value}`}
                            modifiers={[result.woundBonuses[0]]}
                        />
                        :
                        <div className="flex items-center justify-center">
                            <p className=" font-bold text-[24px] ">
                                -
                            </p>
                        </div>
                    }
                    {result.woundPenalties.length 
                        ?
                        <ResultBox
                            value={result.woundPenalties[0].value > 0 ? `+${result.woundPenalties[0].value}` : `${result.woundPenalties[0].value}`}
                            modifiers={[result.woundPenalties[0]]}
                        />
                        :
                        <div className="flex items-center justify-center">
                            <p className=" font-bold text-[24px] ">
                                -
                            </p>
                        </div>
                    }
                    <FinalResultBox value={`${result.toWound}+`} />
                </div>
            </section>

            <section>
                <p className=" font-bold text-[12px]  pb-2 border-b border-[#e6e6e6]">
                    To save
                </p>
                <div className="grid grid-cols-4 gap-2 pt-4">
                    <ResultBox label="Save" value={`${selectedDefendingModel?.sv}+`} />
                    {result.saveBonuses.length 
                        ?
                        <ResultBox
                            value={result.saveBonuses[0].value > 0 ? `+${result.saveBonuses[0].value}` : `${result.saveBonuses[0].value}`}
                            modifiers={[result.saveBonuses[0]]}
                        />
                        :
                        <div className="flex items-center justify-center">
                            <p className=" font-bold text-[24px] ">
                                -
                            </p>
                        </div>
                    }
                    {result.savePenalties.length 
                        ?
                        <ResultBox
                            value={result.savePenalties[0].value > 0 ? `+${result.savePenalties[0].value}` : `${result.savePenalties[0].value}`}
                            modifiers={[result.savePenalties[0]]}
                        />
                        :
                        <div className="flex items-center justify-center">
                            <p className=" font-bold text-[24px] ">
                                -
                            </p>
                        </div>
                    }
                    <FinalResultBox value={result.toSave < 7 ? `${result.toSave}+${(result.invulnSave)?'+':''}` : `-`} />
                </div>
            </section>

            <section>
                <p className=" font-bold text-[12px]  pb-2 border-b border-[#e6e6e6]">
                    Feel no pain
                </p>
                <div className="grid grid-cols-4 gap-2 pt-4">
                    <div className="flex items-center justify-center">
                        <p className=" font-bold text-[24px] ">
                            -
                        </p>
                    </div>
                    <div className="flex items-center justify-center">
                        <p className=" font-bold text-[24px] ">
                            -
                        </p>
                    </div>
                    <div className="flex items-center justify-center">
                        <p className=" font-bold text-[24px] ">
                            -
                        </p>
                    </div>
                    <FinalResultBox value={result.feelNoPain ? `${result.feelNoPain}+` : "-"} />
                </div>
            </section>
        </div>
    );
}

export default AttackResolver