import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { ArrowLeft } from "lucide-react";

import { Datasheet } from "#types/Units.tsx";
import { ArmyListItem } from "#types/Lists.tsx";

import { useListManager } from "../ListManagerContext";
import EmptyState from "#components/EmptyState/EmptyState.tsx";
import IconList from "#components/icons/IconList.tsx";
import { Badge } from "#components/Badge/Badge.tsx";
import Dropdown, { DropdownOption } from "#components/Dropdown/Dropdown.tsx";
import UnitListItem from "./components/UnitListItem/UnitListItem";
import UnitDetailsView from "./components/UnitDetailsView/UnitDetailsView";
import SplitHeading from "#components/SplitHeading/SplitHeading.tsx";

const ViewList = () => {
    const { addDatasheetToList, calculateItemPoints, factionData, getListById, lists, listsLoaded, loadFactionDataBySlug, removeItemFromList } = useListManager();

    const { listId } = useParams<{ listId: string }>();

    const selectedList = useMemo(() => (listId ? getListById(listId) : undefined), [listId, getListById, lists]);

    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

    // Derive selectedItem from the current list data to keep it in sync with updates
    const selectedItem = useMemo(() => {
        if (!selectedItemId || !selectedList) return null;
        return selectedList.items.find((item) => item.listItemId === selectedItemId) || null;
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

    const datasheetOptions = useMemo((): DropdownOption<Datasheet>[] => {
        if (!factionData?.datasheets) return [];

        const detachmentSupplement = selectedDetachment?.supplementSlug;

        const filteredDatasheets = factionData.datasheets.filter((datasheet: Datasheet) => {
            const datasheetSupplement = datasheet.supplementSlug;

            // detachment supp == codex should allow anything

            // if there's no datasheet supplement, or if it is codex, return true
            if (!datasheetSupplement || datasheetSupplement === "codex") {
                return true;
            }
            // if there's a datasheet supplement, and it matches the detachment supplement, return true
            if (detachmentSupplement) {
                return datasheetSupplement === detachmentSupplement;
            }

            return false;
        });

        return filteredDatasheets.map((datasheet: Datasheet) => ({
            id: datasheet.id,
            label: `${datasheet.name} ${datasheet.roleLabel}`,
            data: datasheet,
        }));
    }, [factionData, selectedDetachment]);

    const orderedListItems = useMemo(() => {
        if (!selectedList) return [];
        const items = [...selectedList.items];
        const processed = new Set<string>();
        const groups: { sortKey: string; items: ArmyListItem[] }[] = [];

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

                // Add group with leaders first, then bodyguard unit
                groups.push({
                    sortKey,
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
                    items: [item],
                });
                processed.add(item.listItemId);
            }
        });

        // Sort groups alphabetically by sortKey
        groups.sort((a, b) => a.sortKey.localeCompare(b.sortKey));

        // Flatten groups into final ordered list
        return groups.flatMap((group) => group.items);
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
            <aside className="grid grid-rows-[auto_auto_auto_auto_1fr] gap-6 h-[calc(100vh-54px)] overflow-auto">
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
                            {datasheet.isLegends && (
                                <Badge variant="outline" className="ml-2">
                                    Legends
                                </Badge>
                            )}
                        </div>
                    )}
                />
                <div className="space-y-2">
                    {orderedListItems.map((item, index) => {
                        const isSelected = selectedItem?.listItemId === item.listItemId;
                        const isLeader = !!item.leading;
                        const isAttachedUnit = !!(item.leadBy && item.leadBy.length > 0);
                        const leaderCount = item.leadBy?.length || 0;
                        const prevItem = orderedListItems[index - 1];
                        const nextItem = orderedListItems[index + 1];

                        const isGroupedWithPrev = !!((isAttachedUnit && prevItem?.leading?.id === item.id && prevItem?.leading?.name === item.name) || (isLeader && prevItem?.leading?.id === item.leading?.id && prevItem?.leading?.name === item.leading?.name));

                        // Check if next item is grouped with this item
                        const isGroupedWithNext = !!(
                            // This is a leader and next is also a leader attached to the same target
                            (
                                (isLeader && nextItem?.leading?.id === item.leading?.id && nextItem?.leading?.name === item.leading?.name) ||
                                // This is a leader and next is the bodyguard unit we're attached to
                                (isLeader && nextItem?.leadBy?.some((l) => l.id === item.id && l.name === item.name))
                            )
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
