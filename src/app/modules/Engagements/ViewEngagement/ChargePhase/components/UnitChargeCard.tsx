import { useState, useMemo, Fragment } from "react";
import { ChevronDown, ChevronUp, InfoIcon } from "lucide-react";
import { EngagementForceItemCombatState } from "#types/Engagements.tsx";
import { type UnitSelectItem } from "../../CombatPhase/utils/combatUtils";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { Badge } from "#components/Badge/Badge";
import { getChargeEffects, getChargeRelevantBadges, groupChargeEffects, getChargeEligibility, formatSourceAttribution, type GroupedChargeEffect } from "../utils/chargeEffects";

import styles from "./UnitChargeCard.module.css";
import BaseIcon from "#components/icons/BaseIcon.tsx";
import IconSkull from "#components/icons/IconSkull.tsx";
import strikethrough from "#assets/StrikethroughRed.svg";
import { Button } from "#components/Button/Button.tsx";
import UnitInfoDialog from "../../CombatPhase/components/UnitInfoDialog.tsx";

interface Props {
    unitItem: UnitSelectItem;
    onCombatStatusChange: (unitId: string, updates: Partial<EngagementForceItemCombatState>) => void;
}

const UnitChargeCard = ({ unitItem, onCombatStatusChange }: Props) => {
    const { item, displayName } = unitItem;
    const [isExpanded, setIsExpanded] = useState(false);
    const [infoOpen, setInfoOpen] = useState(false);

    // Get movement value from first model
    const movementValue = useMemo(() => {
        return item.models?.[0]?.m ?? "?";
    }, [item.models]);

    // Check charge eligibility
    const eligibility = useMemo(() => getChargeEligibility(unitItem), [unitItem]);

    // Extract charge effects and badges
    const chargeEffects = useMemo(() => getChargeEffects(unitItem), [unitItem]);
    const badges = useMemo(() => getChargeRelevantBadges(unitItem), [unitItem]);
    const groupedEffects = useMemo(() => groupChargeEffects(chargeEffects), [chargeEffects]);
    const hasEffects = groupedEffects.length > 0;

    const handleChargeChange = (value: string) => {
        onCombatStatusChange(item.listItemId, {
            hasCharged: value === "charge",
        });
    };

    const radioValue = item.combatState.hasCharged ? "charge" : "hold";

    const resolveCardClass = () => {
        if (item.combatState.isDestroyed) return styles.UnitChargeCardDestroyed;
        if (!eligibility.eligible) return styles.UnitChargeCardBlocked;
        if (item.combatState.hasCharged) return styles.UnitChargeCardTouched;
        return "";
    };

    const resolveBadgeClass = () => {
        if (item.combatState.hasCharged) return "secondaryAlt";
        if (item.combatState.isDestroyed) return "destructive";
        return "outlineAlt";
    };

    const resolveMoveStatClass = () => {
        if (item.combatState.isDestroyed) return "text-wordBearersRed bg-wildRiderRed";
        return "bg-rhinoxHide text-fireDragonBright";
    };

    const resolveSwitchBorderClass = () => {
        if (item.combatState.hasCharged) return "border-mournfangBrown";
        if (item.combatState.isDestroyed) return "border-wildRiderRed";
        if (!eligibility.eligible) return "border-skarsnikGreen";
        return "border-fireDragonBright";
    };

    return (
        <div className={`${styles.UnitChargeCard} ${resolveCardClass()}`}>
            <div className="space-y-2">
                <div className="flex justify-between items-center gap-2">
                    <div className="flex gap-2 items-center">
                        <h3 className="text-blockcaps-s">{displayName}</h3>
                        <Button variant="ghostPrimary" className="h-full rounded" onClick={() => setInfoOpen(true)}>
                            <BaseIcon color="fireDragonBright">
                                <InfoIcon />
                            </BaseIcon>
                        </Button>
                    </div>
                    <span className={`text-blockcaps-l rounded p-2 ${resolveMoveStatClass()}`}>{movementValue}"</span>
                </div>

                {/* Blocked reason */}
                {!eligibility.eligible && !item.combatState.isDestroyed && <p className="text-blockcaps-xs">{eligibility.reason}</p>}

                {hasEffects && eligibility.eligible && (
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
                <div className={`mb-4 border-t ${item.combatState.hasCharged ? "border-mournfangBrown" : "border-fireDragonBright"} pt-3 space-y-2`}>
                    {groupedEffects.map((effect, idx) => (
                        <ChargeEffectRow key={idx} effect={effect} />
                    ))}
                </div>
            )}

            {/* Charge choice buttons */}
            {eligibility.eligible && (
                <RadioGroupPrimitive.Root value={radioValue} onValueChange={handleChargeChange} className={`grid grid-cols-2 border-1 rounded ${resolveSwitchBorderClass()}`}>
                    <RadioGroupPrimitive.Item value="hold" className="px-2 py-1 cursor-pointer data-[state=checked]:bg-mournfangBrown data-[state=checked]:text-fireDragonBright">
                        <span className="text-blockcaps-xs">Hold</span>
                    </RadioGroupPrimitive.Item>
                    <RadioGroupPrimitive.Item value="charge" className={`px-1 py-3 border-l-1 ${resolveSwitchBorderClass()} cursor-pointer data-[state=checked]:bg-mournfangBrown data-[state=checked]:text-fireDragonBright`}>
                        <span className="text-blockcaps-xs">Charge</span>
                    </RadioGroupPrimitive.Item>
                </RadioGroupPrimitive.Root>
            )}

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
 * Display a single charge effect row with description and source attribution
 */
function ChargeEffectRow({ effect }: { effect: GroupedChargeEffect }) {
    const weaponSources = effect.sources.filter((s) => s.type === "weapon");
    const abilitySources = effect.sources.filter((s) => s.type !== "weapon");

    let attribution = "";

    if (weaponSources.length > 0) {
        if (weaponSources.length === 1) {
            attribution = formatSourceAttribution(weaponSources[0]);
        } else {
            const weaponNames = weaponSources.map((s) => s.name.toUpperCase()).join(", ");
            attribution = `${weaponNames} have ${weaponSources[0].attribute}`;
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

export default UnitChargeCard;
