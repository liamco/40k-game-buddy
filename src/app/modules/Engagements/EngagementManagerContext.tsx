import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

import type { Engagement, EngagementType, EngagementSize, EngagementPhase, EngagementForce, EngagementForceItem, EngagementForceItemCombatState, ArmyList, ArmyListItem } from "../../types";
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

// Convert an ArmyList to an EngagementForce (snapshot with combat state)
function createEngagementForce(list: ArmyList): EngagementForce {
    const items: EngagementForceItem[] = list.items.map((item) => {
        // Destructure to remove availableWargear, keep everything else
        const { availableWargear, ...rest } = item;

        return {
            ...rest,
            wargear: resolveUnitWargear(item),
            combatState: createDefaultCombatState(item),
        };
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

                const forceKey = forceType === "attacking" ? "engagementForceA" : "engagementForceB";
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

                const forceKey = forceType === "attacking" ? "engagementForceA" : "engagementForceB";
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
