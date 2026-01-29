import { useMemo } from "react";
import SplitHeading from "#components/SplitHeading/SplitHeading.tsx";
import WeaponProfileCard from "#components/WeaponProfileCard/WeaponProfileCard.tsx";
import { useListManager } from "#modules/Lists/ListManagerContext.tsx";
import { ArmyList, ArmyListItem } from "#types/Lists.tsx";
import { Weapon } from "#types/Weapons.tsx";
import { LoadoutOption } from "#types/index.ts";
import { ArrowLeftRight, Plus, Minus, ChevronDown } from "lucide-react";

interface Props {
    unit: ArmyListItem;
    list: ArmyList;
}

// Represents how weapons should be displayed in the UI
interface WeaponDisplayGroup {
    type: "replacement" | "addition" | "ratio-replacement" | "multi-choice-ratio" | "default-only";
    optionLine?: number;
    optionDescription?: string; // Original option description for display
    // For replacement pairs
    leftWeapon?: Weapon; // Default weapon (can be replaced)
    rightWeapon?: Weapon; // Replacement weapon
    // For additions and default-only
    weapon?: Weapon;
    // For multi-choice options
    availableWeapons?: Weapon[]; // All weapons that can be chosen
    chosenWeapons?: string[]; // Currently chosen weapon names for each slot
    // Selection state
    isLeftSelected: boolean;
    isRightSelected: boolean;
    // For ratio-based selections
    currentCount?: number;
    maxCount?: number;
}

// Helper to find a weapon by name (fuzzy matching)
function findWeaponByName(weapons: Weapon[], name: string): Weapon | undefined {
    const nameLower = name.toLowerCase();
    return weapons.find((w) => {
        const weaponNameLower = w.name.toLowerCase();
        return weaponNameLower.includes(nameLower) || nameLower.includes(weaponNameLower);
    });
}

