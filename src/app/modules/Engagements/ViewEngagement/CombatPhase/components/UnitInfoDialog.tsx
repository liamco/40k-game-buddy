import { useMemo, Fragment } from "react";

import type { EngagementForceItem, EngagementWargear } from "#types/Engagements";
import type { WeaponProfile } from "#types/index";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "#components/Dialog/Dialog.tsx";
import { Badge } from "#components/Badge/Badge.tsx";
import ModelProfileCard from "#components/ModelProfileCard/ModelProfileCard.tsx";
import WeaponProfileCard from "#components/WeaponProfileCard/WeaponProfileCard.tsx";
import SplitHeading from "#components/SplitHeading/SplitHeading.tsx";

import { groupWargearBySource } from "../utils/combatUtils";

interface UnitInfoDialogProps {
    unit: EngagementForceItem;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function UnitInfoDialog({ unit, open, onOpenChange }: UnitInfoDialogProps) {
    const rangedWeapons = useMemo(() => unit.wargear.filter((w) => w.type === "Ranged"), [unit.wargear]);
    const meleeWeapons = useMemo(() => unit.wargear.filter((w) => w.type === "Melee"), [unit.wargear]);

    const groupedRanged = useMemo(() => {
        const groups = groupWargearBySource(rangedWeapons);
        const sourceNames = Object.keys(groups);
        return { groups, sourceNames, isCombined: sourceNames.length > 1 };
    }, [rangedWeapons]);

    const groupedMelee = useMemo(() => {
        const groups = groupWargearBySource(meleeWeapons);
        const sourceNames = Object.keys(groups);
        return { groups, sourceNames, isCombined: sourceNames.length > 1 };
    }, [meleeWeapons]);

    // Faction/Wargear abilities (not Core or Datasheet — those are shown differently)
    const factionAndArmyAbilities = useMemo(() => {
        if (!unit.abilities) return [];
        return unit.abilities.filter((a) => a.type !== "Core" && a.type !== "Datasheet");
    }, [unit.abilities]);

    // Unit-unique abilities (Datasheet type) — shown on model cards as badges but we show full descriptions here
    const datasheetAbilities = useMemo(() => {
        if (!unit.abilities) return [];
        return unit.abilities.filter((a) => a.type === "Datasheet" && a.name.toUpperCase() !== "LEADER");
    }, [unit.abilities]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="text-title-m">{unit.name}</DialogTitle>
                    <DialogDescription className="sr-only">Unit details for {unit.name}</DialogDescription>
                </DialogHeader>

                {unit.keywords && unit.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {unit.keywords.map((keyword, idx) => (
                            <Badge key={idx} variant={keyword.isFactionKeyword === "true" ? "default" : "outline"}>
                                {keyword.keyword}
                            </Badge>
                        ))}
                    </div>
                )}

                {unit.legend && <p className="italic text-sm" dangerouslySetInnerHTML={{ __html: unit.legend }} />}

                {/* Model profiles */}
                {unit.models && unit.models.length > 0 && (
                    <div className="space-y-3">
                        <SplitHeading label="Model profiles" labelClassName="text-blockcaps-xs" />
                        {unit.models.map((model, idx) => (
                            <ModelProfileCard key={idx} model={model} abilities={unit.abilities} wargearAbilities={unit.resolvedWargearAbilities} />
                        ))}
                    </div>
                )}

                {/* Ranged weapons */}
                {rangedWeapons.length > 0 && (
                    <div className="space-y-3">
                        <SplitHeading label="Ranged weapons" labelClassName="text-blockcaps-xs" />
                        {groupedRanged.isCombined ? (
                            <div className="space-y-4">
                                {groupedRanged.sourceNames.map((source) => (
                                    <div key={source} className="space-y-2">
                                        <span className="inline-block text-blockcaps-s opacity-75">{source}</span>
                                        {groupedRanged.groups[source].map((weapon: EngagementWargear) => (
                                            <Fragment key={weapon.id}>
                                                {weapon.profiles.map((profile: WeaponProfile) => (
                                                    <WeaponProfileCard key={`${weapon.id}-${profile.line}`} profile={profile} weaponCount={weapon.count} />
                                                ))}
                                            </Fragment>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {rangedWeapons.map((weapon) => (
                                    <Fragment key={weapon.id}>
                                        {weapon.profiles.map((profile: WeaponProfile) => (
                                            <WeaponProfileCard key={`${weapon.id}-${profile.line}`} profile={profile} weaponCount={weapon.count} />
                                        ))}
                                    </Fragment>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Melee weapons */}
                {meleeWeapons.length > 0 && (
                    <div className="space-y-3">
                        <SplitHeading label="Melee weapons" labelClassName="text-blockcaps-xs" />
                        {groupedMelee.isCombined ? (
                            <div className="space-y-4">
                                {groupedMelee.sourceNames.map((source) => (
                                    <div key={source} className="space-y-2">
                                        <span className="inline-block text-blockcaps-s opacity-75">{source}</span>
                                        {groupedMelee.groups[source].map((weapon: EngagementWargear) => (
                                            <Fragment key={weapon.id}>
                                                {weapon.profiles.map((profile: WeaponProfile) => (
                                                    <WeaponProfileCard key={`${weapon.id}-${profile.line}`} profile={profile} weaponCount={weapon.count} />
                                                ))}
                                            </Fragment>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {meleeWeapons.map((weapon) => (
                                    <Fragment key={weapon.id}>
                                        {weapon.profiles.map((profile: WeaponProfile) => (
                                            <WeaponProfileCard key={`${weapon.id}-${profile.line}`} profile={profile} weaponCount={weapon.count} />
                                        ))}
                                    </Fragment>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Faction & army abilities */}
                {factionAndArmyAbilities.length > 0 && (
                    <div className="space-y-3">
                        <SplitHeading label="Abilities" labelClassName="text-blockcaps-xs" />
                        <div className="space-y-2">
                            {factionAndArmyAbilities.map((ability) => (
                                <div key={ability.name} className="border border-skarsnikGreen/30 rounded p-3 space-y-1">
                                    <p className="text-blockcaps-s text-fireDragonBright">
                                        {ability.name}
                                        {ability.sourceUnitName && <span className="opacity-60 ml-2">({ability.sourceUnitName})</span>}
                                    </p>
                                    {ability.description && <p className="text-sm opacity-80" dangerouslySetInnerHTML={{ __html: ability.description }} />}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Unit-unique abilities (Datasheet) with full descriptions */}
                {datasheetAbilities.length > 0 && (
                    <div className="space-y-3">
                        <SplitHeading label="Unit abilities" labelClassName="text-blockcaps-xs" />
                        <div className="space-y-2">
                            {datasheetAbilities.map((ability) => (
                                <div key={ability.name} className="border border-fireDragonBright/30 rounded p-3 space-y-1">
                                    <p className="text-blockcaps-s text-fireDragonBright">
                                        {ability.name}
                                        {ability.parameter && <span className="ml-1">{/^\d+$/.test(ability.parameter) ? `${ability.parameter}+` : ability.parameter}</span>}
                                        {ability.sourceUnitName && <span className="opacity-60 ml-2">({ability.sourceUnitName})</span>}
                                    </p>
                                    {ability.description && <p className="text-sm opacity-80" dangerouslySetInnerHTML={{ __html: ability.description }} />}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

export default UnitInfoDialog;
