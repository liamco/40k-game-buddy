import { Weapon } from "#types/Weapons.tsx";
import { findWeaponByName, ParsedOption } from "./wargearHelpers";

/**
 * Describes a constraint between wargear options/weapons
 */
export interface WargearConstraint {
    id: string; // For debugging/logging
    type: "mutuallyExclusive" | "packageDealExclusive" | "noDuplicates";

    // For mutuallyExclusive: these weapons cannot coexist
    weapons?: string[];

    // For packageDealExclusive: if this option line is selected, block these other lines
    triggerOptionLine?: number;
    blockedOptionLines?: number[];
}

/**
 * Result of evaluating constraints against current selections
 */
export interface ConstraintEvaluation {
    // Weapon IDs that are currently blocked from selection
    blockedWeaponIds: Set<string>;

    // Option line numbers that are currently blocked
    blockedOptionLines: Set<number>;

    // Explanations for why things are blocked (for tooltips)
    blockReasons: Map<string, string>; // weaponId or `option-${line}` -> reason
}

/**
 * Hardcoded constraints by datasheet ID.
 * Start with complex datasheets that don't fit the standard swap/add patterns.
 */
const DATASHEET_CONSTRAINTS: Record<string, WargearConstraint[]> = {
    // Hive Tyrant (Tyranids)
    // Cannot have both heavy venom cannon and stranglethorn cannon
    // Cannot have more than 1 of either cannon
    // CAN have 2x monstrous scything talons (EXTRA ATTACKS allows duplicate)
    "000000460": [
        {
            id: "venom-vs-stranglethorn",
            type: "mutuallyExclusive",
            weapons: ["heavy venom cannon", "stranglethorn cannon"],
        },
        {
            id: "no-duplicate-venom",
            type: "noDuplicates",
            weapons: ["heavy venom cannon"],
        },
        {
            id: "no-duplicate-stranglethorn",
            type: "noDuplicates",
            weapons: ["stranglethorn cannon"],
        },
    ],
    // Lieutenant (Space Marines)
    "000001346": [
        // Package deal (Option 2) is mutually exclusive with Options 1, 3, 4
        {
            id: "package-deal-exclusive",
            type: "packageDealExclusive",
            triggerOptionLine: 2,
            blockedOptionLines: [1, 3, 4],
        },
        // Master-crafted bolter cannot coexist with master-crafted power weapon
        {
            id: "bolter-vs-mcpw",
            type: "mutuallyExclusive",
            weapons: ["master-crafted bolter", "master-crafted power weapon"],
        },
        // Master-crafted bolter cannot coexist with power fist
        {
            id: "bolter-vs-powerfist",
            type: "mutuallyExclusive",
            weapons: ["master-crafted bolter", "power fist"],
        },
        // No duplicate master-crafted power weapons
        {
            id: "no-duplicate-mcpw",
            type: "noDuplicates",
            weapons: ["master-crafted power weapon"],
        },
        // No duplicate power fists
        {
            id: "no-duplicate-powerfist",
            type: "noDuplicates",
            weapons: ["power fist"],
        },
    ],
};

/**
 * Get constraints for a datasheet by ID
 */
export function getConstraintsForDatasheet(datasheetId: string): WargearConstraint[] {
    return DATASHEET_CONSTRAINTS[datasheetId] || [];
}

/**
 * Evaluate constraints against current model loadout
 */
