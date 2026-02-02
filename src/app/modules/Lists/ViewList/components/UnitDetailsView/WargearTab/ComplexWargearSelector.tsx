import { useMemo, useCallback } from "react";
import { Shield } from "lucide-react";

import { ArmyList, ArmyListItem, ModelInstance } from "#types/Lists.tsx";
import { Weapon, WeaponProfile } from "#types/Weapons.tsx";

import { useListManager } from "#modules/Lists/ListManagerContext.tsx";

import WargearProfileCard from "./WargearProfileCard.tsx";

import styles from "./WargearProfileCard.module.css";
import SplitHeading from "#components/SplitHeading/SplitHeading.tsx";

// Precomputed loadout structure from datasheet
interface PrecomputedLoadout {
    label: string;
    weapons: {
        id: string;
        name: string;
        type: "Ranged" | "Melee";
    }[];
    isPackageDeal: boolean;
    wargearAbilities?: {
        name: string;
        abilityName: string;
    }[];
}

interface Props {
    unit: ArmyListItem;
    list: ArmyList;
    loadouts: PrecomputedLoadout[];
}

const ComplexWargearSelector = ({ unit, list, loadouts }: Props) => {
    const { updateModelLoadout } = useListManager();

    // Get the first model instance (complex loadouts typically apply to single-model units or the sergeant)
    const modelInstance = useMemo(() => {
        return unit.modelInstances?.[0] || null;
    }, [unit.modelInstances]);

    // Find which loadout is currently selected based on the model's weapon loadout
    const selectedLoadoutIndex = useMemo(() => {
        if (!modelInstance) return 0;

        const currentWeaponIds = new Set(modelInstance.loadout);

        // Find the loadout that matches the current weapons
        for (let i = 0; i < loadouts.length; i++) {
            const loadout = loadouts[i];
            const loadoutWeaponIds = new Set(loadout.weapons.map((w) => w.id));

            // Check if all loadout weapons are in current loadout and vice versa
            if (loadoutWeaponIds.size === currentWeaponIds.size) {
                let matches = true;
                for (const id of loadoutWeaponIds) {
                    if (!currentWeaponIds.has(id)) {
                        matches = false;
                        break;
                    }
                }
                if (matches) return i;
            }
        }

        // No exact match found - default to first loadout
        return 0;
    }, [modelInstance, loadouts]);

    // Handle loadout selection
    const handleLoadoutSelect = useCallback(
        (loadoutIndex: number) => {
            if (!modelInstance) return;

            const loadout = loadouts[loadoutIndex];
            const newWeaponIds = loadout.weapons.map((w) => w.id);

            updateModelLoadout(list, unit.listItemId, modelInstance.instanceId, newWeaponIds);
        },
        [list, unit.listItemId, modelInstance, loadouts, updateModelLoadout]
    );

    // Get weapon from available wargear by ID
    const getWeaponById = useCallback(
        (weaponId: string): Weapon | undefined => {
            return unit.availableWargear?.find((w) => w.id === weaponId);
        },
        [unit.availableWargear]
    );

    // Render a single loadout option
    const renderLoadoutOption = (loadout: PrecomputedLoadout, index: number) => {
        const isSelected = index === selectedLoadoutIndex;
        const rangedWeapons = loadout.weapons.filter((w) => w.type === "Ranged");
        const meleeWeapons = loadout.weapons.filter((w) => w.type === "Melee");

        return (
            <div key={loadout.label} onClick={() => handleLoadoutSelect(index)} className={`rounded-lg border-2 p-4 cursor-pointer transition-all ${isSelected ? "border-fireDragonBright bg-fireDragonBright/10 shadow-glow-orange" : "border-fireDragonBright/30 hover:border-fireDragonBright/60"}`}>
                {/* Loadout label */}
                <div className="flex items-center justify-between mb-3">
                    <h4 className={`text-metadata-l font-medium ${isSelected ? "text-fireDragonBright" : "text-fireDragonBright/80"}`}>{loadout.label}</h4>
                    {loadout.isPackageDeal && <span className="text-body-xs text-fireDragonBright/50 italic">Package Deal</span>}
                </div>

                {/* Weapon cards */}
                <div className="space-y-2">
                    {/* Ranged weapons */}
                    {rangedWeapons.map((weaponRef) => {
                        const weapon = getWeaponById(weaponRef.id);
                        if (!weapon?.profiles) return null;

                        return (
                            <div key={weaponRef.id} className={styles.WargearProfileCardSwapItemWrapper}>
                                {weapon.profiles.map((profile: WeaponProfile) => (
                                    <WargearProfileCard key={profile.name} profile={profile} isSelected={isSelected} isDisabled={false} isStacked={weapon.profiles.length > 1} />
                                ))}
                            </div>
                        );
                    })}

                    {/* Melee weapons */}
                    {meleeWeapons.map((weaponRef) => {
                        const weapon = getWeaponById(weaponRef.id);
                        if (!weapon?.profiles) return null;

                        return (
                            <div key={weaponRef.id} className={styles.WargearProfileCardSwapItemWrapper}>
                                {weapon.profiles.map((profile: WeaponProfile) => (
                                    <WargearProfileCard key={profile.name} profile={profile} isSelected={isSelected} isDisabled={false} isStacked={weapon.profiles.length > 1} />
                                ))}
                            </div>
                        );
                    })}

                    {/* Wargear abilities (e.g., Storm Shield) */}
                    {loadout.wargearAbilities?.map((ability) => (
                        <div key={ability.name} className={`rounded p-3 border transition-colors ${isSelected ? "border-fireDragonBright bg-fireDragonBright/5" : "border-fireDragonBright/30"}`}>
                            <div className="flex items-center gap-2">
                                <Shield className={`w-4 h-4 ${isSelected ? "text-fireDragonBright" : "text-fireDragonBright/60"}`} />
                                <span className={`text-metadata-l ${isSelected ? "text-fireDragonBright" : "text-fireDragonBright/80"}`}>{ability.abilityName}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    if (!modelInstance) {
        return <div className="p-6 text-fireDragonBright/60">No model instance found</div>;
    }

    return (
        <div className="grid grid-cols-3 p-6 gap-4">
            <div className="col-span-2 space-y-4">
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                        <span className="text-metadata-l font-medium text-fireDragonBright">{unit.modelInstances?.[0]?.modelType || "Model"}</span>
                        <span className="text-fireDragonBright/60 text-body-s">#1</span>
                    </div>

                    <div className="grid grid-cols-6 gap-1 text-center w-[300px] mr-3">
                        <span className="text-profile-attribute">Range</span>
                        <span className="text-profile-attribute">A</span>
                        <span className="text-profile-attribute">BS/WS</span>
                        <span className="text-profile-attribute">S</span>
                        <span className="text-profile-attribute">AP</span>
                        <span className="text-profile-attribute">D</span>
                    </div>
                </div>

                {/* Loadout options */}
                <div className="space-y-3">{loadouts.map((loadout, index) => renderLoadoutOption(loadout, index))}</div>
            </div>
            <div className="space-y-6 pt-7">
                <SplitHeading label="Wargear rules" />
                {unit.options?.map((o, idx) => (
                    <div key={idx} dangerouslySetInnerHTML={{ __html: o.description }} />
                ))}
            </div>
        </div>
    );
};

export default ComplexWargearSelector;
