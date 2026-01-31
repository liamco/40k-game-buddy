import { useState, useMemo } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { EngagementForceItemCombatState } from "#types/Engagements.tsx";
import { type CombinedUnitItem } from "../../CombatPhase/utils/combatUtils";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { Badge } from "#components/Badge/Badge";
import { getMovementEffects, getMovementRelevantBadges, groupMovementEffects, formatSourceAttribution, type GroupedMovementEffect } from "../utils/movementEffects";

interface Props {
    combinedUnit: CombinedUnitItem;
    onCombatStatusChange: (unitId: string, updates: Partial<EngagementForceItemCombatState>) => void;
}

const UnitMovementCard = ({ combinedUnit, onCombatStatusChange }: Props) => {
    const { item, displayName } = combinedUnit;
    const [isExpanded, setIsExpanded] = useState(false);

    // Get movement value from first model
    const movementValue = useMemo(() => {
        if (combinedUnit.isCombined && combinedUnit.bodyguardUnit?.models?.[0]) {
            // For combined units, use bodyguard's movement
            return combinedUnit.bodyguardUnit.models[0].m;
        }
        return item.models?.[0]?.m ?? "?";
    }, [combinedUnit, item.models]);

    // Extract movement effects and badges
    const movementEffects = useMemo(() => getMovementEffects(combinedUnit), [combinedUnit]);

    const badges = useMemo(() => getMovementRelevantBadges(combinedUnit), [combinedUnit]);

    const groupedEffects = useMemo(() => groupMovementEffects(movementEffects), [movementEffects]);

    const hasEffects = groupedEffects.length > 0;

    const handleMovementChange = (value: string) => {
        onCombatStatusChange(item.listItemId, {
            movementBehaviour: value as EngagementForceItemCombatState["movementBehaviour"],
        });
    };

    return (
        <div className="border-1 border-skarsnikGreen rounded p-4 flex space-y-4 flex-col justify-between">
            <div className="space-y-2">
                <div className="flex justify-between items-center gap-2">
                    <h3 className="text-blockcaps-s">{displayName}</h3>
                    <span className="text-blockcaps-l rounded text-deathWorldForest bg-skarsnikGreen p-2">{movementValue}"</span>
                </div>

                {hasEffects && (
                    <div className="flex justify-between items-center">
                        <div className="flex flex-wrap gap-1.5">
                            {badges.map((badge) => (
                                <Badge key={badge} variant="outline">
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
                <div className="mb-4 border-t border-skarsnikGreen/30 pt-3 space-y-2">
                    {groupedEffects.map((effect, idx) => (
                        <MovementEffectRow key={idx} effect={effect} />
                    ))}
                </div>
            )}

            {/* Movement choice buttons */}
            <RadioGroupPrimitive.Root value={item.combatState.movementBehaviour} onValueChange={handleMovementChange} className="grid grid-cols-4 border-1 rounded border-skarsnikGreen" defaultValue="hold">
                <RadioGroupPrimitive.Item value="hold" className="px-4 py-2 cursor-pointer data-[state=checked]:bg-skarsnikGreen data-[state=checked]:text-deathWorldForest">
                    <span className="text-blockcaps-xs">Hold</span>
                </RadioGroupPrimitive.Item>
                <RadioGroupPrimitive.Item value="move" className="px-4 py-2 border-l-1 border-skarsnikGreen cursor-pointer data-[state=checked]:bg-skarsnikGreen data-[state=checked]:text-deathWorldForest">
                    <span className="text-blockcaps-xs">Move</span>
                </RadioGroupPrimitive.Item>
                <RadioGroupPrimitive.Item value="advance" className="px-4 py-2 border-l-1 border-skarsnikGreen cursor-pointer data-[state=checked]:bg-skarsnikGreen data-[state=checked]:text-deathWorldForest">
                    <span className="text-blockcaps-xs">Advance</span>
                </RadioGroupPrimitive.Item>
                <RadioGroupPrimitive.Item value="fallBack" className="px-4 py-2 border-l-1 border-skarsnikGreen cursor-pointer data-[state=checked]:bg-skarsnikGreen data-[state=checked]:text-deathWorldForest">
                    <span className="text-blockcaps-xs">Fall back</span>
                </RadioGroupPrimitive.Item>
            </RadioGroupPrimitive.Root>
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
        <div className="flex justify-between items-start gap-4 text-xs">
            <span>{effect.description}</span>
            <span className="text-right shrink-0">{attribution}</span>
        </div>
    );
}

export default UnitMovementCard;
