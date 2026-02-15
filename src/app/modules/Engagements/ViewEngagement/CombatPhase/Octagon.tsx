import React, { useState, useEffect, useMemo, useCallback } from "react";

import type { EngagementForce, EngagementForceItemCombatState } from "#types/Engagements.tsx";
import type { GamePhase } from "#types/index";
import type { Model } from "#types/Models.tsx";

import { useCombatResolution } from "#game-engine";

import { buildUnitSelectItems, findUnitByItemId, getFirstWeaponForPhase, getFirstValidDefenderModel, hasPrecisionAttribute, countAliveModelsWithWeapon, canFireWeapon, getFirstValidWeaponForMovement, type UnitSelectItem, type SelectedWeapon } from "./utils/combatUtils";

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
    // Build unit select items for each force (units are already merged at engagement creation)
    const attackerUnitItems = useMemo(() => buildUnitSelectItems(attackingForce), [attackingForce]);
    const defenderUnitItems = useMemo(() => buildUnitSelectItems(defendingForce), [defendingForce]);

    // Attacker selections
    const [selectedAttackerItemId, setSelectedAttackerItemId] = useState<string | null>(null);
    const [selectedWeapon, setSelectedWeapon] = useState<SelectedWeapon | null>(null);

    // Defender selections
    const [selectedDefenderItemId, setSelectedDefenderItemId] = useState<string | null>(null);
    const [selectedDefenderModel, setSelectedDefenderModel] = useState<Model | null>(null);

    // Stratagems (placeholder for future implementation)
    const [activeAttackerStratagems, setActiveAttackerStratagems] = useState<string[]>([]);
    const [activeDefenderStratagems, setActiveDefenderStratagems] = useState<string[]>([]);

    // Derived: Get the selected unit items
    const selectedAttackerUnit = useMemo(() => findUnitByItemId(attackerUnitItems, selectedAttackerItemId ?? undefined), [attackerUnitItems, selectedAttackerItemId]);

    const selectedDefenderUnit = useMemo(() => findUnitByItemId(defenderUnitItems, selectedDefenderItemId ?? undefined), [defenderUnitItems, selectedDefenderItemId]);

    // Get model count: alive models that have the selected weapon in their loadout
    const attackerModelCount = useMemo(() => countAliveModelsWithWeapon(selectedAttackerUnit?.item, selectedWeapon), [selectedAttackerUnit, selectedWeapon]);

    // Combat resolution via game engine
    const combatResolution = useCombatResolution({
        phase: gamePhase,
        attackerUnit: selectedAttackerUnit?.item ?? null,
        attackerForce: attackingForce,
        weaponProfile: selectedWeapon?.profile ?? null,
        weaponCount: selectedWeapon?.weaponCount,
        modelCount: attackerModelCount,
        defenderUnit: selectedDefenderUnit?.item ?? null,
        defenderForce: defendingForce,
        targetModel: selectedDefenderModel,
    });

    // Handle attacker unit selection
    const handleAttackerUnitChange = useCallback(
        (unit: UnitSelectItem) => {
            setSelectedAttackerItemId(unit.item.listItemId);
            // Auto-select first weapon for the current phase
            const weapon = getFirstWeaponForPhase(unit.item.wargear || [], gamePhase === "shooting" || gamePhase === "fight" ? gamePhase : "shooting");
            setSelectedWeapon(weapon);
        },
        [gamePhase]
    );

    // Handle defender unit selection
    const handleDefenderUnitChange = useCallback(
        (unit: UnitSelectItem) => {
            setSelectedDefenderItemId(unit.item.listItemId);
            // Auto-select first valid model (respecting precision rules)
            const validModel = getFirstValidDefenderModel(unit.item, selectedWeapon);
            setSelectedDefenderModel(validModel);
        },
        [selectedWeapon]
    );

    // Handle weapon change - may need to update defender model selection
    const handleWeaponChange = useCallback(
        (weapon: SelectedWeapon | null) => {
            setSelectedWeapon(weapon);

            // Check if current defender model selection is still valid
            if (selectedDefenderUnit && selectedDefenderModel) {
                // For combined units, check if targeting a leader without precision
                const sourceUnits = selectedDefenderUnit.item.sourceUnits;
                if (sourceUnits && sourceUnits.length > 1) {
                    const leaderNames = new Set(sourceUnits.filter((s) => s.isLeader).map((s) => s.name));
                    const modelInstance = selectedDefenderUnit.item.modelInstances?.find((m) => selectedDefenderUnit.item.models?.[m.modelTypeLine]?.name === selectedDefenderModel.name);
                    const isLeaderModel = modelInstance?.sourceUnitName ? leaderNames.has(modelInstance.sourceUnitName) : false;

                    if (isLeaderModel && !hasPrecisionAttribute(weapon)) {
                        const validModel = getFirstValidDefenderModel(selectedDefenderUnit.item, weapon);
                        if (validModel && validModel.name !== selectedDefenderModel.name) {
                            setSelectedDefenderModel(validModel);
                        }
                    }
                }
            }
        },
        [selectedDefenderUnit, selectedDefenderModel]
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

    // Re-select weapon when game phase changes
    useEffect(() => {
        if (selectedAttackerUnit && (gamePhase === "shooting" || gamePhase === "fight")) {
            const currentWeaponType = selectedWeapon ? selectedAttackerUnit.item.wargear?.find((w) => w.id === selectedWeapon.wargearId)?.type : null;
            const expectedType = gamePhase === "shooting" ? "Ranged" : "Melee";

            // Only re-select if current weapon is wrong type or no weapon selected
            if (!selectedWeapon || currentWeaponType !== expectedType) {
                const newWeapon = getFirstWeaponForPhase(selectedAttackerUnit.item.wargear || [], gamePhase);
                setSelectedWeapon(newWeapon);

                // Also update defender model selection based on new weapon's precision status
                if (selectedDefenderUnit) {
                    const validModel = getFirstValidDefenderModel(selectedDefenderUnit.item, newWeapon);
                    setSelectedDefenderModel(validModel);
                }
            }
        }
    }, [gamePhase]);

    // Auto-deselect weapon when movement behaviour invalidates current selection (ASSAULT restriction)
    const movementBehaviour = selectedAttackerUnit?.item.combatState?.movementBehaviour;
    useEffect(() => {
        // Only applies during shooting phase
        if (gamePhase !== "shooting" || !selectedAttackerUnit || !selectedWeapon) return;

        const { canFire } = canFireWeapon(selectedWeapon.profile, movementBehaviour || "hold");

        if (!canFire) {
            // Find first valid ASSAULT weapon, or clear selection
            const validWeapon = getFirstValidWeaponForMovement(selectedAttackerUnit.item.wargear, "shooting", movementBehaviour || "hold");
            setSelectedWeapon(validWeapon);

            // Update defender model selection based on new weapon's precision status
            if (selectedDefenderUnit && validWeapon) {
                const validModel = getFirstValidDefenderModel(selectedDefenderUnit.item, validWeapon);
                setSelectedDefenderModel(validModel);
            }
        }
    }, [movementBehaviour, gamePhase]);

    return (
        <main className="w-full h-full grid grid-cols-[4fr_4fr_3fr] gap-2">
            <AttackerPanel
                gamePhase={gamePhase}
                force={attackingForce}
                unitItems={attackerUnitItems}
                selectedUnit={selectedAttackerUnit}
                onUnitChange={handleAttackerUnitChange}
                selectedWeapon={selectedWeapon}
                onWeaponChange={handleWeaponChange}
                onCombatStatusChange={handleAttackerCombatStatusChange}
            />
            <DefenderPanel
                gamePhase={gamePhase}
                force={defendingForce}
                unitItems={defenderUnitItems}
                selectedUnit={selectedDefenderUnit}
                onUnitChange={handleDefenderUnitChange}
                selectedModel={selectedDefenderModel}
                onModelChange={setSelectedDefenderModel}
                selectedWeapon={selectedWeapon}
                onCombatStatusChange={handleDefenderCombatStatusChange}
            />
            <AttackResolver resolution={combatResolution} modelCount={attackerModelCount} />
        </main>
    );
};

export default Octagon;
