import { useEffect, useMemo, useState } from "react";
import { ArmyList, ArmyListItem } from "#types/Lists.tsx";
import { Datasheet } from "#types/Units.tsx";
import { loadDatasheetData } from "../../../../utils/depotDataLoader";

interface UseLeadableUnitsResult {
    bodyguardUnits: Datasheet[];
    unitsInList: ArmyListItem[];
    unitsNotInList: Datasheet[];
    loading: boolean;
}

export function useLeadableUnits(list: ArmyList | null, unit: ArmyListItem | null): UseLeadableUnitsResult {
    const [bodyguardUnits, setBodyguardUnits] = useState<Datasheet[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadBodyguardUnits = async () => {
            if (!unit || !list) {
                setBodyguardUnits([]);
                return;
            }

            if (!unit.leadsUnits?.length) {
                setBodyguardUnits([]);
                return;
            }

            setLoading(true);
            const bodyguards: Datasheet[] = [];

            for (const datasheetRef of unit.leadsUnits) {
                try {
                    const fullDatasheet = await loadDatasheetData(list.factionSlug, datasheetRef.id);
                    if (fullDatasheet) {
                        bodyguards.push(fullDatasheet);
                    }
                } catch (error) {
                    console.error(`Error loading datasheet ${datasheetRef.id}:`, error);
                }
            }

            setBodyguardUnits(bodyguards);
            setLoading(false);
        };

        loadBodyguardUnits();
    }, [unit, list]);

    const { unitsInList, unitsNotInList } = useMemo(() => {
        if (!list || bodyguardUnits.length === 0) {
            return { unitsInList: [], unitsNotInList: [] };
        }

        const leadableDatasheetIds = new Set(bodyguardUnits.map((bg) => bg.id));
        const inList: ArmyListItem[] = list.items.filter((item) => leadableDatasheetIds.has(item.id));
        const listUnitIds = new Set(list.items.map((item) => item.id));
        const notInList: Datasheet[] = bodyguardUnits.filter((bg) => !listUnitIds.has(bg.id));

        return { unitsInList: inList, unitsNotInList: notInList };
    }, [bodyguardUnits, list]);

    return {
        bodyguardUnits,
        unitsInList,
        unitsNotInList,
        loading,
    };
}
