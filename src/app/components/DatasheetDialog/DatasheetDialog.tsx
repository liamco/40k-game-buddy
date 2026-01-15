import React from "react";
import { Info } from "lucide-react";

import type { Datasheet, ArmyListItem } from "../../types";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../_ui/dialog";
import { Badge } from "../_ui/badge";
import { Button } from "../_ui/button";
import { ScrollArea } from "../_ui/scroll-area";

import ModelProfileCard from "../ModelProfileCard/ModelProfileCard";
import WeaponProfileCard from "../WeaponProfileCard/WeaponProfileCard";
import SplitHeading from "../SplitHeading/SplitHeading";

interface DatasheetDialogProps {
    unit: Datasheet | ArmyListItem;
    trigger?: React.ReactNode;
}

export function DatasheetDialog({ unit, trigger }: DatasheetDialogProps) {
    // Separate weapons by type
    const rangedWeapons = unit.wargear?.filter((weapon) => weapon.type === "Ranged") || [];
    const meleeWeapons = unit.wargear?.filter((weapon) => weapon.type === "Melee") || [];

    return (
        <Dialog>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                        <Info className="h-4 w-4" />
                        <span className="sr-only">View datasheet</span>
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0" theme="skarsnikGreen">
                <DialogHeader className="p-6 pb-0 space-y-2">
                    <div className="flex items-start justify-between gap-4 pr-8">
                        <DialogTitle className="text-xl">{unit.name}</DialogTitle>
                        {unit.modelCosts && unit.modelCosts.length > 0 && <Badge variant="outline">{unit.modelCosts[0].cost} pts</Badge>}
                    </div>

                    {/* Keywords */}
                    {unit.keywords && unit.keywords.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                            {unit.keywords.map((keyword, idx) => (
                                <Badge key={idx} variant={keyword.isFactionKeyword === "true" ? "default" : "secondary"} className="text-xs">
                                    {keyword.keyword}
                                </Badge>
                            ))}
                        </div>
                    )}

                    {unit.legend && (
                        <p
                            className="text-sm italic text-muted-foreground"
                            dangerouslySetInnerHTML={{
                                __html: unit.legend,
                            }}
                        />
                    )}
                </DialogHeader>

                <ScrollArea className="max-h-[calc(90vh-180px)]">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 pt-4">
                        {/* Left Column */}
                        <div className="space-y-6">
                            {/* Models */}
                            {unit.models && unit.models.length > 0 && (
                                <div className="space-y-3">
                                    <SplitHeading label="Model Profiles" />
                                    {unit.models.map((model, idx) => (
                                        <ModelProfileCard key={idx} model={model} />
                                    ))}
                                </div>
                            )}

                            {/* Ranged Weapons */}
                            {rangedWeapons.length > 0 && (
                                <div className="space-y-3">
                                    <SplitHeading label="Ranged Weapons" />
                                    {rangedWeapons.map((weapon) => weapon.profiles?.map((profile, pIdx) => <WeaponProfileCard key={`${weapon.id}-${pIdx}`} profile={profile} />))}
                                </div>
                            )}

                            {/* Melee Weapons */}
                            {meleeWeapons.length > 0 && (
                                <div className="space-y-3">
                                    <SplitHeading label="Melee Weapons" />
                                    {meleeWeapons.map((weapon) => weapon.profiles?.map((profile, pIdx) => <WeaponProfileCard key={`${weapon.id}-${pIdx}`} profile={profile} />))}
                                </div>
                            )}
                        </div>

                        {/* Right Column */}
                        <div className="space-y-6">
                            {/* Abilities */}
                            {unit.abilities && unit.abilities.length > 0 && (
                                <div className="space-y-3">
                                    <SplitHeading label="Abilities" />
                                    <div className="space-y-3">
                                        {unit.abilities.map((ability, idx) => (
                                            <div key={idx} className="border border-skarsnikGreen rounded p-3">
                                                <div className="flex items-start justify-between mb-1">
                                                    <div className="font-medium text-sm">{ability.name}</div>
                                                    {ability.type && (
                                                        <Badge variant="outline" className="text-xs">
                                                            {ability.type}
                                                        </Badge>
                                                    )}
                                                </div>
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

                            {/* Unit Composition */}
                            {unit.unitComposition && unit.unitComposition.length > 0 && (
                                <div className="space-y-3">
                                    <SplitHeading label="Unit Composition" />
                                    <div>
                                        {unit.unitComposition.map((composition, idx) => (
                                            <div key={idx} className="first:border-t border-b border-skarsnikGreen py-2">
                                                <div
                                                    className="text-sm"
                                                    dangerouslySetInnerHTML={{
                                                        __html: composition.description,
                                                    }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Transport */}
                            {unit.transport && (
                                <div className="space-y-3">
                                    <SplitHeading label="Transport" />
                                    <p
                                        className="text-sm"
                                        dangerouslySetInnerHTML={{
                                            __html: unit.transport,
                                        }}
                                    />
                                </div>
                            )}

                            {/* Damaged Profile */}
                            {unit.damagedW && unit.damagedDescription && (
                                <div className="space-y-3">
                                    <SplitHeading label="Damaged Profile" />
                                    <div className="border border-skarsnikGreen rounded p-3">
                                        <div className="text-sm font-medium mb-1">{unit.damagedW} Wounds Remaining</div>
                                        <p
                                            className="text-sm"
                                            dangerouslySetInnerHTML={{
                                                __html: unit.damagedDescription,
                                            }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}

export default DatasheetDialog;
