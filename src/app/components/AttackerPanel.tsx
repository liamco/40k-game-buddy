import React, { useState, useEffect, useMemo, Fragment } from "react";
import { Info, Sparkles } from "lucide-react";
import SearchableDropdown, { type SearchableDropdownOption } from "./SearchableDropdown/SearchableDropdown";
import Dropdown, { type DropdownOption } from "./Dropdown/Dropdown";
import type { Weapon, ArmyList, Datasheet, Faction, WeaponProfile, GamePhase, ArmyListItem, Detachment, Enhancement } from "../types";
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
    const combinedListItems = useMemo(() => {
        if (!selectedList) return [];

        const items = selectedList.items;
        const processed = new Set<string>();
        const combined: Array<{ item: ArmyListItem; displayName: string; isCombined: boolean }> = [];

        // First pass: Process all leaders and their attached units
        items.forEach((item) => {
            // Skip if already processed
            if (processed.has(item.listItemId)) return;

            // If this is a leader with an attached unit
            if (item.leading) {
                // Find the attached unit (without checking processed, since we process leaders first)
                const attachedUnit = items.find((u) => u.id === item.leading?.id && u.name === item.leading?.name);

                if (attachedUnit && !processed.has(attachedUnit.listItemId)) {
                    // Combine leader and attached unit
                    combined.push({
                        item: item, // Use leader as the main item
                        displayName: `${item.name} + ${attachedUnit.name}`,
                        isCombined: true,
                    });
                    processed.add(item.listItemId);
                    processed.add(attachedUnit.listItemId);
                } else {
                    // Leader but attached unit not found or already processed, show leader alone
                    combined.push({
                        item: item,
                        displayName: item.name,
                        isCombined: false,
                    });
                    processed.add(item.listItemId);
                }
            }
        });

        // Second pass: Process remaining items (units being led, regular units)
        items.forEach((item) => {
            // Skip if already processed
            if (processed.has(item.listItemId)) return;

            // If this unit is being led, skip it (it should have been added with its leader in first pass)
            if (item.leadBy) {
                // Check if the leader exists
                const leader = items.find((l) => l.id === item.leadBy?.id && l.name === item.leadBy?.name);

                if (!leader || !processed.has(leader.listItemId)) {
                    // Leader not found or not processed, show this unit alone
                    combined.push({
                        item: item,
                        displayName: item.name,
                        isCombined: false,
                    });
                    processed.add(item.listItemId);
                } else {
                    // Leader was processed, this unit should have been added with it
                    // Mark as processed to skip it
                    processed.add(item.listItemId);
                }
            }
            // Regular unit, not a leader and not being led
            else {
                combined.push({
                    item: item,
                    displayName: item.name,
                    isCombined: false,
                });
                processed.add(item.listItemId);
            }
        });

        return combined;
    }, [selectedList]);

    // Convert combined items to dropdown options
    const unitOptions = useMemo((): SearchableDropdownOption<{ item: ArmyListItem; displayName: string; isCombined: boolean }>[] => {
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

    // Filter wargear for a single unit based on loadout and selections
    const filterUnitWargear = (unitItem: ArmyListItem, wargear: Weapon[]): Weapon[] => {
        const loadoutWeapons = parseLoadoutWeapons(unitItem.loadout || "");

        // If no loadout info at all, show all weapons (fallback for units without loadout data)
        if (loadoutWeapons.length === 0) {
            return wargear;
        }

        // Filter to only show weapons in default loadout OR explicitly selected
        return wargear.filter((weapon) => {
            const inLoadout = isWeaponInLoadout(weapon.name, loadoutWeapons);
            const isSelected = isWeaponSelected(weapon.id, unitItem.loadoutSelections);
            return inLoadout || isSelected;
        });
    };

    // Get combined wargear from leader and attached unit if combined unit is selected
    const availableWargear = useMemo(() => {
        if (!unit || !selectedList) return unit?.wargear || [];

        // Get the listItemId from the selected unit
        const listItemId = (unit as ArmyListItem).listItemId;

        // Always get the fresh item from selectedList to ensure we have latest loadoutSelections
        const freshUnit = listItemId ? selectedList.items.find((item) => item.listItemId === listItemId) : null;

        // Use fresh unit if found, otherwise fall back to unit prop
        const currentUnit = freshUnit || unit;

        // Check if this is a combined unit (leader with attached unit)
        const combinedItem = listItemId ? combinedListItems.find((c) => c.item.listItemId === listItemId) : combinedListItems.find((c) => c.item.id === unit.id && c.item.name === unit.name);

        if (combinedItem?.isCombined && combinedItem.item.leading) {
            // Find the attached unit (fresh from selectedList)
            const attachedUnit = selectedList.items.find((u) => u.id === combinedItem.item.leading?.id && u.name === combinedItem.item.leading?.name);

            // Get fresh leader from selectedList
            const freshLeader = selectedList.items.find((item) => item.listItemId === combinedItem.item.listItemId);
            const leaderUnit = freshLeader || combinedItem.item;

            if (attachedUnit) {
                // Filter and combine wargear from both units with source unit labels
                const leaderFiltered = filterUnitWargear(leaderUnit, leaderUnit.wargear || []);
                const attachedFiltered = filterUnitWargear(attachedUnit, attachedUnit.wargear || []);

                const leaderWargear = leaderFiltered.map((weapon) => ({
                    ...weapon,
                    sourceUnit: leaderUnit.name,
                }));
                const attachedWargear = attachedFiltered.map((weapon) => ({
                    ...weapon,
                    sourceUnit: attachedUnit.name,
                }));
                return [...leaderWargear, ...attachedWargear];
            }
        }

        // Single unit: filter based on loadout and selections
        return filterUnitWargear(currentUnit as ArmyListItem, currentUnit.wargear || []);
    }, [unit, selectedList, combinedListItems]);

    // Collect combat bonuses from leader abilities when a combined unit is selected
    const leaderCombatBonuses = useMemo(() => {
        if (!unit || !attachedUnit) {
            return { hitBonuses: [], woundBonuses: [], otherBonuses: [] };
        }

        // Create a unit context to collect abilities
        const unitContext: UnitContext = {
            datasheet: unit,
            selectedModel: unit.models?.[0],
            state: createDefaultCombatStatus(),
            attachedLeader: attachedUnit,
        };

        // Collect all mechanics from the unit and attached leader
        const mechanics = collectUnitAbilities(unitContext, "attacker");

        // Filter to only combat-relevant roll bonuses that apply when leading
        // (mechanics with conditions about leading state)
        const leaderMechanics = mechanics.filter((m) => {
            // Check if this mechanic has a "leading" type condition
            const hasLeadingCondition = m.conditions?.some((c) => c.state === "isLeadingUnit" || c.state === "leading" || (Array.isArray(c.state) && (c.state.includes("isLeadingUnit") || c.state.includes("leading"))));
            return hasLeadingCondition;
        });

        return extractCombatBonuses(leaderMechanics);
    }, [unit, attachedUnit]);

    // Get enhancement details from the leader
    const leaderEnhancement = useMemo((): Enhancement | null => {
        if (!selectedList || !factionData || !unit) return null;

        // Find the leader in the selected list
        // First try by listItemId if available
        const listItemId = (unit as ArmyListItem)?.listItemId;
        let leaderItem: ArmyListItem | undefined;

        if (listItemId) {
            leaderItem = selectedList.items.find((item) => item.listItemId === listItemId);
        }

        // Fallback: find by matching the combined unit display name pattern
        if (!leaderItem) {
            // Check combinedListItems to find the leader
            const combinedItem = combinedListItems.find((c) => c.item.id === unit.id && c.item.name === unit.name);
            if (combinedItem) {
                leaderItem = combinedItem.item;
            } else {
                // Try to find any item with matching id that has an enhancement
                leaderItem = selectedList.items.find((item) => item.id === unit.id && item.enhancement);
            }
        }

        if (!leaderItem?.enhancement) return null;

        // Find the detachment in faction data
        const detachment = factionData.detachments?.find((d: Detachment) => d.slug === selectedList.detachmentSlug);
        if (!detachment?.enhancements) return null;

        // Find the full enhancement details
        const fullEnhancement = detachment.enhancements.find((e: Enhancement) => e.id === leaderItem!.enhancement?.id);
        if (!fullEnhancement) {
            // Return basic info if we can't find full details
            return {
                id: leaderItem.enhancement.id,
                name: leaderItem.enhancement.name,
                cost: leaderItem.enhancement.cost,
            };
        }

        return fullEnhancement;
    }, [unit, selectedList, factionData, combinedListItems]);

    // Extract weapon bonus attributes from enhancement mechanics AND leader abilities
    const weaponBonusAttributes = useMemo((): BonusAttribute[] => {
        const bonuses: BonusAttribute[] = [];

        // Extract from enhancement mechanics
        if (leaderEnhancement?.mechanics) {
            for (const mechanic of leaderEnhancement.mechanics) {
                // Only look at addsAbility effects that target thisUnit or thisModel
                if (mechanic.effect !== "addsAbility" || !mechanic.abilities) continue;
                if (mechanic.entity !== "thisUnit" && mechanic.entity !== "thisModel") continue;

                // Check each ability to see if it's a weapon attribute
                for (const ability of mechanic.abilities) {
                    const upperAbility = ability.toUpperCase();
                    const isWeaponAttribute = WEAPON_ABILITY_KEYWORDS.some((keyword) => upperAbility.startsWith(keyword) || upperAbility.includes(keyword));

                    if (isWeaponAttribute) {
                        bonuses.push({
                            name: ability,
                            value: mechanic.value,
                            source: leaderEnhancement.name,
                        });
                    }
                }
            }
        }

        // Extract from leader abilities when a combined unit is selected
        if (unit && attachedUnit) {
            // Create a unit context to collect abilities
            const unitContext: UnitContext = {
                datasheet: unit,
                selectedModel: unit.models?.[0],
                state: createDefaultCombatStatus(),
                attachedLeader: attachedUnit,
            };

            // Collect all mechanics from the unit and attached leader
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
                                    source: mechanic.source?.name || "Leader Ability",
                                });
                            }
                        }
                    }
                }
            }
        }

        return bonuses;
    }, [leaderEnhancement, unit, attachedUnit]);

    // Extract weapon stat bonuses from enhancement mechanics (e.g., +1 Strength)
    const weaponStatBonuses = useMemo((): StatBonus[] => {
        if (!leaderEnhancement?.mechanics) return [];

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

        for (const mechanic of leaderEnhancement.mechanics) {
            // Look for rollBonus or staticNumber effects on weapon attributes
            if (mechanic.effect !== "rollBonus" && mechanic.effect !== "staticNumber") continue;
            if (mechanic.entity !== "thisUnit" && mechanic.entity !== "thisModel") continue;
            if (!mechanic.attribute || typeof mechanic.value !== "number") continue;

            const statAttr = weaponStatMap[mechanic.attribute];
            if (statAttr) {
                bonuses.push({
                    attribute: statAttr,
                    value: mechanic.value,
                    source: leaderEnhancement.name,
                });
            }
        }

        return bonuses;
    }, [leaderEnhancement]);

    const handleUnitSelect = (combined: { item: ArmyListItem; displayName: string; isCombined: boolean }) => {
        onUnitChange(combined.item);
        onWeaponProfileChange(null);
    };

    return (
        <section className="grid grid-cols-5 grid-rows-[auto_1fr_auto] gap-4 p-4 border-1 border-skarsnikGreen rounded overflow-auto">
            <header className="col-span-5 flex">
                <Dropdown options={listOptions} selectedLabel={selectedList?.name} placeholder="Select list..." onSelect={(list) => onListChange(list.id)} triggerClassName="grow-1 max-w-[150px] rounded-tr-none rounded-br-none" />
                <SearchableDropdown options={unitOptions} selectedLabel={selectedUnitDisplayName} placeholder="Search for a unit..." searchPlaceholder="Search units..." emptyMessage="No unit found." onSelect={handleUnitSelect} renderOption={(combined) => <span className="text-blockcaps-m">{combined.displayName}</span>} triggerClassName="grow-999 rounded-tl-none rounded-bl-none border-nocturneGreen border-l-1" />
            </header>
            {unit ? (
                <Fragment>
                    <div className="col-span-3 space-y-4">
                        <SplitHeading label="Select unit armament" />
                        {/* Display leader combat bonuses when a combined unit is selected */}
                        {attachedUnit && (leaderCombatBonuses.hitBonuses.length > 0 || leaderCombatBonuses.woundBonuses.length > 0 || leaderCombatBonuses.otherBonuses.length > 0) && (
                            <div className="bg-green-50 border border-green-200 rounded-[4px] p-3 space-y-2">
                                <p className="text-[10px] font-bold text-green-800 uppercase">Leader Bonuses Active</p>
                                <div className="flex flex-wrap gap-2">
                                    {leaderCombatBonuses.hitBonuses.map((bonus, idx) => (
                                        <span key={`hit-${idx}`} className="text-[10px] font-bold uppercase p-1 px-2 rounded bg-green-200 text-green-800" title={bonus.source}>
                                            +{bonus.value} to Hit
                                        </span>
                                    ))}
                                    {leaderCombatBonuses.woundBonuses.map((bonus, idx) => (
                                        <span key={`wound-${idx}`} className="text-[10px] font-bold uppercase p-1 px-2 rounded bg-green-200 text-green-800" title={bonus.source}>
                                            +{bonus.value} to Wound
                                        </span>
                                    ))}
                                    {leaderCombatBonuses.otherBonuses.map((bonus, idx) => (
                                        <span key={`other-${idx}`} className="text-[10px] font-bold uppercase p-1 px-2 rounded bg-green-200 text-green-800" title={bonus.source}>
                                            {bonus.description}
                                        </span>
                                    ))}
                                </div>
                                <p className="text-[9px] text-green-600 italic">From: {leaderCombatBonuses.hitBonuses[0]?.source || leaderCombatBonuses.woundBonuses[0]?.source || leaderCombatBonuses.otherBonuses[0]?.source}</p>
                            </div>
                        )}

                        {/* Display leader enhancement if present */}
                        {leaderEnhancement && <EnhancementCard enhancement={leaderEnhancement} />}

                        {unit &&
                            availableWargear.length > 0 &&
                            (() => {
                                // Filter weapons by game phase
                                const filteredWeapons = availableWargear.filter((weapon) => (gamePhase === "SHOOTING" ? weapon.type === "Ranged" : weapon.type === "Melee")) as Array<Weapon & { sourceUnit?: string }>;

                                // Check if this is a combined unit
                                const listItemId = (unit as any).listItemId;
                                const combinedItem = listItemId ? combinedListItems.find((c) => c.item.listItemId === listItemId) : combinedListItems.find((c) => c.item.id === unit.id && c.item.name === unit.name);

                                if (combinedItem?.isCombined && combinedItem.item.leading) {
                                    // Find the attached unit to get its name
                                    const attachedUnit = selectedList?.items.find((u) => u.id === combinedItem.item.leading?.id && u.name === combinedItem.item.leading?.name);

                                    if (attachedUnit) {
                                        const leaderName = combinedItem.item.name;
                                        const attachedName = attachedUnit.name;

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

                                        // Order: leader first, then attached unit
                                        const orderedSources = [leaderName, attachedName].filter((source) => groupedWeapons[source] && groupedWeapons[source].length > 0);

                                        return (
                                            <div className="space-y-2">
                                                {orderedSources.map((source) => (
                                                    <div key={source} className="space-y-2">
                                                        <span>from {source}</span>
                                                        {groupedWeapons[source].map((weapon) => (
                                                            <Fragment key={weapon.name}>
                                                                {weapon.profiles.map((profile: WeaponProfile) => {
                                                                    const isSelected = selectedWeaponProfile?.name === profile.name;
                                                                    const profileKey = `${source}-${weapon.name}-${profile.name}`;
                                                                    return <WeaponProfileCard key={profileKey} profile={profile} isSelected={isSelected} onWeaponProfileChange={onWeaponProfileChange} bonusAttributes={weaponBonusAttributes} statBonuses={weaponStatBonuses} />;
                                                                })}
                                                            </Fragment>
                                                        ))}
                                                    </div>
                                                ))}
                                            </div>
                                        );
                                    }
                                }

                                // Regular unit: show weapons without grouping
                                return (
                                    <div className="space-y-2">
                                        {filteredWeapons.map((weapon) => (
                                            <Fragment key={weapon.name}>
                                                {weapon.profiles.map((profile: WeaponProfile) => {
                                                    const isSelected = selectedWeaponProfile?.name === profile.name;
                                                    return <WeaponProfileCard key={profile.name} profile={profile} isSelected={isSelected} onWeaponProfileChange={onWeaponProfileChange} bonusAttributes={weaponBonusAttributes} statBonuses={weaponStatBonuses} />;
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