const WargearTab = ({ unit, list }: Props) => {
    const { getDefaultLoadout, getLoadoutOptions, updateLoadoutSelection, updateLoadoutWeaponChoice } = useListManager();

    const loadoutOptions = getLoadoutOptions(unit);

    // Build weapon display groups
    const weaponGroups = useMemo((): WeaponDisplayGroup[] => {
        if (!unit.availableWargear) return [];

        const groups: WeaponDisplayGroup[] = [];
        const defaultWeaponNames = getDefaultLoadout(unit);
        const loadoutSelections = unit.loadoutSelections || {};
        const loadoutWeaponChoices = unit.loadoutWeaponChoices || {};

        // Track which default weapons have been assigned to replacement groups
        const assignedDefaults = new Set<string>();

        // Process options to create groups
        loadoutOptions.forEach((option: LoadoutOption) => {
            if (option.isNote) return;

            const hasReplacements = option.replacesWeapons && option.replacesWeapons.length > 0;
            const hasAdditions = option.addsWeapons && option.addsWeapons.length > 0;
            const isSelected = (loadoutSelections[option.line] || 0) > 0;

            if (hasReplacements && hasAdditions) {
                // This is a replacement option
                const replacedName = option.replacesWeapons![0];
                const leftWeapon = findWeaponByName(unit.availableWargear!, replacedName);

                // Check if this is a ratio-based replacement
                const isRatioReplacement = option.constraint.type === "ratio";

                // Check if this option has multiple weapon choices
                const isMultiChoice = option.addsWeapons!.length > 1;

                if (isRatioReplacement && isMultiChoice && leftWeapon) {
                    // Multi-choice ratio replacement - show slots with weapon selectors
                    const availableWeapons = option.addsWeapons!.map((name) => findWeaponByName(unit.availableWargear!, name)).filter((w): w is Weapon => w !== undefined);

                    const chosenWeapons = loadoutWeaponChoices[option.line] || [];

                    groups.push({
                        type: "multi-choice-ratio",
                        optionLine: option.line,
                        optionDescription: option.description,
                        leftWeapon,
                        availableWeapons,
                        chosenWeapons,
                        isLeftSelected: false,
                        isRightSelected: chosenWeapons.length > 0,
                        currentCount: chosenWeapons.length,
                        maxCount: option.constraint.maxSelections,
                    });
                } else if (isRatioReplacement) {
                    // Single-choice ratio replacement
                    const addedName = option.addsWeapons![0];
                    const rightWeapon = findWeaponByName(unit.availableWargear!, addedName);

                    if (leftWeapon && rightWeapon) {
                        groups.push({
                            type: "ratio-replacement",
                            optionLine: option.line,
                            optionDescription: option.description,
                            weapon: rightWeapon,
                            isLeftSelected: false,
                            isRightSelected: option.currentSelections > 0,
                            currentCount: option.currentSelections,
                            maxCount: option.constraint.maxSelections,
                        });
                    }
                } else {
                    // Simple replacement - either/or choice
                    const addedName = option.addsWeapons![0];
                    const rightWeapon = findWeaponByName(unit.availableWargear!, addedName);

                    if (leftWeapon && rightWeapon) {
                        assignedDefaults.add(leftWeapon.id);
                        groups.push({
                            type: "replacement",
                            optionLine: option.line,
                            leftWeapon,
                            rightWeapon,
                            isLeftSelected: !isSelected,
                            isRightSelected: isSelected,
                        });
                    }
                }
            } else if (hasAdditions && !hasReplacements) {
                // This is an addition-only option
                const addedName = option.addsWeapons![0];
                const weapon = findWeaponByName(unit.availableWargear!, addedName);

                if (weapon) {
                    groups.push({
                        type: "addition",
                        optionLine: option.line,
                        optionDescription: option.description,
                        weapon,
                        isLeftSelected: false,
                        isRightSelected: isSelected,
                    });
                }
            }
        });

        // Add remaining default weapons that weren't part of replacement options
        defaultWeaponNames.forEach((defaultName) => {
            const weapon = findWeaponByName(unit.availableWargear!, defaultName);
            if (weapon && !assignedDefaults.has(weapon.id)) {
                groups.push({
                    type: "default-only",
                    weapon,
                    isLeftSelected: true,
                    isRightSelected: false,
                });
            }
        });

        return groups;
    }, [unit, unit.availableWargear, unit.loadoutSelections, unit.loadoutWeaponChoices, loadoutOptions, getDefaultLoadout]);

    // Split groups by weapon type
    const rangedReplacements = weaponGroups.filter((g) => g.type === "replacement" && g.leftWeapon?.type === "Ranged");
    const rangedAdditions = weaponGroups.filter((g) => (g.type === "addition" || g.type === "ratio-replacement" || g.type === "multi-choice-ratio") && (g.weapon?.type === "Ranged" || g.availableWeapons?.[0]?.type === "Ranged"));
    const rangedDefaults = weaponGroups.filter((g) => g.type === "default-only" && g.weapon?.type === "Ranged");
    const meleeGroups = weaponGroups.filter((g) => {
        if (g.type === "replacement") return g.leftWeapon?.type === "Melee";
        if (g.type === "ratio-replacement") return g.weapon?.type === "Melee";
        if (g.type === "multi-choice-ratio") return g.availableWeapons?.[0]?.type === "Melee";
        return g.weapon?.type === "Melee";
    });

    // Handle clicking a weapon in a replacement pair
    const handleReplacementClick = (group: WeaponDisplayGroup, clickedSide: "left" | "right") => {
        if (!group.optionLine) return;

        if (clickedSide === "left" && !group.isLeftSelected) {
            // Clicked left (default) when right is selected -> deselect option
            updateLoadoutSelection(list, unit.listItemId, group.optionLine, 0);
        } else if (clickedSide === "right" && !group.isRightSelected) {
            // Clicked right (replacement) when left is selected -> select option
            updateLoadoutSelection(list, unit.listItemId, group.optionLine, 1);
        }
    };

    // Handle clicking an addition weapon
    const handleAdditionClick = (group: WeaponDisplayGroup) => {
        if (!group.optionLine) return;

        const currentCount = unit.loadoutSelections?.[group.optionLine] || 0;
        updateLoadoutSelection(list, unit.listItemId, group.optionLine, currentCount > 0 ? 0 : 1);
    };

    // Handle incrementing/decrementing a ratio-based selection
    const handleRatioChange = (group: WeaponDisplayGroup, delta: number) => {
        if (!group.optionLine) return;

        const currentCount = group.currentCount || 0;
        const newCount = currentCount + delta;
        updateLoadoutSelection(list, unit.listItemId, group.optionLine, newCount);
    };

    // Handle adding a new slot for multi-choice options
    const handleAddSlot = (group: WeaponDisplayGroup) => {
        if (!group.optionLine || !group.availableWeapons?.length) return;

        const currentCount = group.currentCount || 0;
        const maxCount = group.maxCount || 0;
        if (currentCount >= maxCount) return;

        // Add a new slot with the first available weapon as default
        const defaultWeapon = group.availableWeapons[0].name;
        updateLoadoutWeaponChoice(list, unit.listItemId, group.optionLine, currentCount, defaultWeapon);
    };

    // Handle removing a slot for multi-choice options
    const handleRemoveSlot = (group: WeaponDisplayGroup, slotIndex: number) => {
        if (!group.optionLine) return;
        updateLoadoutWeaponChoice(list, unit.listItemId, group.optionLine, slotIndex, null);
    };

    // Handle changing the weapon choice for a slot
    const handleWeaponChoiceChange = (group: WeaponDisplayGroup, slotIndex: number, weaponName: string) => {
        if (!group.optionLine) return;
        updateLoadoutWeaponChoice(list, unit.listItemId, group.optionLine, slotIndex, weaponName);
    };

    const hasContent = weaponGroups.length > 0;

    if (!hasContent) {
        return (
            <div className="text-skarsnikGreen/60">
                <p>No wargear data available for this unit.</p>
            </div>
        );
    }

    // Render a single weapon card (handles multi-profile weapons)
    const renderWeaponCard = (weapon: Weapon, isSelected: boolean, buttonLabel?: string, onClick?: () => void, counterControls?: { current: number; max: number; onIncrement: () => void; onDecrement: () => void }) => {
        return (
            <div className="space-y-2 flex-1">
                {weapon.profiles?.map((profile, pIdx) => (
                    <WeaponProfileCard
                        key={`${weapon.id}-${pIdx}`}
                        profile={profile}
                        isSelected={isSelected}
                        showToggleButton={pIdx === 0 && !!buttonLabel && isSelected}
                        toggleLabel={buttonLabel}
                        onToggle={onClick}
                        canToggle={!!onClick}
                        onCardClick={!isSelected && !counterControls ? onClick : undefined}
                        counterControls={pIdx === 0 ? counterControls : undefined}
                    />
                ))}
            </div>
        );
    };

    // Render a replacement pair row
    const renderReplacementPair = (group: WeaponDisplayGroup) => {
        if (!group.leftWeapon || !group.rightWeapon) return null;

        return (
            <div key={group.optionLine} className="flex items-center gap-3">
                {renderWeaponCard(group.leftWeapon, group.isLeftSelected, group.isLeftSelected ? "Weapon primed" : undefined, () => handleReplacementClick(group, "left"))}
                <div className="flex-shrink-0 text-skarsnikGreen/60">
                    <ArrowLeftRight className="w-6 h-6" />
                </div>
                {renderWeaponCard(group.rightWeapon, group.isRightSelected, group.isRightSelected ? "Weapon primed" : undefined, () => handleReplacementClick(group, "right"))}
            </div>
        );
    };

    // Strip HTML tags from option description for display
    const stripHtml = (html: string): string => {
        return html
            .replace(/<[^>]*>/g, " ")
            .replace(/\s+/g, " ")
            .trim();
    };

    // Render a multi-choice ratio option with slots
    const renderMultiChoiceRatio = (group: WeaponDisplayGroup) => {
        if (!group.availableWeapons || group.availableWeapons.length === 0) return null;

        const currentCount = group.currentCount || 0;
        const maxCount = group.maxCount || 0;
        const chosenWeapons = group.chosenWeapons || [];
        const canAddMore = currentCount < maxCount;

        return (
            <div key={group.optionLine} className="space-y-3">
                {/* Option description */}
                {group.optionDescription && <p className="text-body-s text-skarsnikGreen/80">{stripHtml(group.optionDescription)}</p>}

                {/* Render each slot */}
                {chosenWeapons.map((chosenName, slotIndex) => {
                    const chosenWeapon = findWeaponByName(group.availableWeapons!, chosenName);

                    return (
                        <div key={slotIndex} className="flex items-start gap-3">
                            {/* Weapon selector dropdown */}
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-body-s text-skarsnikGreen/60">Slot {slotIndex + 1}:</span>
                                    <div className="relative flex-1">
                                        <select
                                            value={chosenName}
                                            onChange={(e) => handleWeaponChoiceChange(group, slotIndex, e.target.value)}
                                            className="w-full bg-deathKorps border border-skarsnikGreen/30 text-skarsnikGreen rounded px-3 py-1.5 text-body-s appearance-none cursor-pointer hover:border-skarsnikGreen/50 focus:outline-none focus:border-skarsnikGreen"
                                        >
                                            {group.availableWeapons!.map((weapon) => (
                                                <option key={weapon.id} value={weapon.name}>
                                                    {weapon.name}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-skarsnikGreen/60 pointer-events-none" />
                                    </div>
                                    <button onClick={() => handleRemoveSlot(group, slotIndex)} className="p-1 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded" title="Remove this weapon">
                                        <Minus className="w-4 h-4" />
                                    </button>
                                </div>
                                {/* Show selected weapon card */}
                                {chosenWeapon && renderWeaponCard(chosenWeapon, true)}
                            </div>
                        </div>
                    );
                })}

                {/* Add slot button */}
                {canAddMore && (
                    <button onClick={() => handleAddSlot(group)} className="flex items-center gap-2 px-3 py-2 text-body-s text-skarsnikGreen/80 hover:text-skarsnikGreen border border-dashed border-skarsnikGreen/30 hover:border-skarsnikGreen/50 rounded w-full justify-center">
                        <Plus className="w-4 h-4" />
                        Add weapon replacement ({currentCount}/{maxCount})
                    </button>
                )}

                {/* Show max reached message */}
                {!canAddMore && currentCount > 0 && (
                    <p className="text-body-s text-skarsnikGreen/50 text-center">
                        Maximum replacements reached ({currentCount}/{maxCount})
                    </p>
                )}
            </div>
        );
    };

    // Render an addition weapon (simple addition or ratio-replacement)
    const renderAdditionWeapon = (group: WeaponDisplayGroup) => {
        if (!group.weapon) return null;

        const isRatioReplacement = group.type === "ratio-replacement";

        // Build counter controls for ratio replacements
        const counterControls = isRatioReplacement
            ? {
                  current: group.currentCount || 0,
                  max: group.maxCount || 0,
                  onIncrement: () => handleRatioChange(group, 1),
                  onDecrement: () => handleRatioChange(group, -1),
              }
            : undefined;

        return (
            <div key={group.optionLine || group.weapon.id} className="space-y-2">
                {/* Show option description */}
                {group.optionDescription && <p className="text-body-s text-skarsnikGreen/80">{stripHtml(group.optionDescription)}</p>}
                {renderWeaponCard(group.weapon, group.isRightSelected || (group.currentCount || 0) > 0, group.isRightSelected && !isRatioReplacement ? "Weapon added" : undefined, !isRatioReplacement ? () => handleAdditionClick(group) : undefined, counterControls)}
            </div>
        );
    };

    // Render a default-only weapon
    const renderDefaultWeapon = (group: WeaponDisplayGroup) => {
        if (!group.weapon) return null;

        return <div key={group.weapon.id}>{renderWeaponCard(group.weapon, true)}</div>;
    };

    return (
        <div className="space-y-8">
            {/* Ranged Weapons Section */}
            {(rangedReplacements.length > 0 || rangedDefaults.length > 0) && (
                <section className="space-y-4">
                    <SplitHeading label="Ranged Weapons" />
                    <div className="space-y-4">
                        {rangedReplacements.map(renderReplacementPair)}
                        {rangedDefaults.map(renderDefaultWeapon)}
                    </div>
                </section>
            )}

            {/* Additional Ranged Weapons Section */}
            {rangedAdditions.length > 0 && (
                <section className="space-y-4">
                    <SplitHeading label="Additional Ranged Weapons" />
                    <div className="space-y-4">
                        {rangedAdditions.map((group) => {
                            if (group.type === "multi-choice-ratio") {
                                return renderMultiChoiceRatio(group);
                            } else {
                                return renderAdditionWeapon(group);
                            }
                        })}
                    </div>
                </section>
            )}

            {/* Melee Weapons Section */}
            {meleeGroups.length > 0 && (
                <section className="space-y-4">
                    <SplitHeading label="Melee Weapons" />
                    <div className="space-y-4">
                        {meleeGroups.map((group) => {
                            if (group.type === "replacement") {
                                return renderReplacementPair(group);
                            } else if (group.type === "multi-choice-ratio") {
                                return renderMultiChoiceRatio(group);
                            } else if (group.type === "addition" || group.type === "ratio-replacement") {
                                return renderAdditionWeapon(group);
                            } else {
                                return renderDefaultWeapon(group);
                            }
                        })}
                    </div>
                </section>
            )}
        </div>
    );
};

export default WargearTab;
