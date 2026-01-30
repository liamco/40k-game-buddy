import React, { useState, useEffect, useMemo, useCallback } from "react";

import type { EngagementForce, EngagementForceItem, EngagementForceItemCombatState } from "#types/Engagements";
import type { WeaponProfile, Model, GamePhase } from "#types/index";

import { buildCombinedUnitItems, findCombinedUnitByItemId, calculateModelCount, getFirstWeaponProfileForPhase, getFirstValidDefenderModel, hasPrecisionAttribute, type CombinedUnitItem } from "./utils/combatUtils";

import AttackerPanel from "./components/AttackerPanel";
import DefenderPanel from "./components/DefenderPanel";
import AttackResolver from "./components/AttackResolver/AttackResolver";

interface OctagonProps {
    gamePhase: GamePhase;
    attackingForce: EngagementForce;
    defendingForce: EngagementForce;
    onUpdateUnitCombatState: (forceType: "attacking" | "defending", unitId: string, updates: Partial<EngagementForceItemCombatState>) => void;
}

/**
 * Octagon is the container component for the combat phase UI.
 * It manages all state for attacker/defender selections and passes
 * the appropriate data down to the AttackerPanel, DefenderPanel, and AttackResolver.
 */
export const Octagon = ({ gamePhase, attackingForce, defendingForce, onUpdateUnitCombatState }: OctagonProps) => {
    // Build combined unit items for each force
    const attackerCombinedItems = useMemo(() => buildCombinedUnitItems(attackingForce), [attackingForce]);
    const defenderCombinedItems = useMemo(() => buildCombinedUnitItems(defendingForce), [defendingForce]);

    // Attacker selections
    const [selectedAttackerItemId, setSelectedAttackerItemId] = useState<string | null>(null);
    const [selectedWeaponProfile, setSelectedWeaponProfile] = useState<WeaponProfile | null>(null);

    // Defender selections
    const [selectedDefenderItemId, setSelectedDefenderItemId] = useState<string | null>(null);
    const [selectedDefenderModel, setSelectedDefenderModel] = useState<Model | null>(null);

    // Stratagems
    const [activeAttackerStratagems, setActiveAttackerStratagems] = useState<string[]>([]);
    const [activeDefenderStratagems, setActiveDefenderStratagems] = useState<string[]>([]);

    // Derived: Get the selected combined items
    const selectedAttackerCombined = useMemo(() => findCombinedUnitByItemId(attackerCombinedItems, selectedAttackerItemId ?? undefined), [attackerCombinedItems, selectedAttackerItemId]);

    const selectedDefenderCombined = useMemo(() => findCombinedUnitByItemId(defenderCombinedItems, selectedDefenderItemId ?? undefined), [defenderCombinedItems, selectedDefenderItemId]);

    // Calculate model counts and starting strengths
    const attackerModelCount = useMemo(() => {
        if (!selectedAttackerCombined) return 0;
        // Use persisted combat state model count if available
        const persistedCount = selectedAttackerCombined.item.combatState?.modelCount;
        if (persistedCount !== undefined) return persistedCount;
        // Otherwise calculate from composition
        return calculateModelCount(selectedAttackerCombined.item, selectedAttackerCombined.bodyguardUnit);
    }, [selectedAttackerCombined]);

    const attackerStartingStrength = useMemo(() => {
        if (!selectedAttackerCombined) return 0;
        return calculateModelCount(selectedAttackerCombined.item, selectedAttackerCombined.bodyguardUnit);
    }, [selectedAttackerCombined]);

    const defenderModelCount = useMemo(() => {
        if (!selectedDefenderCombined) return 0;
        const persistedCount = selectedDefenderCombined.item.combatState?.modelCount;
        if (persistedCount !== undefined) return persistedCount;
        return calculateModelCount(selectedDefenderCombined.item, selectedDefenderCombined.bodyguardUnit);
    }, [selectedDefenderCombined]);

    const defenderStartingStrength = useMemo(() => {
        if (!selectedDefenderCombined) return 0;
        return calculateModelCount(selectedDefenderCombined.item, selectedDefenderCombined.bodyguardUnit);
    }, [selectedDefenderCombined]);

    // Handle attacker unit selection
    const handleAttackerUnitChange = useCallback(
        (combined: CombinedUnitItem) => {
            setSelectedAttackerItemId(combined.item.listItemId);
            // Auto-select first weapon profile for the current phase
            const weaponProfile = getFirstWeaponProfileForPhase(combined.item.wargear || [], gamePhase === "shooting" || gamePhase === "fight" ? gamePhase : "shooting");
            setSelectedWeaponProfile(weaponProfile);
        },
        [gamePhase]
    );

    // Handle defender unit selection
    const handleDefenderUnitChange = useCallback(
        (combined: CombinedUnitItem) => {
            setSelectedDefenderItemId(combined.item.listItemId);
            // Auto-select first valid model (respecting precision rules)
            const validModel = getFirstValidDefenderModel(combined, selectedWeaponProfile);
            setSelectedDefenderModel(validModel);
        },
        [selectedWeaponProfile]
    );

    // Handle weapon profile change - may need to update defender model selection
    const handleWeaponProfileChange = useCallback(
        (profile: WeaponProfile | null) => {
            setSelectedWeaponProfile(profile);

            // Check if current defender model selection is still valid
            if (selectedDefenderCombined && selectedDefenderModel) {
                const isLeaderModel = selectedDefenderCombined.isCombined && selectedDefenderCombined.allLeaders.some((leader) => leader.models?.some((m) => m.name === selectedDefenderModel.name));

                // If targeting a leader without precision, re-select
                if (isLeaderModel && !hasPrecisionAttribute(profile)) {
                    const validModel = getFirstValidDefenderModel(selectedDefenderCombined, profile);
                    if (validModel && validModel.name !== selectedDefenderModel.name) {
                        setSelectedDefenderModel(validModel);
                    }
                }
            }
        },
        [selectedDefenderCombined, selectedDefenderModel]
    );

    // Handle attacker combat status changes
    const handleAttackerCombatStatusChange = useCallback(
        (updates: Partial<EngagementForceItemCombatState>) => {
            if (selectedAttackerItemId) {
                onUpdateUnitCombatState("attacking", selectedAttackerItemId, updates);
            }
        },
        [selectedAttackerItemId, onUpdateUnitCombatState]
    );

    // Handle defender combat status changes
    const handleDefenderCombatStatusChange = useCallback(
        (updates: Partial<EngagementForceItemCombatState>) => {
            if (selectedDefenderItemId) {
                onUpdateUnitCombatState("defending", selectedDefenderItemId, updates);
            }
        },
        [selectedDefenderItemId, onUpdateUnitCombatState]
    );

    // Handle model count changes
    const handleAttackerModelCountChange = useCallback(
        (count: number) => {
            if (selectedAttackerItemId) {
                onUpdateUnitCombatState("attacking", selectedAttackerItemId, { modelCount: count });
            }
        },
        [selectedAttackerItemId, onUpdateUnitCombatState]
    );

    const handleDefenderModelCountChange = useCallback(
        (count: number) => {
            if (selectedDefenderItemId) {
                onUpdateUnitCombatState("defending", selectedDefenderItemId, { modelCount: count });
            }
        },
        [selectedDefenderItemId, onUpdateUnitCombatState]
    );

    // Re-select weapon when game phase changes
    useEffect(() => {
        if (selectedAttackerCombined && (gamePhase === "shooting" || gamePhase === "fight")) {
            const currentWeaponType = selectedWeaponProfile ? selectedAttackerCombined.item.wargear?.find((w) => w.profiles.some((p) => p.name === selectedWeaponProfile.name))?.type : null;
            const expectedType = gamePhase === "shooting" ? "Ranged" : "Melee";

            // Only re-select if current weapon is wrong type or no weapon selected
            if (!selectedWeaponProfile || currentWeaponType !== expectedType) {
                const newWeaponProfile = getFirstWeaponProfileForPhase(selectedAttackerCombined.item.wargear || [], gamePhase);
                setSelectedWeaponProfile(newWeaponProfile);

                // Also update defender model selection based on new weapon's precision status
                if (selectedDefenderCombined) {
                    const validModel = getFirstValidDefenderModel(selectedDefenderCombined, newWeaponProfile);
                    setSelectedDefenderModel(validModel);
                }
            }
        }
    }, [gamePhase]);

    return (
        <div className="grid grid-cols-[4fr_4fr_3fr] gap-2 mt-6">
            <AttackerPanel
                gamePhase={gamePhase}
                force={attackingForce}
                combinedItems={attackerCombinedItems}
                selectedCombined={selectedAttackerCombined}
                onUnitChange={handleAttackerUnitChange}
                selectedWeaponProfile={selectedWeaponProfile}
                onWeaponProfileChange={handleWeaponProfileChange}
                modelCount={attackerModelCount}
                startingStrength={attackerStartingStrength}
                onModelCountChange={handleAttackerModelCountChange}
                onCombatStatusChange={handleAttackerCombatStatusChange}
            />
            <DefenderPanel
                gamePhase={gamePhase}
                force={defendingForce}
                combinedItems={defenderCombinedItems}
                selectedCombined={selectedDefenderCombined}
                onUnitChange={handleDefenderUnitChange}
                selectedModel={selectedDefenderModel}
                onModelChange={setSelectedDefenderModel}
                selectedWeaponProfile={selectedWeaponProfile}
                modelCount={defenderModelCount}
                startingStrength={defenderStartingStrength}
                onModelCountChange={handleDefenderModelCountChange}
                onCombatStatusChange={handleDefenderCombatStatusChange}
            />
            <AttackResolver
                gamePhase={gamePhase}
                attacker={{
                    unit: selectedAttackerCombined?.item ?? null,
                    attachedLeaders: selectedAttackerCombined?.allLeaders ?? [],
                    bodyguardUnit: selectedAttackerCombined?.bodyguardUnit,
                    weaponProfile: selectedWeaponProfile,
                    modelCount: attackerModelCount,
                }}
                defender={{
                    unit: selectedDefenderCombined?.item ?? null,
                    attachedLeaders: selectedDefenderCombined?.allLeaders ?? [],
                    bodyguardUnit: selectedDefenderCombined?.bodyguardUnit,
                    model: selectedDefenderModel,
                }}
            />
        </div>
    );
};

export default Octagon;