export function evaluateConstraints(
    constraints: WargearConstraint[],
    currentLoadout: string[], // Weapon IDs currently equipped
    availableWargear: Weapon[],
    parsedOptions: ParsedOption[]
): ConstraintEvaluation {
    const blockedWeaponIds = new Set<string>();
    const blockedOptionLines = new Set<number>();
    const blockReasons = new Map<string, string>();

    // Helper to get weapon ID from name
    const getWeaponId = (name: string): string | undefined => {
        return findWeaponByName(availableWargear, name)?.id;
    };

    // Helper to check if loadout contains weapon by name
    const hasWeapon = (name: string): boolean => {
        const id = getWeaponId(name);
        return id ? currentLoadout.includes(id) : false;
    };

    // Helper to get weapon name from ID (for error messages)
    const getWeaponName = (id: string): string => {
        const weapon = availableWargear.find((w) => w.id === id);
        return weapon?.name || id;
    };

    for (const constraint of constraints) {
        switch (constraint.type) {
            case "packageDealExclusive": {
                if (!constraint.triggerOptionLine || !constraint.blockedOptionLines) continue;

                // Find the package deal option
                const triggerOption = parsedOptions.find((o) => o.line === constraint.triggerOptionLine);
                if (!triggerOption) continue;

                // Package deal is active if model has ALL the package weapons
                const packageWeapons = triggerOption.addsWeaponPackages?.[0] || [];
                const hasPackage = packageWeapons.length > 0 && packageWeapons.every((name) => hasWeapon(name));

                if (hasPackage) {
                    // Block other options entirely
                    constraint.blockedOptionLines.forEach((lineNum) => {
                        blockedOptionLines.add(lineNum);

                        // Block all weapons from blocked options
                        const blockedOption = parsedOptions.find((o) => o.line === lineNum);
                        if (blockedOption) {
                            blockedOption.addsWeaponNames.forEach((weaponName) => {
                                const id = getWeaponId(weaponName);
                                if (id) {
                                    blockedWeaponIds.add(id);
                                    blockReasons.set(id, "Blocked by package deal selection");
                                }
                            });
                        }
                    });
                } else {
                    // Check reverse: if any weapon from blocked options is selected,
                    // block the package deal option
                    let packageBlocked = false;
                    let blockingWeaponName = "";

                    for (const blockedLine of constraint.blockedOptionLines) {
                        const blockedOption = parsedOptions.find((o) => o.line === blockedLine);
                        if (!blockedOption) continue;

                        // Check if any non-default weapon from this option is equipped
                        for (const weaponName of blockedOption.addsWeaponNames) {
                            if (hasWeapon(weaponName)) {
                                packageBlocked = true;
                                blockingWeaponName = weaponName;
                                break;
                            }
                        }
                        if (packageBlocked) break;
                    }

                    if (packageBlocked) {
                        blockedOptionLines.add(constraint.triggerOptionLine);

                        // Block all weapons in the package deal
                        packageWeapons.forEach((weaponName) => {
                            const id = getWeaponId(weaponName);
                            if (id) {
                                blockedWeaponIds.add(id);
                                blockReasons.set(id, `Cannot use with ${blockingWeaponName}`);
                            }
                        });
                    }
                }
                break;
            }

            case "mutuallyExclusive": {
                const weaponNames = constraint.weapons || [];
                if (weaponNames.length < 2) continue;

                // Find which of these weapons are currently equipped
                const equippedNames = weaponNames.filter((name) => hasWeapon(name));

                if (equippedNames.length > 0) {
                    // Block the others
                    weaponNames.forEach((name) => {
                        if (!equippedNames.includes(name)) {
                            const id = getWeaponId(name);
                            if (id) {
                                blockedWeaponIds.add(id);
                                blockReasons.set(id, `Cannot equip with ${equippedNames[0]}`);
                            }
                        }
                    });
                }
                break;
            }

            case "noDuplicates": {
                const weaponNames = constraint.weapons || [];

                for (const name of weaponNames) {
                    const id = getWeaponId(name);
                    if (!id) continue;

                    // Count how many of this weapon are in loadout
                    const count = currentLoadout.filter((wid) => wid === id).length;

                    if (count >= 1) {
                        // Mark as blocked for additional selections
                        // We track this specially - it's "already equipped" not fully blocked
                        blockedWeaponIds.add(id);
                        blockReasons.set(id, "Already equipped");
                    }
                }
                break;
            }
        }
    }

    return { blockedWeaponIds, blockedOptionLines, blockReasons };
}

/**
 * Check if a specific weapon option should be blocked.
 * Handles the nuance of "already equipped" vs "mutually exclusive" blocking.
 *
 * @param weaponId - The weapon to check
 * @param isCurrentlySelected - Whether this weapon is already selected in this swap group
 * @param evaluation - The constraint evaluation result
 * @returns Object with isBlocked flag and optional reason
 */
export function isWeaponBlocked(weaponId: string, isCurrentlySelected: boolean, evaluation: ConstraintEvaluation | null): { isBlocked: boolean; reason?: string } {
    if (!evaluation) return { isBlocked: false };

    const isBlocked = evaluation.blockedWeaponIds.has(weaponId);
    const reason = evaluation.blockReasons.get(weaponId);

    // Special case: "Already equipped" should not block the currently selected instance
    if (isBlocked && reason === "Already equipped" && isCurrentlySelected) {
        return { isBlocked: false };
    }

    // For mutual exclusivity, don't block if this is the selected weapon
    if (isBlocked && isCurrentlySelected) {
        return { isBlocked: false };
    }

    return { isBlocked, reason };
}
