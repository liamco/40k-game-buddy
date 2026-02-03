import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

import type { Engagement, EngagementType, EngagementSize, EngagementPhase, EngagementForce, EngagementForceItem, EngagementForceItemCombatState, EngagementModelInstance, EngagementWargear, EngagementAbility, SourceUnit, ArmyList, ArmyListItem } from "../../types";
import { resolveUnitWargear } from "../Lists/ListManagerContext";

const STORAGE_KEY = "battle-cogitator-engagements";

// Calculate total models for a unit
function calculateTotalModels(item: ArmyListItem): number {
    // Use modelInstances if available
    if (item.modelInstances && item.modelInstances.length > 0) {
        return item.modelInstances.length;
    }
    // Fallback to unitComposition
    if (!item.unitComposition || item.unitComposition.length === 0) {
        return 1;
    }
    let total = 0;
    item.unitComposition.forEach((comp) => {
        if (comp.description === "OR") return;
        total += comp.min ?? 0;
    });
    return total;
}

// Get starting wounds for a unit (sum of all model wounds, or single model wounds)
function getStartingWounds(item: ArmyListItem): number {
    if (!item.models || item.models.length === 0) {
        return 1;
    }
    const modelCount = calculateTotalModels(item);
    // For single-model units or units where wounds matter per model
    const firstModel = item.models[0];
    return (firstModel.W || 1) * modelCount;
}

// Create default combat state for a unit
export function createDefaultCombatState(item: ArmyListItem): EngagementForceItemCombatState {
    return {
        isDamaged: false,
        modelCount: calculateTotalModels(item),
        unitStrength: "full",
        deadModelIds: [],
        currentWounds: getStartingWounds(item),
        isBattleShocked: false,
        isDestroyed: false,
        movementBehaviour: "hold",
        hasShot: false,
        hasCharged: false,
        hasFought: false,
        isInCover: false,
        isInEngagementRange: false,
        isInObjectiveRange: "none",
    };
}

// Calculate unit strength based on current vs starting model count
export function calculateUnitStrength(current: number, starting: number): EngagementForceItemCombatState["unitStrength"] {
    if (current === starting) return "full";
    if (current >= Math.ceil(starting / 2)) return "belowStarting";
    return "belowHalf";
}

// Get display label for unit strength
export function getUnitStrengthLabel(strength: EngagementForceItemCombatState["unitStrength"]): string {
    switch (strength) {
        case "full":
            return "At Full Strength";
        case "belowStarting":
            return "Below Starting Strength";
        case "belowHalf":
            return "Below Half Strength";
    }
}

// Create a single (non-combined) engagement item
function createSingleEngagementItem(item: ArmyListItem): EngagementForceItem {
    const { wargear: wargearData, modelInstances, ...rest } = item;

    // Tag model instances with source unit name (for consistency)
    const taggedInstances: EngagementModelInstance[] = (modelInstances || []).map((m) => ({
        ...m,
        sourceUnitName: item.name,
    }));

    // Tag wargear with source unit name
    const taggedWargear: EngagementWargear[] = resolveUnitWargear(item).map((w) => ({
        ...w,
        sourceUnitName: item.name,
    }));

    return {
        ...rest,
        modelInstances: taggedInstances,
        wargear: taggedWargear,
        combatState: createDefaultCombatState(item),
    };
}

