import React, { useState, useEffect, useMemo, Fragment } from "react";
import { Info, Sparkles } from "lucide-react";
import SearchableDropdown, { type SearchableDropdownOption } from "./SearchableDropdown/SearchableDropdown";
import Dropdown, { type DropdownOption } from "./Dropdown/Dropdown";
import { Badge } from "./_ui/badge";
import type { Weapon, ArmyList, Datasheet, Faction, WeaponProfile, GamePhase, ArmyListItem, Detachment, Enhancement, DamagedMechanic } from "../types";
import { loadFactionData } from "../utils/depotDataLoader";
import WeaponProfileCard, { type BonusAttribute, type StatBonus } from "./WeaponProfileCard/WeaponProfileCard";
import { collectUnitAbilities, createDefaultCombatStatus, type Mechanic, type UnitContext, type CombatStatus, type CombatStatusFlag } from "../game-engine";
import CombatStatusComponent from "./CombatStatus/CombatStatus";
import SplitHeading from "./SplitHeading/SplitHeading";
import CombatantPanelEmpty from "./CombatantPanelEmpty/CombatantPanelEmpty";
import EnhancementCard from "./EnhancementCard/EnhancementCard";

// Weapon attributes that can be added by enhancements/abilities
const WEAPON_ABILITY_KEYWORDS = ["SUSTAINED HITS", "LETHAL HITS", "DEVASTATING WOUNDS", "ANTI-", "TORRENT", "BLAST", "HEAVY", "ASSAULT", "RAPID FIRE", "PISTOL", "MELTA", "LANCE", "TWIN-LINKED", "HAZARDOUS", "PRECISION", "IGNORES COVER"];

// Parse loadout HTML to extract weapon names
function parseLoadoutWeapons(loadout: string): string[] {
    if (!loadout) return [];
    const text = loadout.replace(/<[^>]*>/g, " ").trim();
    const match = text.match(/equipped with:\s*(.+?)\.?$/i);
    if (!match) return [];
    return match[1]
        .split(";")
        .map((w) => w.trim().toLowerCase())
        .filter((w) => w.length > 0);
}

// Check if a weapon is in the loadout
function isWeaponInLoadout(weaponName: string, loadoutWeapons: string[]): boolean {
    const normalizedName = weaponName.toLowerCase();
    return loadoutWeapons.some((loadoutWeapon) => loadoutWeapon.includes(normalizedName) || normalizedName.includes(loadoutWeapon));
}

// Check if a weapon is selected in loadoutSelections
function isWeaponSelected(weaponId: string, loadoutSelections?: { [key: string]: number }): boolean {
    if (!loadoutSelections) return false;
    return (loadoutSelections[weaponId] ?? 0) > 0;
}

interface AttackerPanelProps {
    gamePhase: GamePhase;
    unit: Datasheet | null;
    attachedUnit: Datasheet | null;
    onUnitChange: (unit: Datasheet) => void;
    selectedWeaponProfile: WeaponProfile | null;
    onWeaponProfileChange: (weapon: WeaponProfile | null) => void;
    combatStatus: CombatStatus;
    onCombatStatusChange: (name: CombatStatusFlag, value: boolean) => void;
    selectedList: ArmyList | null;
    modelCount: number;
    startingStrength: number;
    onModelCountChange: (count: number) => void;
    // List selection props
    availableLists: ArmyList[];
    onListChange: (listId: string) => void;
}

/**
 * Extracts combat-relevant bonuses from mechanics for display.
 */
function extractCombatBonuses(mechanics: Mechanic[]): {
    hitBonuses: { source: string; value: number }[];
    woundBonuses: { source: string; value: number }[];
    otherBonuses: { source: string; description: string }[];
} {
    const hitBonuses: { source: string; value: number }[] = [];
    const woundBonuses: { source: string; value: number }[] = [];
    const otherBonuses: { source: string; description: string }[] = [];

    for (const mechanic of mechanics) {
        const sourceName = mechanic.source?.name || "Unknown";

        if (mechanic.effect === "rollBonus" && typeof mechanic.value === "number") {
            if (mechanic.attribute === "h") {
                hitBonuses.push({ source: sourceName, value: mechanic.value });
            } else if (mechanic.attribute === "w") {
                woundBonuses.push({ source: sourceName, value: mechanic.value });
            }
        } else if (mechanic.effect === "addsAbility" && mechanic.abilities) {
            for (const ability of mechanic.abilities) {
                if (ability.toUpperCase().includes("FEEL NO PAIN")) {
                    otherBonuses.push({
                        source: sourceName,
                        description: `FNP ${mechanic.value}+`,
                    });
                }
            }
        }
    }

    return { hitBonuses, woundBonuses, otherBonuses };
}

