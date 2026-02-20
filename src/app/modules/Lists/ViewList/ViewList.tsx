import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { ArrowLeft } from "lucide-react";

import { Datasheet } from "#types/Units.tsx";
import { ArmyListItem } from "#types/Lists.tsx";

import { useListManager } from "../ListManagerContext";
import { getUnitById } from "#utils/unitHelpers";
import EmptyState from "#components/EmptyState/EmptyState.tsx";
import IconList from "#components/icons/IconList.tsx";
import { Badge } from "#components/Badge/Badge.tsx";
import Dropdown, { DropdownOption } from "#components/Dropdown/Dropdown.tsx";
import UnitListItem from "./components/UnitListItem/UnitListItem";
import UnitDetailsView from "./components/UnitDetailsView/UnitDetailsView";
import SplitHeading from "#components/SplitHeading/SplitHeading.tsx";

const ROLE_ORDER: { key: string; label: string }[] = [
    { key: "Characters", label: "Characters" },
    { key: "Battleline", label: "Battleline" },
    { key: "Dedicated Transports", label: "Transports" },
    { key: "Other", label: "Other" },
];

const getRoleKey = (role: string | undefined): string => {
    if (role && ROLE_ORDER.some((r) => r.key === role)) return role;
    return "Other";
};

const ViewList = () => {
    const { addDatasheetToList, calculateItemPoints, factionData, getListById, lists, listsLoaded, loadFactionDataBySlug, removeItemFromList } = useListManager();

    const { listId } = useParams<{ listId: string }>();

    const selectedList = useMemo(() => (listId ? getListById(listId) : undefined), [listId, getListById, lists]);

    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

    // Derive selectedItem from the current list data to keep it in sync with updates
    const selectedItem = useMemo(() => {
        if (!selectedList) return null;
        return getUnitById(selectedList.items, selectedItemId) || null;
    }, [selectedItemId, selectedList]);

    // Load faction data when the selected list changes
    useEffect(() => {
        if (selectedList?.factionSlug) {
            loadFactionDataBySlug(selectedList.factionSlug);
        }
    }, [selectedList?.factionSlug, loadFactionDataBySlug]);

    const selectedDetachment = useMemo(() => {
        if (!selectedList?.detachmentSlug || !factionData?.detachments) return null;
        return factionData.detachments.find((d) => d.slug === selectedList.detachmentSlug) || null;
    }, [selectedList?.detachmentSlug, factionData?.detachments]);

    // Derive the effective supplement from units already in the list
    // This locks the list to one supplement once a supplement-specific unit is added
    const effectiveSupplement = useMemo(() => {
        if (!selectedList?.items) return null;

        const supplementUnit = selectedList.items.find((item) => item.supplement?.slug && item.supplement.slug !== "codex");
        return supplementUnit?.supplement?.slug || null;
    }, [selectedList?.items]);

    // Helper to format supplement slug to display name
    const formatSupplementName = (slug: string): string => {
        return slug
            .split("-")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    };

    const datasheetOptions = useMemo((): DropdownOption<Datasheet>[] => {
        if (!factionData?.datasheets) return [];

        const detachmentSupplement = selectedDetachment?.supplementSlug;

        return factionData.datasheets.map((datasheet: Datasheet) => {
            const datasheetSupplement = datasheet.supplement?.slug;
            let disabled = false;
            let disabledReason = "";

            // Codex/generic units always allowed
            if (!datasheetSupplement || datasheetSupplement === "codex") {
                disabled = false;
            }
            // If detachment is chapter-locked, must match
            else if (detachmentSupplement) {
                disabled = datasheetSupplement !== detachmentSupplement;
                if (disabled) {
                    disabledReason = `Requires ${formatSupplementName(detachmentSupplement)} detachment`;
                }
            }
            // Generic detachment with effective supplement set
            else if (effectiveSupplement) {
                disabled = datasheetSupplement !== effectiveSupplement;
                if (disabled) {
                    disabledReason = `List contains ${formatSupplementName(effectiveSupplement)} units`;
                }
            }
            // Generic detachment, no supplement units yet - all allowed

            return {
                id: datasheet.id,
                label: `${datasheet.name} ${datasheet.roleLabel}`,
                data: datasheet,
                disabled,
                disabledReason,
            };
        });
    }, [factionData, selectedDetachment, effectiveSupplement]);

    const groupedListItems = useMemo((): { role: string; items: ArmyListItem[] }[] => {
        if (!selectedList) return [];
        const items = [...selectedList.items];
        const processed = new Set<string>();
        const groups: { sortKey: string; role: string; items: ArmyListItem[] }[] = [];

        // First pass: Create groups for bodyguard units with their leaders
        items.forEach((item) => {
            if (processed.has(item.listItemId)) return;

            // Check if this unit has leaders attached (leadBy array)
            if (item.leadBy && item.leadBy.length > 0) {
                // Find all leaders for this unit
                const leaders = item.leadBy.map((ref) => items.find((l) => l.id === ref.id && l.name === ref.name)).filter((l): l is ArmyListItem => l !== undefined && !processed.has(l.listItemId));

                // Sort leaders alphabetically
                leaders.sort((a, b) => a.name.localeCompare(b.name));

                // The sort key for this group is the first leader's name (alphabetically)
                const sortKey = leaders.length > 0 ? leaders[0].name : item.name;

                // Mark all as processed
                leaders.forEach((leader) => processed.add(leader.listItemId));
                processed.add(item.listItemId);

                // Role is based on the bodyguard (primary unit)
                groups.push({
                    sortKey,
                    role: getRoleKey(item.role),
                    items: [...leaders, item],
                });
            }
        });

        // Second pass: Add standalone leaders (attached but bodyguard not in list)
        items.forEach((item) => {
            if (processed.has(item.listItemId)) return;

            if (item.leading) {
                groups.push({
                    sortKey: item.name,
                    role: getRoleKey(item.role),
                    items: [item],
                });
                processed.add(item.listItemId);
            }
        });

        // Third pass: Add remaining unattached units
        items.forEach((item) => {
            if (!processed.has(item.listItemId)) {
                groups.push({
                    sortKey: item.name,
                    role: getRoleKey(item.role),
                    items: [item],
                });
                processed.add(item.listItemId);
            }
        });

        // Bucket groups by role, then sort within each bucket
        const warlordItemId = selectedList.warlordItemId;
        return ROLE_ORDER.map(({ key, label }) => {
            const bucket = groups.filter((g) => g.role === key);

            // Sort alphabetically, but warlord group first in Characters
            bucket.sort((a, b) => {
                if (key === "Characters" && warlordItemId) {
                    const aHasWarlord = a.items.some((i) => i.listItemId === warlordItemId);
                    const bHasWarlord = b.items.some((i) => i.listItemId === warlordItemId);
                    if (aHasWarlord && !bHasWarlord) return -1;
                    if (!aHasWarlord && bHasWarlord) return 1;
                }
                return a.sortKey.localeCompare(b.sortKey);
            });

            return { role: label, items: bucket.flatMap((g) => g.items) };
        }).filter((section) => section.items.length > 0);
    }, [selectedList]);

    // Show loading state while data is being fetched
    if (!listsLoaded) {
        return (
            <div className="w-full h-full flex items-center justify-center border-1 border-skarsnikGreen">
                <p>Loading...</p>
            </div>
        );
    }

    // Show not found state if list doesn't exist
    if (!selectedList) {
        return (
            <div className="w-full h-full flex items-center justify-center border-1 border-skarsnikGreen">
                <EmptyState leadingIcon={<IconList />} label="List not found or redacted" />
            </div>
        );
    }

    // Show loading state while faction data is being fetched
    if (!factionData) {
        return (
            <div className="w-full h-full flex items-center justify-center border-1 border-skarsnikGreen">
                <p>Loading faction data...</p>
            </div>
        );
    }

    const handleAddDatasheet = async (datasheet: Datasheet) => {
        await addDatasheetToList(selectedList, datasheet);
    };

    const handleRemoveItem = (itemId: string) => {
        removeItemFromList(selectedList, itemId);
        if (selectedItemId === itemId) {
            setSelectedItemId(null);
        }
    };

    return (
        <main className="w-full h-full grid grid-cols-[1fr_3fr] gap-6">
            <aside className="grid grid-rows-[auto_auto_auto_auto_1fr] gap-6 h-[calc(100vh-108px)] overflow-auto">
                <Link to="/lists" className="inline-flex items-center">
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    <span className="text-blockcaps-m">Back to Lists</span>
                </Link>
                <div className="space-y-2 relative">
                    <div className="flex justify-between items-start">
                        <h1 className="text-title-m text-center">{selectedList.name}</h1>
                        {selectedList.totalPointsCost > 0 && <Badge variant="outline">{selectedList.totalPointsCost} pts</Badge>}
                    </div>
                    <div className="flex justify-between items-start">
                        <span>{selectedList.factionName}</span>
                        <span>{selectedList.detachmentName}</span>
                    </div>
                    <div className="flex items-center gap-2">{effectiveSupplement && !selectedDetachment?.supplementSlug && <Badge variant="outline">{formatSupplementName(effectiveSupplement)} units</Badge>}</div>
                </div>
                <SplitHeading label="units in roster" />
                <Dropdown
                    searchable
                    options={datasheetOptions}
                    placeholder="Add a unit..."
                    searchPlaceholder="Search datasheets..."
                    emptyMessage="No datasheet found."
                    onSelect={handleAddDatasheet}
                    renderOption={(datasheet: Datasheet) => (
                        <div className="flex items-center justify-between w-full">
                            <div className="font-medium">{datasheet.name}</div>
                            <div className="flex items-center gap-1">
                                {datasheet.supplement?.isSupplement && (
                                    <Badge variant="outline" className="text-xs">
                                        {datasheet.supplement.label}
                                    </Badge>
                                )}
                                {datasheet.isLegends && <Badge variant="outline">Legends</Badge>}
                            </div>
                        </div>
                    )}
                />
                <div className="space-y-2">
                    {groupedListItems.map((section) => (
                        <div key={section.role} className="space-y-2">
                            <SplitHeading label={section.role} />
                            {section.items.map((item, index) => {
                                const isSelected = selectedItem?.listItemId === item.listItemId;
                                const isLeader = !!item.leading;
                                const isAttachedUnit = !!(item.leadBy && item.leadBy.length > 0);
                                const leaderCount = item.leadBy?.length || 0;
                                const prevItem = section.items[index - 1];
                                const nextItem = section.items[index + 1];

                                const isGroupedWithPrev = !!((isAttachedUnit && prevItem?.leading?.id === item.id && prevItem?.leading?.name === item.name) || (isLeader && prevItem?.leading?.id === item.leading?.id && prevItem?.leading?.name === item.leading?.name));

                                const isGroupedWithNext = !!(
                                    (isLeader && nextItem?.leading?.id === item.leading?.id && nextItem?.leading?.name === item.leading?.name) ||
                                    (isLeader && nextItem?.leadBy?.some((l) => l.id === item.id && l.name === item.name))
                                );

                                const isWarlord = selectedList.warlordItemId === item.listItemId;

                                return (
                                    <UnitListItem
                                        key={item.listItemId}
                                        item={item}
                                        isSelected={isSelected}
                                        isLeader={isLeader}
                                        isWarlord={isWarlord}
                                        isAttachedUnit={isAttachedUnit}
                                        isGroupedWithPrev={isGroupedWithPrev}
                                        isGroupedWithNext={isGroupedWithNext}
                                        leaderCount={leaderCount}
                                        calculateItemPoints={calculateItemPoints}
                                        handleRemoveItem={handleRemoveItem}
                                        setSelectedItem={(item) => setSelectedItemId(item.listItemId)}
                                    />
                                );
                            })}
                        </div>
                    ))}
                </div>
            </aside>
            {selectedItem ? (
                <UnitDetailsView unit={selectedItem} list={selectedList} />
            ) : (
                <div className="p-6">
                    <EmptyState leadingIcon={<IconList />} label="Select a unit from the list" />
                </div>
            )}
        </main>
    );
};

export default ViewList;
