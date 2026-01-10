import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, X, ChevronDown } from "lucide-react";

import { Badge } from "../../components/_ui/badge";
import { Button } from "../../components/_ui/button";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "../../components/_ui/collapsible";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/_ui/card";
import { Input } from "../../components/_ui/input";
import { Label } from "../../components/_ui/label";
import SearchableDropdown, { type SearchableDropdownOption } from "../../components/SearchableDropdown/SearchableDropdown";

import { loadDatasheetData } from "../../utils/depotDataLoader";
import type { ArmyList, ArmyListItem, Datasheet } from "../../types";

import { useListManager } from "./ListManagerContext";
import ListItem from "./ListItem";

export function ListView() {
    const { listId } = useParams<{ listId: string }>();
    const navigate = useNavigate();
    const { lists, listsLoaded, getListById, factionData, loadFactionDataBySlug, addDatasheetToList, removeItemFromList, updateListItem, attachLeaderToUnit, detachLeaderFromUnit, attachEnhancementToLeader, calculateItemPoints, calculateTotalModels, parseLoadoutWeapons, parseOptionConstraint } = useListManager();

    const [selectedItem, setSelectedItem] = useState<ArmyListItem | null>(null);
    const [bodyguardUnits, setBodyguardUnits] = useState<Datasheet[]>([]);
    const [loadingBodyguards, setLoadingBodyguards] = useState(false);

    const selectedList = useMemo(() => (listId ? getListById(listId) : undefined), [listId, getListById, lists]);

    // Load faction data when list changes
    useEffect(() => {
        if (selectedList) {
            loadFactionDataBySlug(selectedList.factionSlug);
        }
    }, [selectedList?.factionSlug, loadFactionDataBySlug]);

    // Redirect if list not found (only after lists have loaded)
    useEffect(() => {
        if (listsLoaded && listId && !selectedList) {
            navigate("/lists");
        }
    }, [listId, selectedList, listsLoaded, navigate]);

    // Update selectedItem when list changes
    useEffect(() => {
        if (selectedItem && selectedList) {
            const updatedItem = selectedList.items.find((item) => item.listItemId === selectedItem.listItemId);
            if (updatedItem) {
                setSelectedItem(updatedItem);
            } else {
                setSelectedItem(null);
            }
        }
    }, [selectedList, selectedItem?.listItemId]);

    // Load bodyguard units when a leader is selected
    useEffect(() => {
        const loadBodyguardUnits = async () => {
            if (!selectedItem || !factionData || !selectedList) {
                setBodyguardUnits([]);
                return;
            }

            if (!selectedItem.leaders?.length) {
                setBodyguardUnits([]);
                return;
            }

            setLoadingBodyguards(true);
            const bodyguards: Datasheet[] = [];

            for (const datasheetRef of selectedItem.leaders) {
                try {
                    const fullDatasheet = await loadDatasheetData(selectedList.factionSlug, datasheetRef.id);
                    if (fullDatasheet) {
                        bodyguards.push(fullDatasheet);
                    }
                } catch (error) {
                    console.error(`Error loading datasheet ${datasheetRef.id}:`, error);
                }
            }

            setBodyguardUnits(bodyguards);
            setLoadingBodyguards(false);
        };

        loadBodyguardUnits();
    }, [selectedItem, factionData, selectedList]);

    // Split bodyguard units into those in the list and those not in the list
    const { unitsInList, unitsNotInList } = useMemo(() => {
        if (!selectedList || bodyguardUnits.length === 0) {
            return { unitsInList: [], unitsNotInList: [] };
        }

        const leadableDatasheetIds = new Set(bodyguardUnits.map((unit) => unit.id));
        const inList: ArmyListItem[] = selectedList.items.filter((item) => leadableDatasheetIds.has(item.id));
        const listUnitIds = new Set(selectedList.items.map((item) => item.id));
        const notInList: Datasheet[] = bodyguardUnits.filter((unit) => !listUnitIds.has(unit.id));

        return { unitsInList: inList, unitsNotInList: notInList };
    }, [bodyguardUnits, selectedList]);

    // Reorder list items to group leaders with their attached units
    const orderedListItems = useMemo(() => {
        if (!selectedList) return [];

        const items = [...selectedList.items];
        const processed = new Set<string>();
        const ordered: ArmyListItem[] = [];

        items.forEach((item) => {
            if (processed.has(item.listItemId)) return;

            if (item.leading) {
                const attachedUnit = items.find((u) => u.id === item.leading?.id && u.name === item.leading?.name && !processed.has(u.listItemId));

                if (attachedUnit) {
                    ordered.push(item);
                    ordered.push(attachedUnit);
                    processed.add(item.listItemId);
                    processed.add(attachedUnit.listItemId);
                } else {
                    ordered.push(item);
                    processed.add(item.listItemId);
                }
            }
        });

        items.forEach((item) => {
            if (processed.has(item.listItemId)) return;

            if (item.leadBy) {
                const leader = items.find((l) => l.id === item.leadBy?.id && l.name === item.leadBy?.name);
                if (!leader || !processed.has(leader.listItemId)) {
                    ordered.push(item);
                    processed.add(item.listItemId);
                }
            }
        });

        items.forEach((item) => {
            if (!processed.has(item.listItemId)) {
                ordered.push(item);
            }
        });

        return ordered;
    }, [selectedList]);

    // Convert datasheets to dropdown options
    const datasheetOptions = useMemo((): SearchableDropdownOption<Datasheet>[] => {
        if (!factionData?.datasheets) return [];
        return factionData.datasheets.map((datasheet) => ({
            id: datasheet.id,
            searchValue: `${datasheet.name} ${datasheet.roleLabel} ${datasheet.slug}`,
            data: datasheet,
        }));
    }, [factionData]);

    const handleAddDatasheet = async (datasheet: Datasheet) => {
        if (!selectedList) return;
        await addDatasheetToList(selectedList, datasheet);
    };

    const handleRemoveItem = (itemId: string) => {
        if (!selectedList) return;
        removeItemFromList(selectedList, itemId);
        if (selectedItem?.listItemId === itemId) {
            setSelectedItem(null);
        }
    };

    const handleUpdateComposition = (line: number, newCount: number, min: number, max: number) => {
        if (!selectedList || !selectedItem) return;

        const clampedCount = Math.max(min, Math.min(max, newCount));
        updateListItem(selectedList, selectedItem.listItemId, {
            compositionCounts: {
                ...selectedItem.compositionCounts,
                [line]: clampedCount,
            },
        });
    };

    const handleAttachLeader = (targetUnitItemId: string) => {
        if (!selectedList || !selectedItem) return;
        attachLeaderToUnit(selectedList, selectedItem.listItemId, targetUnitItemId);
    };

    const handleDetachLeader = () => {
        if (!selectedList || !selectedItem) return;
        detachLeaderFromUnit(selectedList, selectedItem.listItemId);
    };

    const handleAttachEnhancement = (enhancement: { id: string; name: string; cost?: number }) => {
        if (!selectedList || !selectedItem) return;
        attachEnhancementToLeader(selectedList, selectedItem.listItemId, enhancement);
    };

    // Calculate total points for the selected list
    const listTotalPoints = useMemo(() => {
        if (!selectedList) return 0;
        return selectedList.items.reduce((total, item) => {
            const unitPoints = calculateItemPoints(item);
            const enhancementPoints = item.enhancement?.cost ?? 0;
            return total + unitPoints + enhancementPoints;
        }, 0);
    }, [selectedList, calculateItemPoints]);

    // Calculate points for selected item
    const calculatedPoints = useMemo(() => {
        if (!selectedItem) return null;
        return calculateItemPoints(selectedItem);
    }, [selectedItem, calculateItemPoints]);

    // Get enhancements for the selected detachment, filtered by unit eligibility
    const detachmentEnhancements = useMemo(() => {
        if (!selectedList?.detachmentSlug || !factionData?.detachments || !selectedItem) {
            return [];
        }

        const unitKeywords = (selectedItem.keywords || []).map((k) => k.keyword.toUpperCase().trim());

        if (!selectedItem || !unitKeywords.includes("CHARACTER")) {
            return [];
        }

        const detachment = factionData.detachments.find((d) => d.slug === selectedList.detachmentSlug);
        const allEnhancements = detachment?.enhancements || [];

        const stripHtmlAndNormalize = (html: string): string => {
            return html
                .replace(/<[^>]*>/g, " ")
                .replace(/\s+/g, " ")
                .trim()
                .toUpperCase();
        };

        return allEnhancements.filter((enhancement) => {
            if (!enhancement.description) return true;

            const normalizedDescription = stripHtmlAndNormalize(enhancement.description);
            const modelOnlyMatch = normalizedDescription.match(/(.+?)\s+MODEL\s+ONLY/i);

            if (modelOnlyMatch) {
                const requirementText = modelOnlyMatch[1].trim();

                if (requirementText.includes(" OR ")) {
                    const keywords = requirementText.split(" OR ").map((k) => k.trim());
                    return keywords.some((keyword) => {
                        return unitKeywords.some((unitKeyword) => {
                            return unitKeyword === keyword || unitKeyword.includes(keyword) || keyword.includes(unitKeyword) || keyword.split(" ").every((word) => unitKeyword.includes(word));
                        });
                    });
                } else {
                    const requiredKeyword = requirementText.trim();
                    return unitKeywords.some((unitKeyword) => {
                        return unitKeyword === requiredKeyword || unitKeyword.includes(requiredKeyword) || requiredKeyword.includes(unitKeyword) || requiredKeyword.split(" ").every((word) => unitKeyword.includes(word));
                    });
                }
            }

            return true;
        });
    }, [selectedList, factionData, selectedItem]);

    // Track which enhancements are already used by other leaders
    const usedEnhancements = useMemo(() => {
        if (!selectedList || !selectedItem) return new Map<string, string>();

        const usedMap = new Map<string, string>();
        selectedList.items.forEach((item) => {
            if (item.listItemId === selectedItem.listItemId) return;
            if (item.enhancement) {
                usedMap.set(item.enhancement.id, item.name);
            }
        });

        return usedMap;
    }, [selectedList, selectedItem]);

    // Categorize wargear into default (from loadout) and optional (selectable)
    const categorizedWargear = useMemo(() => {
        if (!selectedItem?.wargear || selectedItem.wargear.length === 0) {
            return { defaultWeapons: [], optionalWeapons: [], totalConstraint: 0 };
        }

        const loadoutWeapons = parseLoadoutWeapons(selectedItem.loadout || "");
        const totalModels = calculateTotalModels(selectedItem);

        let totalConstraint = 0;
        if (selectedItem.options) {
            selectedItem.options.forEach((option) => {
                const constraint = parseOptionConstraint(option.description, totalModels);
                totalConstraint += constraint.maxSelections;
            });
        }

        const defaultWeapons: typeof selectedItem.wargear = [];
        const optionalWeapons: typeof selectedItem.wargear = [];

        selectedItem.wargear.forEach((weapon) => {
            const weaponName = weapon.name.toLowerCase();
            const isInLoadout = loadoutWeapons.some((w) => weaponName.includes(w) || w.includes(weaponName));

            if (isInLoadout) {
                defaultWeapons.push(weapon);
            } else {
                optionalWeapons.push(weapon);
            }
        });

        defaultWeapons.sort((a, b) => {
            const aName = a.name.toLowerCase();
            const bName = b.name.toLowerCase();
            const aIndex = loadoutWeapons.findIndex((w) => aName.includes(w) || w.includes(aName));
            const bIndex = loadoutWeapons.findIndex((w) => bName.includes(w) || w.includes(bName));
            return aIndex - bIndex;
        });

        return { defaultWeapons, optionalWeapons, totalConstraint };
    }, [selectedItem, parseLoadoutWeapons, parseOptionConstraint, calculateTotalModels]);

    // Calculate how many optional weapons are currently selected
    const selectedOptionalCount = useMemo(() => {
        if (!selectedItem?.loadoutSelections) return 0;
        return Object.values(selectedItem.loadoutSelections).reduce((sum, count) => sum + count, 0);
    }, [selectedItem]);

    const toggleWeaponSelection = (weaponId: string) => {
        if (!selectedList || !selectedItem) return;

        const currentSelections = selectedItem.loadoutSelections || {};
        const currentCount = currentSelections[weaponId] || 0;
        const newCount = currentCount > 0 ? 0 : 1;

        if (newCount > 0 && selectedOptionalCount >= categorizedWargear.totalConstraint) {
            return;
        }

        updateListItem(selectedList, selectedItem.listItemId, {
            loadoutSelections: {
                ...currentSelections,
                [weaponId]: newCount,
            },
        });
    };

    if (!selectedList) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <p className=" mb-4">List not found</p>
                        <Link to="/lists">
                            <Button>Back to Lists</Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            {/* Back button */}
            <Link to="/lists" className="inline-flex items-center hover:shadow-glow-green">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Lists
            </Link>

            <header>
                <h1>{selectedList.name}</h1>
                <p>
                    {selectedList.factionName} | {selectedList.detachmentName}
                </p>
                {listTotalPoints > 0 && <Badge variant="outline">{listTotalPoints} pts</Badge>}
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
                {/* Left Column - List Details */}
                <div className="lg:col-span-3">
                    <Card className="p-4">
                        <CardContent className="px-0">
                            <div className="space-y-4">
                                {/* Add Datasheet */}
                                <div className="space-y-2">
                                    <Label>Add Unit</Label>
                                    <SearchableDropdown
                                        options={datasheetOptions}
                                        placeholder="Search for a unit to add..."
                                        searchPlaceholder="Search datasheets..."
                                        emptyMessage="No datasheet found."
                                        onSelect={handleAddDatasheet}
                                        renderOption={(datasheet) => (
                                            <div className="flex items-center justify-between w-full">
                                                <div>
                                                    <div className="font-medium">{datasheet.name}</div>
                                                    <div className="text-xs text-muted-foreground">{datasheet.roleLabel}</div>
                                                </div>
                                                {datasheet.isLegends && (
                                                    <Badge variant="outline" className="ml-2">
                                                        Legends
                                                    </Badge>
                                                )}
                                            </div>
                                        )}
                                    />
                                </div>

                                {/* List Items */}
                                <div>
                                    <Label>Units in List</Label>
                                    {selectedList.items.length === 0 ? (
                                        <p className="text-sm  text-center p-8 border border-dashed rounded-lg mt-2">No units added yet. Use the search above to add units.</p>
                                    ) : (
                                        <div className="space-y-2 mt-2">
                                            {orderedListItems.map((item, index) => {
                                                const isSelected = selectedItem?.listItemId === item.listItemId;
                                                const isLeader = !!item.leading;
                                                const isAttachedUnit = !!item.leadBy;
                                                const prevItem = orderedListItems[index - 1];
                                                const nextItem = orderedListItems[index + 1];
                                                const isGroupedWithPrev = isAttachedUnit && prevItem?.leading?.id === item.id && prevItem?.leading?.name === item.name;
                                                const isGroupedWithNext = isLeader && nextItem?.leadBy?.id === item.id && nextItem?.leadBy?.name === item.name;

                                                return <ListItem item={item} isSelected={isSelected} isLeader={isLeader} isAttachedUnit={isAttachedUnit} isGroupedWithPrev={isGroupedWithPrev} isGroupedWithNext={isGroupedWithNext} calculateItemPoints={calculateItemPoints} handleRemoveItem={handleRemoveItem} setSelectedItem={setSelectedItem} />;
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - Unit Details */}
                <div className="lg:col-span-7">
                    {selectedItem ? (
                        <Card>
                            <CardHeader className="space-y-2">
                                <CardTitle className="flex justify-between">
                                    <h3>{selectedItem.name}</h3>
                                    <Badge variant="outline" className="text-xs text-slate-500">
                                        {calculatedPoints ?? selectedItem.modelCosts?.[0]?.cost ?? 0} pts
                                    </Badge>
                                </CardTitle>
                                <CardDescription>
                                    {/* Keywords */}
                                    {selectedItem.keywords && selectedItem.keywords.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {selectedItem.keywords.map((keyword, idx) => (
                                                <Badge key={idx} variant={keyword.isFactionKeyword === "true" ? "default" : "secondary"}>
                                                    {keyword.keyword}
                                                </Badge>
                                            ))}
                                        </div>
                                    )}
                                </CardDescription>
                                <CardDescription>
                                    {selectedItem.legend && (
                                        <p
                                            className="text-sm text-slate-500 italic"
                                            dangerouslySetInnerHTML={{
                                                __html: selectedItem.legend,
                                            }}
                                        />
                                    )}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="space-y-6">
                                    {/* Unit Composition */}
                                    {selectedItem.unitComposition && selectedItem.unitComposition.length > 0 && (
                                        <div>
                                            <h3 className="font-semibold text-sm mb-2">Unit Composition</h3>
                                            <div className="space-y-3">
                                                {selectedItem.unitComposition.map((composition, idx) => {
                                                    const line = composition.line || idx + 1;
                                                    const min = composition.min ?? 0;
                                                    const max = composition.max ?? 999;
                                                    const currentCount = selectedItem.compositionCounts?.[line] ?? min;

                                                    return (
                                                        <div key={idx} className="border border-[#e6e6e6] rounded-lg p-3 bg-white">
                                                            <div className="flex items-center justify-between">
                                                                <div
                                                                    className="font-medium text-sm mb-1"
                                                                    dangerouslySetInnerHTML={{
                                                                        __html: composition.description,
                                                                    }}
                                                                />
                                                                <div className="ml-4">
                                                                    <Input
                                                                        type="number"
                                                                        min={min}
                                                                        max={max}
                                                                        value={currentCount}
                                                                        disabled={max === min}
                                                                        onChange={(e) => {
                                                                            const value = parseInt(e.target.value, 10);
                                                                            if (!isNaN(value)) {
                                                                                handleUpdateComposition(line, value, min, max);
                                                                            }
                                                                        }}
                                                                        className="w-20 text-center"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Models */}
                                    {selectedItem.models && selectedItem.models.length > 0 && (
                                        <div className="space-y-3">
                                            {selectedItem.models.map((model, idx) => (
                                                <div key={idx} className="border border-[#e6e6e6] rounded-lg p-3 bg-white">
                                                    <div className="font-medium text-sm mb-2">{model.name || "Model"}</div>
                                                    <div className="grid grid-cols-6 gap-2 text-xs">
                                                        <div>
                                                            <div className="font-semibold">M</div>
                                                            <div>{model.m}"</div>
                                                        </div>
                                                        <div>
                                                            <div className="font-semibold">T</div>
                                                            <div>{model.t}</div>
                                                        </div>
                                                        <div>
                                                            <div className="font-semibold">Sv</div>
                                                            <div>
                                                                {model.sv}
                                                                {typeof model.sv === "number" ? "+" : ""}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div className="font-semibold">W</div>
                                                            <div>{model.w}</div>
                                                        </div>
                                                        <div>
                                                            <div className="font-semibold">Ld</div>
                                                            <div>
                                                                {model.ld}
                                                                {typeof model.ld === "number" ? "+" : ""}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div className="font-semibold">OC</div>
                                                            <div>{model.oc}</div>
                                                        </div>
                                                    </div>
                                                    {model.invSv && (
                                                        <div className="mt-2 text-xs">
                                                            <span className="font-semibold">Invulnerable Save: </span>
                                                            <span>{model.invSv}+</span>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Loadout */}
                                    {selectedItem.loadout && (
                                        <div>
                                            <h3 className="font-semibold text-sm mb-2">Loadout</h3>
                                            <p
                                                className="text-sm"
                                                dangerouslySetInnerHTML={{
                                                    __html: selectedItem.loadout,
                                                }}
                                            />
                                        </div>
                                    )}

                                    {/* Default Wargear */}
                                    {categorizedWargear.defaultWeapons.length > 0 && (
                                        <div>
                                            <h3 className="font-semibold text-sm mb-2">Wargear</h3>
                                            <div className="space-y-2">
                                                {categorizedWargear.defaultWeapons.map((weapon, idx) => (
                                                    <div key={idx} className="border border-[#e6e6e6] rounded-lg p-3 bg-white">
                                                        <div className="font-medium text-sm mb-2">{weapon.name}</div>
                                                        {weapon.profiles && weapon.profiles.length > 0 && (
                                                            <div className="space-y-2">
                                                                {weapon.profiles.map((profile, pIdx) => (
                                                                    <div key={pIdx} className="text-xs">
                                                                        <div className="grid grid-cols-6 gap-2 mb-1 font-semibold">
                                                                            <div>Range</div>
                                                                            <div>A</div>
                                                                            <div>BS</div>
                                                                            <div>S</div>
                                                                            <div>AP</div>
                                                                            <div>D</div>
                                                                        </div>
                                                                        <div className="grid grid-cols-6 gap-2">
                                                                            <div>{profile.range > 0 ? `${profile.range}"` : "Melee"}</div>
                                                                            <div>{profile.a}</div>
                                                                            <div>
                                                                                {profile.bsWs}
                                                                                {profile.bsWs !== "N/A" ? "+" : ""}
                                                                            </div>
                                                                            <div>{profile.s}</div>
                                                                            <div>{profile.ap}</div>
                                                                            <div>{profile.d}</div>
                                                                        </div>
                                                                        {profile.attributes && profile.attributes.length > 0 && (
                                                                            <div className="mt-1 flex flex-wrap gap-1">
                                                                                {profile.attributes.map((attr, aIdx) => (
                                                                                    <Badge key={aIdx} variant="outline" className="text-xs">
                                                                                        {attr}
                                                                                    </Badge>
                                                                                ))}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Optional Wargear */}
                                    {categorizedWargear.optionalWeapons.length > 0 && (
                                        <div>
                                            <h3 className="font-semibold text-sm mb-2">
                                                Optional Wargear{" "}
                                                <span className="font-normal text-gray-500">
                                                    ({selectedOptionalCount}/{categorizedWargear.totalConstraint} selected)
                                                </span>
                                            </h3>
                                            <div className="space-y-2">
                                                {categorizedWargear.optionalWeapons.map((weapon, idx) => {
                                                    const isSelected = (selectedItem?.loadoutSelections?.[weapon.id] ?? 0) > 0;
                                                    const canSelect = isSelected || selectedOptionalCount < categorizedWargear.totalConstraint;

                                                    return (
                                                        <div
                                                            key={idx}
                                                            className={`border rounded-lg p-3 cursor-pointer transition-colors ${isSelected ? "border-green-500 bg-green-50" : canSelect ? "border-[#e6e6e6] bg-white hover:border-green-300" : "border-[#e6e6e6] bg-gray-50 opacity-60"}`}
                                                            onClick={() => {
                                                                if (canSelect) {
                                                                    toggleWeaponSelection(weapon.id);
                                                                }
                                                            }}
                                                        >
                                                            <div className="flex items-start justify-between mb-2">
                                                                <div className="font-medium text-sm">{weapon.name}</div>
                                                                <Button
                                                                    variant={isSelected ? "default" : "outline"}
                                                                    size="sm"
                                                                    disabled={!canSelect}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        if (canSelect) {
                                                                            toggleWeaponSelection(weapon.id);
                                                                        }
                                                                    }}
                                                                >
                                                                    {isSelected ? "Selected" : "Select"}
                                                                </Button>
                                                            </div>
                                                            {weapon.profiles && weapon.profiles.length > 0 && (
                                                                <div className="space-y-2">
                                                                    {weapon.profiles.map((profile, pIdx) => (
                                                                        <div key={pIdx} className="text-xs">
                                                                            <div className="grid grid-cols-6 gap-2 mb-1 font-semibold">
                                                                                <div>Range</div>
                                                                                <div>A</div>
                                                                                <div>BS</div>
                                                                                <div>S</div>
                                                                                <div>AP</div>
                                                                                <div>D</div>
                                                                            </div>
                                                                            <div className="grid grid-cols-6 gap-2">
                                                                                <div>{profile.range > 0 ? `${profile.range}"` : "Melee"}</div>
                                                                                <div>{profile.a}</div>
                                                                                <div>
                                                                                    {profile.bsWs}
                                                                                    {profile.bsWs !== "N/A" ? "+" : ""}
                                                                                </div>
                                                                                <div>{profile.s}</div>
                                                                                <div>{profile.ap}</div>
                                                                                <div>{profile.d}</div>
                                                                            </div>
                                                                            {profile.attributes && profile.attributes.length > 0 && (
                                                                                <div className="mt-1 flex flex-wrap gap-1">
                                                                                    {profile.attributes.map((attr, aIdx) => (
                                                                                        <Badge key={aIdx} variant="outline" className="text-xs">
                                                                                            {attr}
                                                                                        </Badge>
                                                                                    ))}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Weapon Options Reference */}
                                    {selectedItem.options && selectedItem.options.length > 0 && (
                                        <Collapsible defaultOpen={false}>
                                            <CollapsibleTrigger className="flex items-center gap-2 group">
                                                <ChevronDown className="h-4 w-4 text-gray-500 transition-transform group-data-[state=open]:rotate-180" />
                                                <h3 className="font-semibold text-sm text-gray-500">Weapon Options Reference</h3>
                                            </CollapsibleTrigger>
                                            <CollapsibleContent className="mt-2">
                                                <div className="space-y-2">
                                                    {selectedItem.options.map((option, idx) => (
                                                        <div key={option.line || idx} className="border border-[#e6e6e6] rounded-lg p-3 bg-gray-50">
                                                            <div
                                                                className="text-sm text-gray-600"
                                                                dangerouslySetInnerHTML={{
                                                                    __html: option.description,
                                                                }}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </CollapsibleContent>
                                        </Collapsible>
                                    )}

                                    {/* Transport */}
                                    {selectedItem.transport && (
                                        <div>
                                            <h3 className="font-semibold text-sm mb-2">Transport</h3>
                                            <p
                                                className="text-sm"
                                                dangerouslySetInnerHTML={{
                                                    __html: selectedItem.transport,
                                                }}
                                            />
                                        </div>
                                    )}

                                    {/* Can Lead */}
                                    {selectedItem.abilities?.some((ability) => ability.name === "Leader") && (
                                        <div>
                                            <h3 className="font-semibold text-sm mb-2">Can Lead</h3>
                                            {loadingBodyguards ? (
                                                <p className="text-sm ">Loading...</p>
                                            ) : bodyguardUnits.length > 0 ? (
                                                <div className="space-y-4">
                                                    {unitsInList.length > 0 && (
                                                        <div>
                                                            <h4 className="font-medium text-xs  mb-2">In Your List ({unitsInList.length})</h4>
                                                            <div className="space-y-2">
                                                                {unitsInList.map((listItem) => {
                                                                    const isAttached = selectedItem?.leading?.id === listItem.id && selectedItem?.leading?.name === listItem.name;
                                                                    return (
                                                                        <div key={listItem.listItemId} className={`border rounded-lg p-3 bg-white ${isAttached ? "border-green-500 bg-green-50" : "border-[#e6e6e6]"}`}>
                                                                            <div className="flex items-start justify-between">
                                                                                <div className="flex-1">
                                                                                    <div className="font-medium text-sm">{listItem.name}</div>
                                                                                    <div className="text-xs  mt-1">{listItem.roleLabel}</div>
                                                                                    {isAttached && <div className="text-xs text-green-600 mt-1 font-medium">Attached</div>}
                                                                                </div>
                                                                                <Button
                                                                                    variant={isAttached ? "outline" : "default"}
                                                                                    size="sm"
                                                                                    className="ml-2 h-8"
                                                                                    onClick={() => {
                                                                                        if (isAttached) {
                                                                                            handleDetachLeader();
                                                                                        } else {
                                                                                            handleAttachLeader(listItem.listItemId);
                                                                                        }
                                                                                    }}
                                                                                >
                                                                                    {isAttached ? "Detach" : "Attach"}
                                                                                </Button>
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {unitsNotInList.length > 0 && (
                                                        <Collapsible defaultOpen={false}>
                                                            <CollapsibleTrigger className="flex items-center justify-between w-full group">
                                                                <h4 className="font-medium text-xs ">Not in List ({unitsNotInList.length})</h4>
                                                                <ChevronDown className="h-4 w-4  transition-transform group-data-[state=open]:rotate-180" />
                                                            </CollapsibleTrigger>
                                                            <CollapsibleContent className="mt-2">
                                                                <div className="space-y-2">
                                                                    {unitsNotInList.map((unit) => (
                                                                        <div key={unit.id} className="border border-[#e6e6e6] rounded-lg p-3 bg-white">
                                                                            <div className="font-medium text-sm">{unit.name}</div>
                                                                            <div className="text-xs  mt-1">{unit.roleLabel}</div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </CollapsibleContent>
                                                        </Collapsible>
                                                    )}
                                                </div>
                                            ) : (
                                                <p className="text-sm ">This unit cannot lead any units.</p>
                                            )}
                                        </div>
                                    )}

                                    {/* Enhancements */}
                                    {detachmentEnhancements.length > 0 && (
                                        <div>
                                            <h3 className="font-semibold text-sm mb-2">Enhancement Options</h3>
                                            <div className="space-y-3">
                                                {detachmentEnhancements.map((enhancement, idx) => {
                                                    const isAttached = selectedItem?.enhancement?.id === enhancement.id;
                                                    const usedByLeader = usedEnhancements.get(enhancement.id);
                                                    const isUsedByOther = !!usedByLeader && !isAttached;
                                                    return (
                                                        <div key={enhancement.id || idx} className={`border rounded-lg p-3 ${isAttached ? "border-purple-500 bg-purple-50" : isUsedByOther ? "border-[#e6e6e6] bg-gray-50 opacity-60" : "border-[#e6e6e6] bg-white"}`}>
                                                            <div className="flex items-start justify-between mb-1">
                                                                <div className="flex-1">
                                                                    <div className="font-medium text-sm">{enhancement.name}</div>
                                                                    {isAttached && <div className="text-xs text-purple-600 mt-1 font-medium">Equipped</div>}
                                                                    {isUsedByOther && (
                                                                        <Badge variant="secondary" className="text-xs mt-1">
                                                                            Used by {usedByLeader}
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    {enhancement.cost && (
                                                                        <Badge variant="outline" className="text-xs">
                                                                            {enhancement.cost} pts
                                                                        </Badge>
                                                                    )}
                                                                    <Button
                                                                        variant={isAttached ? "outline" : "default"}
                                                                        size="sm"
                                                                        className="h-8"
                                                                        disabled={isUsedByOther}
                                                                        onClick={() => {
                                                                            handleAttachEnhancement({
                                                                                id: enhancement.id,
                                                                                name: enhancement.name,
                                                                                cost: enhancement.cost,
                                                                            });
                                                                        }}
                                                                    >
                                                                        {isAttached ? "Remove" : "Equip"}
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                            {enhancement.legend && (
                                                                <Collapsible defaultOpen={false}>
                                                                    <CollapsibleTrigger className="flex items-center gap-1 text-xs  italic group">
                                                                        <ChevronDown className="h-3 w-3 transition-transform group-data-[state=open]:rotate-180" />
                                                                        <span>Show lore</span>
                                                                    </CollapsibleTrigger>
                                                                    <CollapsibleContent>
                                                                        <p
                                                                            className="text-xs  italic mt-1 mb-2"
                                                                            dangerouslySetInnerHTML={{
                                                                                __html: enhancement.legend,
                                                                            }}
                                                                        />
                                                                    </CollapsibleContent>
                                                                </Collapsible>
                                                            )}
                                                            {enhancement.description && (
                                                                <div
                                                                    className="text-sm"
                                                                    dangerouslySetInnerHTML={{
                                                                        __html: enhancement.description,
                                                                    }}
                                                                />
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-6">
                                    {/* Abilities */}
                                    {selectedItem.abilities && selectedItem.abilities.filter((ability) => ability.name !== "Leader").length > 0 && (
                                        <div>
                                            <h3 className="font-semibold text-sm mb-2">Abilities</h3>
                                            <div className="space-y-3">
                                                {selectedItem.abilities
                                                    .filter((ability) => ability.name !== "Leader")
                                                    .map((ability, idx) => (
                                                        <div key={idx} className="border border-[#e6e6e6] rounded-lg p-3 bg-white">
                                                            <div className="flex items-start justify-between mb-1">
                                                                <div className="font-medium text-sm">{ability.name}</div>
                                                                {ability.type && (
                                                                    <Badge variant="outline" className="text-xs">
                                                                        {ability.type}
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            {ability.legend && (
                                                                <Collapsible defaultOpen={false}>
                                                                    <CollapsibleTrigger className="flex items-center gap-1 text-xs  italic group">
                                                                        <ChevronDown className="h-3 w-3 transition-transform group-data-[state=open]:rotate-180" />
                                                                        <span>Show lore</span>
                                                                    </CollapsibleTrigger>
                                                                    <CollapsibleContent>
                                                                        <p className="text-xs  italic mt-1 mb-2">{ability.legend}</p>
                                                                    </CollapsibleContent>
                                                                </Collapsible>
                                                            )}
                                                            {ability.description && (
                                                                <div
                                                                    className="text-sm"
                                                                    dangerouslySetInnerHTML={{
                                                                        __html: ability.description,
                                                                    }}
                                                                />
                                                            )}
                                                        </div>
                                                    ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card>
                            <CardContent className="flex items-center justify-center h-64">
                                <div className="text-center">
                                    <p className=" mb-2">Select a unit from the list to view details</p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ListView;