// Merge leader(s) + bodyguard into a single engagement item
function mergeUnitsForEngagement(leaders: ArmyListItem[], bodyguard: ArmyListItem): EngagementForceItem {
    // Build sourceUnits array to track original units
    const sourceUnits: SourceUnit[] = [
        ...leaders.map((l) => ({
            listItemId: l.listItemId,
            datasheetId: l.id,
            name: l.name,
            isLeader: true,
        })),
        {
            listItemId: bodyguard.listItemId,
            datasheetId: bodyguard.id,
            name: bodyguard.name,
            isLeader: false,
        },
    ];

    // Merge model instances with source tagging
    const modelInstances: EngagementModelInstance[] = [
        ...leaders.flatMap((l) =>
            (l.modelInstances || []).map((m) => ({
                ...m,
                sourceUnitName: l.name,
            }))
        ),
        ...(bodyguard.modelInstances || []).map((m) => ({
            ...m,
            sourceUnitName: bodyguard.name,
        })),
    ];

    // Merge wargear with source tagging
    const wargear: EngagementWargear[] = [
        ...leaders.flatMap((l) =>
            resolveUnitWargear(l).map((w) => ({
                ...w,
                sourceUnitName: l.name,
            }))
        ),
        ...resolveUnitWargear(bodyguard).map((w) => ({
            ...w,
            sourceUnitName: bodyguard.name,
        })),
    ];

    // Merge abilities with source tagging
    const abilities: EngagementAbility[] = [
        ...leaders.flatMap((l) =>
            (l.abilities || []).map((a) => ({
                ...a,
                sourceUnitName: l.name,
                isFromLeader: true,
            }))
        ),
        ...(bodyguard.abilities || []).map((a) => ({
            ...a,
            sourceUnitName: bodyguard.name,
            isFromLeader: false,
        })),
    ];

    // Merge model profiles
    const models = [...leaders.flatMap((l) => l.models || []), ...(bodyguard.models || [])];

    // Build display name
    const leaderNames = leaders.map((l) => l.name).join(" + ");
    const displayName = `${leaderNames} + ${bodyguard.name}`;

    // Use first leader as base, but override with merged data
    const { wargear: _wargearData, modelInstances: _, abilities: __, ...baseItem } = leaders[0];

    // Create a temporary item for combat state calculation
    const tempItem = { ...baseItem, modelInstances } as ArmyListItem;

    return {
        ...baseItem,
        name: displayName,
        modelInstances,
        models,
        wargear,
        abilities,
        sourceUnits,
        combatState: createDefaultCombatState(tempItem),
    };
}

// Convert an ArmyList to an EngagementForce (snapshot with combat state)
function createEngagementForce(list: ArmyList): EngagementForce {
    const items: EngagementForceItem[] = [];
    const processedIds = new Set<string>();

    // First pass: Find bodyguard units with leaders and merge them
    list.items.forEach((item) => {
        if (processedIds.has(item.listItemId)) return;

        // Check if this is a bodyguard unit with leaders attached
        if (item.leadBy && item.leadBy.length > 0) {
            // Find all leaders for this unit
            const leaders = item.leadBy.map((ref) => list.items.find((l) => l.id === ref.id && l.name === ref.name)).filter((l): l is ArmyListItem => l !== undefined && !processedIds.has(l.listItemId));

            if (leaders.length > 0) {
                // Sort leaders alphabetically for consistent display
                leaders.sort((a, b) => a.name.localeCompare(b.name));

                // Merge into single item
                items.push(mergeUnitsForEngagement(leaders, item));

                // Mark all as processed
                processedIds.add(item.listItemId);
                leaders.forEach((l) => processedIds.add(l.listItemId));
            }
        }
    });

    // Second pass: Add unattached leaders
    list.items.forEach((item) => {
        if (processedIds.has(item.listItemId)) return;

        if (item.leading) {
            // Leader without bodyguard found in first pass
            items.push(createSingleEngagementItem(item));
            processedIds.add(item.listItemId);
        }
    });

    // Third pass: Add remaining regular units
    list.items.forEach((item) => {
        if (processedIds.has(item.listItemId)) return;

        items.push(createSingleEngagementItem(item));
        processedIds.add(item.listItemId);
    });

    return {
        sourceListId: list.id,
        name: list.name,
        factionId: list.factionId,
        factionName: list.factionName,
        factionSlug: list.factionSlug,
        factionIcon: list.factionIcon,
        detachmentSlug: list.detachmentSlug,
        detachmentName: list.detachmentName,
        totalPointsCost: list.totalPointsCost,
        items,
    };
}

interface EngagementManagerContextType {
    // Engagements state
    engagements: Engagement[];
    engagementsLoaded: boolean;