export function AttackerPanel({ gamePhase, unit, attachedUnit, onUnitChange, selectedWeaponProfile, onWeaponProfileChange, combatStatus, onCombatStatusChange, selectedList, modelCount, startingStrength, onModelCountChange, availableLists, onListChange }: AttackerPanelProps) {
    const [factionData, setFactionData] = useState<Faction | null>(null);

    // Convert available lists to Dropdown options
    const listOptions = useMemo((): DropdownOption<ArmyList>[] => {
        return availableLists.map((list) => ({
            id: list.id,
            label: list.name,
            data: list,
        }));
    }, [availableLists]);

    // Load faction data when list changes
    useEffect(() => {
        if (selectedList) {
            loadFactionData(selectedList.factionSlug).then((data) => {
                if (data) {
                    setFactionData(data);
                }
            });
        } else {
            setFactionData(null);
        }
    }, [selectedList]);

    // Combine leaders with their attached units into single items
    // Supports multiple leaders attached to a single bodyguard unit
    // Sorted alphabetically by display name (combined units use their full combined name)
    const combinedListItems = useMemo(() => {
        if (!selectedList) return [];

        const items = selectedList.items;
        const processed = new Set<string>();
        const combined: Array<{ item: ArmyListItem; displayName: string; isCombined: boolean; allLeaders: ArmyListItem[]; bodyguardUnit?: ArmyListItem }> = [];

        // First pass: Find bodyguard units with leaders attached
        items.forEach((item) => {
            if (processed.has(item.listItemId)) return;

            // Check if this unit has leaders attached (leadBy array)
            if (item.leadBy && item.leadBy.length > 0) {
                // Find all leaders for this unit
                const leaders = item.leadBy.map((ref) => items.find((l) => l.id === ref.id && l.name === ref.name)).filter((l): l is ArmyListItem => l !== undefined && !processed.has(l.listItemId));

                if (leaders.length > 0) {
                    // Sort leaders alphabetically for consistent display
                    leaders.sort((a, b) => a.name.localeCompare(b.name));

                    // Build display name with all leaders + bodyguard
                    const leaderNames = leaders.map((l) => l.name).join(" + ");
                    combined.push({
                        item: leaders[0], // Use first leader as the main item for selection
                        displayName: `${leaderNames} + ${item.name}`,
                        isCombined: true,
                        allLeaders: leaders,
                        bodyguardUnit: item,
                    });
                    leaders.forEach((l) => processed.add(l.listItemId));
                    processed.add(item.listItemId);
                }
            }
        });

        // Second pass: Add leaders without matching bodyguard units
        items.forEach((item) => {
            if (processed.has(item.listItemId)) return;

            if (item.leading) {
                // Leader is attached but bodyguard wasn't found in first pass
                combined.push({
                    item: item,
                    displayName: item.name,
                    isCombined: false,
                    allLeaders: [],
                });
                processed.add(item.listItemId);
            }
        });

        // Third pass: Add remaining unprocessed items (regular units)
        items.forEach((item) => {
            if (!processed.has(item.listItemId)) {
                combined.push({
                    item: item,
                    displayName: item.name,
                    isCombined: false,
                    allLeaders: [],
                });
                processed.add(item.listItemId);
            }
        });

        // Sort all items alphabetically by display name
        combined.sort((a, b) => a.displayName.localeCompare(b.displayName));

        return combined;
    }, [selectedList]);

    // Convert combined items to dropdown options
    const unitOptions = useMemo((): SearchableDropdownOption<{ item: ArmyListItem; displayName: string; isCombined: boolean; allLeaders: ArmyListItem[]; bodyguardUnit?: ArmyListItem }>[] => {
        return combinedListItems.map((combined) => ({
            id: combined.item.listItemId,
            searchValue: `${combined.displayName} ${combined.item.roleLabel}`,
            data: combined,
        }));
    }, [combinedListItems]);

    // Get display name for selected unit
    const selectedUnitDisplayName = useMemo(() => {
        if (!unit) return null;

        // Try to find by listItemId first (if unit is an ArmyListItem)
        const listItemId = (unit as any).listItemId;
        if (listItemId) {
            const combinedItem = combinedListItems.find((c) => c.item.listItemId === listItemId);
            if (combinedItem) return combinedItem.displayName;
        }

        // Fallback: try to find by id and name (for backwards compatibility)
        const combinedItem = combinedListItems.find((c) => c.item.id === unit.id && c.item.name === unit.name);

        return combinedItem ? combinedItem.displayName : unit.name;
    }, [unit, combinedListItems]);

    // Filter wargear for a single unit based on loadout, selections, and removed weapons
    const filterUnitWargear = (unitItem: ArmyListItem, wargear: Weapon[]): Weapon[] => {
        const loadoutWeapons = parseLoadoutWeapons(unitItem.loadout || "");

        // If no loadout info at all, show all weapons (fallback for units without loadout data)
        // Still filter out explicitly removed weapons
        if (loadoutWeapons.length === 0) {
            return wargear.filter((weapon) => {
                const isRemoved = unitItem.removedWeapons?.[weapon.id] === true;
                return !isRemoved;
            });
        }

        // Filter to only show weapons in default loadout OR explicitly selected
        // Exclude weapons that have been explicitly removed
        return wargear.filter((weapon) => {
            const isRemoved = unitItem.removedWeapons?.[weapon.id] === true;
            if (isRemoved) return false;

            const inLoadout = isWeaponInLoadout(weapon.name, loadoutWeapons);
            const isSelected = isWeaponSelected(weapon.id, unitItem.loadoutSelections);
            return inLoadout || isSelected;
        });
    };

    // Get combined wargear from all leaders and attached unit if combined unit is selected
    const availableWargear = useMemo(() => {
        if (!unit || !selectedList) return unit?.wargear || [];

        // Get the listItemId from the selected unit
        const listItemId = (unit as ArmyListItem).listItemId;

        // Always get the fresh item from selectedList to ensure we have latest loadoutSelections
        const freshUnit = listItemId ? selectedList.items.find((item) => item.listItemId === listItemId) : null;

        // Use fresh unit if found, otherwise fall back to unit prop
        const currentUnit = freshUnit || unit;

        // Check if this is a combined unit (leaders with attached bodyguard)
        const combinedItem = listItemId ? combinedListItems.find((c) => c.item.listItemId === listItemId) : combinedListItems.find((c) => c.item.id === unit.id && c.item.name === unit.name);

        if (combinedItem?.isCombined && combinedItem.allLeaders.length > 0 && combinedItem.bodyguardUnit) {
            const allWargear: Array<Weapon & { sourceUnit?: string }> = [];

            // Add wargear from all leaders
            for (const leader of combinedItem.allLeaders) {
                const freshLeader = selectedList.items.find((item) => item.listItemId === leader.listItemId) || leader;
                const leaderFiltered = filterUnitWargear(freshLeader, freshLeader.wargear || []);
                allWargear.push(...leaderFiltered.map((weapon) => ({ ...weapon, sourceUnit: freshLeader.name })));
            }

            // Add wargear from bodyguard unit
            const freshBodyguard = selectedList.items.find((item) => item.listItemId === combinedItem.bodyguardUnit!.listItemId) || combinedItem.bodyguardUnit;
            const bodyguardFiltered = filterUnitWargear(freshBodyguard, freshBodyguard.wargear || []);
            allWargear.push(...bodyguardFiltered.map((weapon) => ({ ...weapon, sourceUnit: freshBodyguard.name })));

            return allWargear;
        }

        // Single unit: filter based on loadout and selections
        return filterUnitWargear(currentUnit as ArmyListItem, currentUnit.wargear || []);
    }, [unit, selectedList, combinedListItems]);

    // Get all attached leaders as an array for the current combined unit
    const attachedLeaders = useMemo((): Datasheet[] => {
        if (!unit || !selectedList) return attachedUnit ? [attachedUnit] : [];

        const listItemId = (unit as ArmyListItem).listItemId;
        const combinedItem = listItemId ? combinedListItems.find((c) => c.item.listItemId === listItemId) : combinedListItems.find((c) => c.item.id === unit.id && c.item.name === unit.name);

        if (combinedItem?.isCombined && combinedItem.allLeaders.length > 0) {
            // Return all leader datasheets
            return combinedItem.allLeaders.map((leader) => selectedList.items.find((item) => item.listItemId === leader.listItemId) || leader);
        }

        // Fallback to single attachedUnit for backwards compatibility
        return attachedUnit ? [attachedUnit] : [];
    }, [unit, attachedUnit, selectedList, combinedListItems]);

    // Collect combat bonuses from leader abilities when a combined unit is selected
    const leaderCombatBonuses = useMemo(() => {
        if (!unit || attachedLeaders.length === 0) {
            return { hitBonuses: [], woundBonuses: [], otherBonuses: [] };
        }

        // For combined units, find the bodyguard unit to use as the datasheet
        // This prevents leader abilities from being collected twice (once from datasheet, once from attachedLeaders)
        const listItemId = (unit as ArmyListItem).listItemId;
        const combinedItem = listItemId ? combinedListItems.find((c) => c.item.listItemId === listItemId) : combinedListItems.find((c) => c.item.id === unit.id && c.item.name === unit.name);

        // Use bodyguard as the main datasheet if this is a combined unit, otherwise use the unit itself
        const mainDatasheet = combinedItem?.isCombined && combinedItem.bodyguardUnit ? combinedItem.bodyguardUnit : unit;

        // Create a unit context to collect abilities from all leaders
        const unitContext: UnitContext = {
            datasheet: mainDatasheet,
            selectedModel: mainDatasheet.models?.[0],
            state: createDefaultCombatStatus(),
            attachedLeaders: attachedLeaders,
        };

        // Collect all mechanics from the unit and all attached leaders
        const mechanics = collectUnitAbilities(unitContext, "attacker");

        // Filter to only combat-relevant roll bonuses that apply when leading
        // (mechanics with conditions about leading state)
        const leaderMechanics = mechanics.filter((m) => {
            // Check if this mechanic has a "leading" type condition
            const hasLeadingCondition = m.conditions?.some((c) => c.state === "isLeadingUnit" || c.state === "leading" || (Array.isArray(c.state) && (c.state.includes("isLeadingUnit") || c.state.includes("leading"))));
            return hasLeadingCondition;
        });

        return extractCombatBonuses(leaderMechanics);
    }, [unit, attachedLeaders, combinedListItems]);

    // Get damaged profile penalties when isDamaged is checked
    const damagedPenalties = useMemo(() => {
        if (!unit || !combatStatus.isDamaged) {
            return { hitPenalty: 0, otherPenalties: [] as { attribute: string; value: number }[] };
        }

        const damagedMechanics = (unit as Datasheet).damagedMechanics;
        if (!damagedMechanics || damagedMechanics.length === 0) {
            return { hitPenalty: 0, otherPenalties: [] };
        }

        let hitPenalty = 0;
        const otherPenalties: { attribute: string; value: number }[] = [];

        for (const mechanic of damagedMechanics) {
            if (mechanic.effect === "rollPenalty" && mechanic.attribute === "h") {
                hitPenalty += mechanic.value;
            } else if (mechanic.effect === "statPenalty" || mechanic.effect === "statBonus") {
                otherPenalties.push({ attribute: mechanic.attribute, value: mechanic.effect === "statPenalty" ? -mechanic.value : mechanic.value });
            }
        }

        return { hitPenalty, otherPenalties };
    }, [unit, combatStatus.isDamaged]);

    // Get enhancement details from all attached leaders
    const leaderEnhancements = useMemo((): Enhancement[] => {
        if (!selectedList || !factionData || !unit) return [];

        const listItemId = (unit as ArmyListItem)?.listItemId;
        const combinedItem = listItemId ? combinedListItems.find((c) => c.item.listItemId === listItemId) : combinedListItems.find((c) => c.item.id === unit.id && c.item.name === unit.name);

        // Get all leaders to check for enhancements
        const leadersToCheck: ArmyListItem[] = [];

        if (combinedItem?.isCombined && combinedItem.allLeaders.length > 0) {
            // Multi-leader case: check all leaders
            for (const leader of combinedItem.allLeaders) {
                const freshLeader = selectedList.items.find((item) => item.listItemId === leader.listItemId);
                if (freshLeader) {
                    leadersToCheck.push(freshLeader);
                }
            }
        } else {
            // Single leader case: check the main item
            const leaderItem = listItemId ? selectedList.items.find((item) => item.listItemId === listItemId) : selectedList.items.find((item) => item.id === unit.id && item.enhancement);
            if (leaderItem) {
                leadersToCheck.push(leaderItem);
            }
        }

        // Find the detachment in faction data
        const detachment = factionData.detachments?.find((d: Detachment) => d.slug === selectedList.detachmentSlug);

        // Collect enhancements from all leaders
        const enhancements: Enhancement[] = [];
        for (const leaderItem of leadersToCheck) {
            if (!leaderItem.enhancement) continue;

            // Find the full enhancement details
            const fullEnhancement = detachment?.enhancements?.find((e: Enhancement) => e.id === leaderItem.enhancement?.id);
            if (fullEnhancement) {
                enhancements.push(fullEnhancement);
            } else {
                // Return basic info if we can't find full details
                enhancements.push({
                    id: leaderItem.enhancement.id,
                    name: leaderItem.enhancement.name,
                    cost: leaderItem.enhancement.cost,
                });
            }
        }

        return enhancements;
    }, [unit, selectedList, factionData, combinedListItems]);

    // Extract weapon bonus attributes from enhancement mechanics AND leader abilities
    const weaponBonusAttributes = useMemo((): BonusAttribute[] => {
        const bonuses: BonusAttribute[] = [];

        // Extract from all leader enhancement mechanics
        for (const enhancement of leaderEnhancements) {
            if (!enhancement.mechanics) continue;

            for (const mechanic of enhancement.mechanics) {
                // Only look at addsAbility effects that target thisUnit or thisModel
                if (mechanic.effect !== "addsAbility" || !mechanic.abilities) continue;
                if (mechanic.entity !== "thisUnit" && mechanic.entity !== "thisModel") continue;

                // Check each ability to see if it's a weapon attribute
                for (const ability of mechanic.abilities) {
                    const upperAbility = ability.toUpperCase();
                    const isWeaponAttribute = WEAPON_ABILITY_KEYWORDS.some((keyword) => upperAbility.startsWith(keyword) || upperAbility.includes(keyword));

                    if (isWeaponAttribute) {
                        // Avoid duplicates
                        const alreadyExists = bonuses.some((b) => b.name.toUpperCase() === upperAbility);
                        if (!alreadyExists) {
                            bonuses.push({
                                name: ability,
                                value: mechanic.value,
                                sourceName: enhancement.name,
                                sourceType: "enhancement",
                            });
                        }
                    }
                }
            }
        }

        // Extract from leader abilities when a combined unit is selected
        if (unit && attachedLeaders.length > 0) {
            // Create a unit context to collect abilities from all leaders
            const unitContext: UnitContext = {
                datasheet: unit,
                selectedModel: unit.models?.[0],
                state: createDefaultCombatStatus(),
                attachedLeaders: attachedLeaders,
            };

            // Collect all mechanics from the unit and all attached leaders
            const mechanics = collectUnitAbilities(unitContext, "attacker");

            // Filter to only combat-relevant weapon attribute abilities that apply when leading
            for (const mechanic of mechanics) {
                if (mechanic.effect !== "addsAbility" || !mechanic.abilities) continue;
                if (mechanic.entity !== "thisUnit" && mechanic.entity !== "thisModel") continue;

                // Check if this mechanic has a "leading" type condition (applies when leading)
                const hasLeadingCondition = mechanic.conditions?.some((c) => c.state === "isLeadingUnit" || c.state === "leading" || (Array.isArray(c.state) && (c.state.includes("isLeadingUnit") || c.state.includes("leading"))));

                if (hasLeadingCondition) {
                    for (const ability of mechanic.abilities) {
                        const upperAbility = ability.toUpperCase();
                        const isWeaponAttribute = WEAPON_ABILITY_KEYWORDS.some((keyword) => upperAbility.startsWith(keyword) || upperAbility.includes(keyword));

                        if (isWeaponAttribute) {
                            // Avoid duplicates
                            const alreadyExists = bonuses.some((b) => b.name.toUpperCase() === upperAbility);
                            if (!alreadyExists) {
                                bonuses.push({
                                    name: ability,
                                    value: mechanic.value,
                                    sourceName: mechanic.source?.name || "Leader Ability",
                                    sourceType: "leader",
                                });
                            }
                        }
                    }
                }
            }
        }

        return bonuses;
    }, [leaderEnhancements, unit, attachedLeaders]);

    // Extract weapon stat bonuses from all leader enhancement mechanics (e.g., +1 Strength)
    const weaponStatBonuses = useMemo((): StatBonus[] => {
        const bonuses: StatBonus[] = [];

        // Map mechanic attributes to weapon stat attributes
        const weaponStatMap: Record<string, StatBonus["attribute"]> = {
            s: "s",
            a: "a",
            ap: "ap",
            d: "d",
            range: "range",
            bsWs: "bsWs",
        };

        for (const enhancement of leaderEnhancements) {
            if (!enhancement.mechanics) continue;

            for (const mechanic of enhancement.mechanics) {
                // Look for rollBonus or staticNumber effects on weapon attributes
                if (mechanic.effect !== "rollBonus" && mechanic.effect !== "staticNumber") continue;
                if (mechanic.entity !== "thisUnit" && mechanic.entity !== "thisModel") continue;
                if (!mechanic.attribute || typeof mechanic.value !== "number") continue;

                const statAttr = weaponStatMap[mechanic.attribute];
                if (statAttr) {
                    bonuses.push({
                        attribute: statAttr,
                        value: mechanic.value,
                        sourceName: enhancement.name,
                        sourceType: "enhancement",
                    });
                }
            }
        }

        return bonuses;
    }, [leaderEnhancements]);

    // Combine all stat bonuses including damaged penalties
    const allStatBonuses = useMemo((): StatBonus[] => {
        const bonuses = [...weaponStatBonuses];

        // Add damaged stat penalties if damaged
        if (combatStatus.isDamaged && damagedPenalties.otherPenalties.length > 0) {
            const statAttrMap: Record<string, StatBonus["attribute"] | undefined> = {
                a: "a",
                s: "s",
                ap: "ap",
                d: "d",
            };

            for (const penalty of damagedPenalties.otherPenalties) {
                const attr = statAttrMap[penalty.attribute];
                if (attr) {
                    bonuses.push({
                        attribute: attr,
                        value: penalty.value,
                        sourceName: "Damaged",
                        sourceType: "leader", // Using "leader" as closest match for unit ability
                    });
                }
            }
        }

        return bonuses;
    }, [weaponStatBonuses, combatStatus.isDamaged, damagedPenalties]);

    const handleUnitSelect = (combined: { item: ArmyListItem; displayName: string; isCombined: boolean }) => {
        onUnitChange(combined.item);
        onWeaponProfileChange(null);
    };

    return (
        <section className="grid grid-cols-5 grid-rows-[auto_1fr_auto] gap-4 p-4 border-1 border-skarsnikGreen rounded overflow-auto">
            <header className="col-span-5 flex">
                <Dropdown options={listOptions} selectedLabel={selectedList?.name} placeholder="Select list..." onSelect={(list) => onListChange(list.id)} triggerClassName="grow-1 max-w-[150px] rounded-tr-none rounded-br-none" />
                <SearchableDropdown
                    options={unitOptions}
                    selectedLabel={selectedUnitDisplayName}
                    placeholder="Search for a unit..."
                    searchPlaceholder="Search units..."
                    emptyMessage="Matching records missing or expunged"
                    onSelect={handleUnitSelect}
                    renderOption={(combined) => <span className="text-blockcaps-m">{combined.displayName}</span>}
                    triggerClassName="grow-999 rounded-tl-none rounded-bl-none border-nocturneGreen border-l-1"
                />
            </header>
            {unit ? (
                <Fragment>
                    <div className="col-span-3 space-y-4">
                        <SplitHeading label="Select unit armament" />
                        {/* Display leader combat bonuses when a combined unit is selected */}
                        {attachedLeaders.length > 0 && (leaderCombatBonuses.hitBonuses.length > 0 || leaderCombatBonuses.woundBonuses.length > 0 || leaderCombatBonuses.otherBonuses.length > 0) && (
                            <div className=" border-1 border-fireDragonBright bg-mournfangBrown text-fireDragonBright rounded p-3 space-y-2">
                                <h3 className="text-blockcaps-m">Active Leader Effects</h3>
                                <div className="flex flex-wrap gap-2">
                                    {leaderCombatBonuses.hitBonuses.map((bonus, idx) => (
                                        <Badge key={`hit-${idx}`} variant="outlineAlt">
                                            +{bonus.value} to Hit from {leaderCombatBonuses.hitBonuses[0]?.source}
                                        </Badge>
                                    ))}
                                    {leaderCombatBonuses.woundBonuses.map((bonus, idx) => (
                                        <Badge key={`wound-${idx}`} variant="outlineAlt">
                                            +{bonus.value} to Wound from {leaderCombatBonuses.woundBonuses[0]?.source}
                                        </Badge>
                                    ))}
                                    {leaderCombatBonuses.otherBonuses.map((bonus, idx) => (
                                        <Badge key={`other-${idx}`} variant="outlineAlt">
                                            {bonus.description}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Display all leader enhancements if present */}
                        {leaderEnhancements.length ? (
                            <div className="space-y-2">
                                <h3 className="inline-block">Equipped enhancements</h3>
                                {leaderEnhancements.map((enhancement) => (
                                    <EnhancementCard key={enhancement.id} enhancement={enhancement} />
                                ))}
                            </div>
                        ) : null}

                        {unit &&
                            availableWargear.length > 0 &&
                            (() => {
                                // Filter weapons by game phase
                                const filteredWeapons = availableWargear.filter((weapon) => (gamePhase === "SHOOTING" ? weapon.type === "Ranged" : weapon.type === "Melee")) as Array<Weapon & { sourceUnit?: string }>;

                                // Check if this is a combined unit
                                const listItemId = (unit as any).listItemId;
                                const combinedItem = listItemId ? combinedListItems.find((c) => c.item.listItemId === listItemId) : combinedListItems.find((c) => c.item.id === unit.id && c.item.name === unit.name);

                                if (combinedItem?.isCombined && combinedItem.allLeaders.length > 0 && combinedItem.bodyguardUnit) {
                                    // Group weapons by source unit
                                    const groupedWeapons = filteredWeapons.reduce(
                                        (acc, weapon) => {
                                            const source = weapon.sourceUnit || "default";
                                            if (!acc[source]) {
                                                acc[source] = [];
                                            }
                                            acc[source].push(weapon);
                                            return acc;
                                        },
                                        {} as Record<string, Array<Weapon & { sourceUnit?: string }>>
                                    );

                                    // Order: all leaders first (in order), then bodyguard unit
                                    const leaderNames = combinedItem.allLeaders.map((l) => l.name);
                                    const bodyguardName = combinedItem.bodyguardUnit.name;
                                    const orderedSources = [...leaderNames, bodyguardName].filter((source) => groupedWeapons[source] && groupedWeapons[source].length > 0);

                                    return (
                                        <div className="space-y-6">
                                            {orderedSources.map((source) => (
                                                <div key={source} className="space-y-2">
                                                    <span className="inline-block">{source}</span>
                                                    {groupedWeapons[source].map((weapon) => (
                                                        <Fragment key={weapon.name}>
                                                            {weapon.profiles.map((profile: WeaponProfile) => {
                                                                const isSelected = selectedWeaponProfile?.name === profile.name;
                                                                const profileKey = `${source}-${weapon.name}-${profile.name}`;
                                                                return <WeaponProfileCard key={profileKey} profile={profile} isSelected={isSelected} onWeaponProfileChange={onWeaponProfileChange} bonusAttributes={weaponBonusAttributes} statBonuses={allStatBonuses} />;
                                                            })}
                                                        </Fragment>
                                                    ))}
                                                </div>
                                            ))}
                                        </div>
                                    );
                                }

                                // Regular unit: show weapons without grouping
                                return (
                                    <div className="space-y-2">
                                        {filteredWeapons.map((weapon) => (
                                            <Fragment key={weapon.name}>
                                                {weapon.profiles.map((profile: WeaponProfile) => {
                                                    const isSelected = selectedWeaponProfile?.name === profile.name;
                                                    return <WeaponProfileCard key={profile.name} profile={profile} isSelected={isSelected} onWeaponProfileChange={onWeaponProfileChange} bonusAttributes={weaponBonusAttributes} statBonuses={allStatBonuses} />;
                                                })}
                                            </Fragment>
                                        ))}
                                    </div>
                                );
                            })()}
                    </div>
                    <div className="col-span-2 space-y-4">
                        <SplitHeading label="Combat status" />
                        <CombatStatusComponent side="attacker" combatStatus={combatStatus} onStatusChange={onCombatStatusChange} modelCount={modelCount} startingStrength={startingStrength} onModelCountChange={onModelCountChange} unit={unit} gamePhase={gamePhase} />
                    </div>
                </Fragment>
            ) : (
                <CombatantPanelEmpty combatant="attacker" />
            )}
            <div id="stratagems"></div>
        </section>
    );
}
