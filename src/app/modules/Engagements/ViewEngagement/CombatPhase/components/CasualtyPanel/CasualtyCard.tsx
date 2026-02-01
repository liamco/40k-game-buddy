import { EngagementModelInstance, EngagementWargear } from "#types/Engagements.tsx";
import { Model } from "#types/Models.tsx";

import strikethrough from "#assets/StrikethroughRed.svg";
import { Badge } from "#components/Badge/Badge.tsx";
import BaseIcon from "#components/icons/BaseIcon.tsx";
import IconSkull from "#components/icons/IconSkull.tsx";
import { Fragment } from "react/jsx-runtime";

interface CasualtyCardProps {
    instance: EngagementModelInstance;
    modelProfile: Model;
    wargear: EngagementWargear[];
    displayIndex: number;
    isDead: boolean;
    onToggle: (instanceId: string) => void;
}

export function CasualtyCard({ instance, modelProfile, wargear, displayIndex, isDead, onToggle }: CasualtyCardProps) {
    const weapons = instance.loadout.map((id) => wargear.find((w) => w.id === id)).filter((w): w is EngagementWargear => w !== undefined);

    return (
        <div className={`relative rounded p-3 border-1 transition-colors cursor-pointer ${isDead ? "border-wildRiderRed/50 bg-wordBearersRed/20 text-wildRiderRed/50" : "border-fireDragonBright bg-transparent text-fireDragonBright"}`} onClick={() => onToggle(instance.instanceId)}>
            <div className={`space-y-2 ${isDead ? "opacity-40" : ""}`}>
                <div className="flex items-center justify-between">
                    <p className="text-body-s font-medium">{instance.modelType}</p>
                    <span className="text-metadata-s opacity-60">#{displayIndex}</span>
                </div>

                {weapons.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                        {weapons.map((w) => (
                            <Badge variant={isDead ? "destructive" : "secondaryAlt"}>
                                <span className="text-blockcaps-xs">{w.name}</span>
                            </Badge>
                        ))}
                    </div>
                )}
            </div>

            {isDead && (
                <Fragment>
                    <img className="absolute w-full h-full top-0 left-0 pointer-events-none" src={strikethrough} alt="" />
                    <div className="bg-wordBearersRed border-1 border-wildRiderRed shadow-glow-red p-2 absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]">
                        <BaseIcon size="xlarge" color="wildRiderRed">
                            <IconSkull />
                        </BaseIcon>
                    </div>
                </Fragment>
            )}
        </div>
    );
}

export default CasualtyCard;