    // Engagement operations
    createEngagement: (attackerList: ArmyList, defenderList: ArmyList, type: EngagementType, size: EngagementSize, name?: string) => Engagement;
    deleteEngagement: (engagementId: string) => void;
    getEngagementById: (engagementId: string) => Engagement | undefined;

    // Combat state operations
    updateUnitCombatState: (engagementId: string, forceType: "attacking" | "defending", unitId: string, updates: Partial<EngagementForceItemCombatState>) => void;
    resetUnitCombatState: (engagementId: string, forceType: "attacking" | "defending", unitId: string) => void;
    resetAllCombatStates: (engagementId: string) => void;

    // Phase/turn operations
    updateEngagementPhase: (engagementId: string, phase: EngagementPhase) => void;
    advanceTurn: (engagementId: string) => void;
    resetTurnFlags: (engagementId: string) => void;
    setActiveForce: (engagementId: string, forceId: string) => void;
}

const EngagementManagerContext = createContext<EngagementManagerContextType | null>(null);

export function useEngagementManager() {
    const context = useContext(EngagementManagerContext);
    if (!context) {
        throw new Error("useEngagementManager must be used within an EngagementManagerProvider");
    }
    return context;
}

interface EngagementManagerProviderProps {
    children: ReactNode;
}

export function EngagementManagerProvider({ children }: EngagementManagerProviderProps) {
    const [engagements, setEngagements] = useState<Engagement[]>([]);
    const [engagementsLoaded, setEngagementsLoaded] = useState(false);

    // Load engagements from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                setEngagements(parsed);
            } catch (error) {
                console.error("Error loading engagements:", error);
            }
        }
        setEngagementsLoaded(true);
    }, []);

    // Save engagements to localStorage whenever they change
    useEffect(() => {
        if (!engagementsLoaded) return;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(engagements));
    }, [engagements, engagementsLoaded]);

    const getEngagementById = useCallback(
        (engagementId: string) => {
            return engagements.find((e) => e.id === engagementId);
        },
        [engagements]
    );

    const createEngagement = useCallback((forceAList: ArmyList, forceBList: ArmyList, type: EngagementType, size: EngagementSize, name?: string): Engagement => {
        const forceA = createEngagementForce(forceAList);
        const newEngagement: Engagement = {
            id: Date.now().toString(),
            name,
            type,
            size,
            engagementForceA: forceA,
            engagementForceB: createEngagementForce(forceBList),
            activeForceId: forceA.sourceListId,
            currentPhase: "command",
            currentTurn: 1,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };
        setEngagements((prev) => [...prev, newEngagement]);
        return newEngagement;
    }, []);

    const deleteEngagement = useCallback((engagementId: string) => {
        setEngagements((prev) => prev.filter((e) => e.id !== engagementId));
    }, []);

    const updateUnitCombatState = useCallback((engagementId: string, forceType: "attacking" | "defending", unitId: string, updates: Partial<EngagementForceItemCombatState>) => {
        setEngagements((prev) =>
            prev.map((engagement) => {
                if (engagement.id !== engagementId) return engagement;

                // Determine which force contains the unit by checking both forces
                // This handles the case where activeForce swaps between ForceA and ForceB
                const unitInForceA = engagement.engagementForceA.items.some((item) => item.listItemId === unitId);
                const forceKey = unitInForceA ? "engagementForceA" : "engagementForceB";
                const force = engagement[forceKey];

                const updatedItems = force.items.map((item) => {
                    if (item.listItemId !== unitId) return item;
                    return {
                        ...item,
                        combatState: { ...item.combatState, ...updates },
                    };
                });

                return {
                    ...engagement,
                    [forceKey]: { ...force, items: updatedItems },
                    updatedAt: Date.now(),
                };
            })
        );
    }, []);

    const resetUnitCombatState = useCallback((engagementId: string, forceType: "attacking" | "defending", unitId: string) => {
        setEngagements((prev) =>
            prev.map((engagement) => {
                if (engagement.id !== engagementId) return engagement;

                // Determine which force contains the unit by checking both forces
                const unitInForceA = engagement.engagementForceA.items.some((item) => item.listItemId === unitId);
                const forceKey = unitInForceA ? "engagementForceA" : "engagementForceB";
                const force = engagement[forceKey];

                const updatedItems = force.items.map((item) => {
                    if (item.listItemId !== unitId) return item;
                    return {
                        ...item,
                        combatState: createDefaultCombatState(item),
                    };
                });

                return {
                    ...engagement,
                    [forceKey]: { ...force, items: updatedItems },
                    updatedAt: Date.now(),
                };
            })
        );
    }, []);

    const resetAllCombatStates = useCallback((engagementId: string) => {
        setEngagements((prev) =>
            prev.map((engagement) => {
                if (engagement.id !== engagementId) return engagement;

                const resetForce = (force: EngagementForce): EngagementForce => ({
                    ...force,
                    items: force.items.map((item) => ({
                        ...item,
                        combatState: createDefaultCombatState(item),
                    })),
                });

                return {
                    ...engagement,
                    engagementForceA: resetForce(engagement.engagementForceA),
                    engagementForceB: resetForce(engagement.engagementForceB),
                    activeForceId: engagement.engagementForceA.sourceListId,
                    currentTurn: 1,
                    currentPhase: "command",
                    updatedAt: Date.now(),
                };
            })
        );
    }, []);

    const updateEngagementPhase = useCallback((engagementId: string, phase: EngagementPhase) => {
        setEngagements((prev) =>
            prev.map((engagement) => {
                if (engagement.id !== engagementId) return engagement;
                return {
                    ...engagement,
                    currentPhase: phase,
                    updatedAt: Date.now(),
                };
            })
        );
    }, []);

    const advanceTurn = useCallback((engagementId: string) => {
        setEngagements((prev) =>
            prev.map((engagement) => {
                if (engagement.id !== engagementId) return engagement;

                // Reset turn-specific flags for all units
                const resetTurnFlags = (force: EngagementForce): EngagementForce => ({
                    ...force,
                    items: force.items.map((item) => ({
                        ...item,
                        combatState: {
                            ...item.combatState,
                            movementBehaviour: "hold",
                            hasShot: false,
                            hasCharged: false,
                            hasFought: false,
                        },
                    })),
                });

                return {
                    ...engagement,
                    currentTurn: engagement.currentTurn + 1,
                    currentPhase: "command",
                    engagementForceA: resetTurnFlags(engagement.engagementForceA),
                    engagementForceB: resetTurnFlags(engagement.engagementForceB),
                    updatedAt: Date.now(),
                };
            })
        );
    }, []);

    const resetTurnFlags = useCallback((engagementId: string) => {
        setEngagements((prev) =>
            prev.map((engagement) => {
                if (engagement.id !== engagementId) return engagement;

                const resetFlags = (force: EngagementForce): EngagementForce => ({
                    ...force,
                    items: force.items.map((item) => ({
                        ...item,
                        combatState: {
                            ...item.combatState,
                            movementBehaviour: "hold",
                            hasShot: false,
                            hasCharged: false,
                            hasFought: false,
                        },
                    })),
                });

                return {
                    ...engagement,
                    engagementForceA: resetFlags(engagement.engagementForceA),
                    engagementForceB: resetFlags(engagement.engagementForceB),
                    updatedAt: Date.now(),
                };
            })
        );
    }, []);

    const setActiveForce = useCallback((engagementId: string, forceId: string) => {
        setEngagements((prev) =>
            prev.map((engagement) => {
                if (engagement.id !== engagementId) return engagement;
                return {
                    ...engagement,
                    activeForceId: forceId,
                    updatedAt: Date.now(),
                };
            })
        );
    }, []);

    const value: EngagementManagerContextType = {
        engagements,
        engagementsLoaded,
        createEngagement,
        deleteEngagement,
        getEngagementById,
        updateUnitCombatState,
        resetUnitCombatState,
        resetAllCombatStates,
        updateEngagementPhase,
        advanceTurn,
        resetTurnFlags,
        setActiveForce,
    };

    return <EngagementManagerContext.Provider value={value}>{children}</EngagementManagerContext.Provider>;
}
