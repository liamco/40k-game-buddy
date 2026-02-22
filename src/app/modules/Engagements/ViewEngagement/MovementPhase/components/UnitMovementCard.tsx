import { useState, useMemo, Fragment } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { EngagementForceItemCombatState } from "#types/Engagements.tsx";
import { type UnitSelectItem } from "../../CombatPhase/utils/combatUtils";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { Badge } from "#components/Badge/Badge";
import { getMovementEffects, getMovementRelevantBadges, groupMovementEffects, formatSourceAttribution, type GroupedMovementEffect } from "../utils/movementEffects";

import styles from "./UnitMovementCard.module.css";
import BaseIcon from "#components/icons/BaseIcon.tsx";
import IconSkull from "#components/icons/IconSkull.tsx";
import strikethrough from "#assets/StrikethroughRed.svg";
import { Button } from "#components/Button/Button.tsx";
import UnitInfoDialog from "../../CombatPhase/components/UnitInfoDialog.tsx";
import IconInfo from "#components/icons/IconInfo.tsx";

interface Props {
    unitItem: UnitSelectItem;
    onCombatStatusChange: (unitId: string, updates: Partial<EngagementForceItemCombatState>) => void;
}

const UnitMovementCard = ({ unitItem, onCombatStatusChange }: Props) => {
    const { item, displayName } = unitItem;
    const [isExpanded, setIsExpanded] = useState(false);
    const [infoOpen, setInfoOpen] = useState(false);

    // Get movement value from first model
    const movementValue = useMemo(() => {
        return item.models?.[0]?.m ?? "?";
    }, [item.models]);

    // Extract movement effects and badges
    const movementEffects = useMemo(() => getMovementEffects(unitItem), [unitItem]);

    const badges = useMemo(() => getMovementRelevantBadges(unitItem), [unitItem]);

    const groupedEffects = useMemo(() => groupMovementEffects(movementEffects), [movementEffects]);

    const hasEffects = groupedEffects.length > 0;

    const handleMovementChange = (value: string) => {
        onCombatStatusChange(item.listItemId, {
            movementBehaviour: value as EngagementForceItemCombatState["movementBehaviour"],
        });
    };

    const resolveBadgeClass = () => {
        if (item.combatState.movementBehaviour) {
            return "secondaryAlt";
        }

        if (item.combatState.isDestroyed) {
            return "destructive";
        }

        return "outlineAlt";
    };

    const resolveMoveStatClass = () => {
        if (item.combatState.isDestroyed) {
            return "text-wordBearersRed bg-wildRiderRed";
        }

        return "bg-rhinoxHide text-fireDragonBright";
    };

    const resolveSwitchBorderClass = () => {
        if (item.combatState.movementBehaviour) {
            return "border-mournfangBrown";
        }

        if (item.combatState.isDestroyed) {
            return "border-wildRiderRed";
        }

        return "border-fireDragonBright";
    };

    return (
        <div className={`${styles.UnitMovementCard} ${item.combatState.movementBehaviour ? styles.UnitMovementCardTouched : null} ${item.combatState.isDestroyed ? styles.UnitMovementCardDestroyed : null}`}>
            <div className="space-y-2">
                <div className="flex justify-between items-center gap-2">
                    <div className="flex gap-1 items-center">
                        <h3 className="text-blockcaps-s">{displayName}</h3>
                        <Button variant="ghostPrimary" className="h-full rounded !p-1" onClick={() => setInfoOpen(true)}>
                            <BaseIcon color={item.combatState.movementBehaviour ? "mournfangBrown" : "fireDragonBright"}>
                                <IconInfo />
                            </BaseIcon>
                        </Button>
                    </div>
                    <span className={`text-blockcaps-l rounded p-2 ${resolveMoveStatClass()}`}>{movementValue}"</span>
                </div>

                {hasEffects && (
                    <div className="flex justify-between items-center">
                        <div className="flex flex-wrap gap-1">
                            {badges.map((badge) => (
                                <Badge key={badge} variant={resolveBadgeClass()}>
                                    {badge}
                                </Badge>
                            ))}
                        </div>
                        <button onClick={() => setIsExpanded(!isExpanded)} className="flex items-center gap-1 text-xs transition-colors">
                            {isExpanded ? (
                                <>
                                    <span className="text-blockcaps-xs">Collapse effects</span>
                                    <ChevronUp className="w-3 h-3" />
                                </>
                            ) : (
                                <>
                                    <span className="text-blockcaps-xs">Expand effects</span>
                                    <ChevronDown className="w-3 h-3" />
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>

            {/* Expanded effects panel */}
            {isExpanded && hasEffects && (
                <div className={`mb-4 border-t ${item.combatState.movementBehaviour ? "border-mournfangBrown" : "border-fireDragonBright"} pt-3 space-y-2`}>
                    {groupedEffects.map((effect, idx) => (
                        <MovementEffectRow key={idx} effect={effect} />
                    ))}
                </div>
            )}

            {/* Movement choice buttons */}
            <RadioGroupPrimitive.Root value={item.combatState.movementBehaviour} onValueChange={handleMovementChange} className={`grid grid-cols-4 border-1 rounded ${resolveSwitchBorderClass()}`} defaultValue="hold">
                <RadioGroupPrimitive.Item value="hold" className={`px-1 py-3 ${resolveSwitchBorderClass()} cursor-pointer data-[state=checked]:bg-mournfangBrown data-[state=checked]:text-fireDragonBright`}>
                    <span className="text-blockcaps-xs">Hold</span>
                </RadioGroupPrimitive.Item>
                <RadioGroupPrimitive.Item value="move" className={`px-1 py-3 border-l-1 ${resolveSwitchBorderClass()} cursor-pointer data-[state=checked]:bg-mournfangBrown data-[state=checked]:text-fireDragonBright`}>
                    <span className="text-blockcaps-xs">Move</span>
                </RadioGroupPrimitive.Item>
                <RadioGroupPrimitive.Item value="advance" className={`px-1 py-3 border-l-1 ${resolveSwitchBorderClass()} cursor-pointer data-[state=checked]:bg-mournfangBrown data-[state=checked]:text-fireDragonBright`}>
                    <span className="text-blockcaps-xs">Advance</span>
                </RadioGroupPrimitive.Item>
                <RadioGroupPrimitive.Item value="fallBack" className={`px-1 py-3 border-l-1 ${resolveSwitchBorderClass()} cursor-pointer data-[state=checked]:bg-mournfangBrown data-[state=checked]:text-fireDragonBright`}>
                    <span className="text-blockcaps-xs">Fall back</span>
                </RadioGroupPrimitive.Item>
            </RadioGroupPrimitive.Root>

            {item.combatState.isDestroyed && (
                <Fragment>
                    <img className="absolute !opacity-100 w-full h-full top-0 left-0 pointer-events-none" src={strikethrough} alt="" />
                    <div className="bg-wordBearersRed !opacity-100 border-1 border-wildRiderRed shadow-glow-red p-2 absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]">
                        <BaseIcon size="xlarge" color="wildRiderRed">
                            <IconSkull />
                        </BaseIcon>
                    </div>
                </Fragment>
            )}

            <UnitInfoDialog unit={item} open={infoOpen} onOpenChange={setInfoOpen} />
        </div>
    );
};

/**
 * Display a single movement effect row with description and source attribution
 */
function MovementEffectRow({ effect }: { effect: GroupedMovementEffect }) {
    // Group sources by type for better display
    const weaponSources = effect.sources.filter((s) => s.type === "weapon");
    const abilitySources = effect.sources.filter((s) => s.type !== "weapon");

    // Build attribution string
    let attribution = "";

    if (weaponSources.length > 0) {
        const attribute = weaponSources[0].attribute;
        if (weaponSources.length === 1) {
            attribution = formatSourceAttribution(weaponSources[0]);
        } else {
            // Multiple weapons with same attribute
            const weaponNames = weaponSources.map((s) => s.name.toUpperCase()).join(", ");
            attribution = `${weaponNames} have ${attribute}`;
        }
    } else if (abilitySources.length > 0) {
        attribution = formatSourceAttribution(abilitySources[0]);
    }

    return (
        <div className="flex justify-between items-start gap-4">
            <span>{effect.description}</span>
            <span className="text-right text-blockcaps-s">{attribution}</span>
        </div>
    );
}

export default UnitMovementCard;
