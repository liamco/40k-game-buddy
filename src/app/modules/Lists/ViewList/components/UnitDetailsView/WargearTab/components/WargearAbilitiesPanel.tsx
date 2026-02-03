/**
 * WargearAbilitiesPanel Component
 *
 * Displays wargear abilities and their active/inactive state
 * based on currently equipped weapons.
 */

import { Check, Circle } from "lucide-react";
import { WargearAbilityEvaluation } from "../evaluator/wargearAbilities";

interface Props {
    evaluations: WargearAbilityEvaluation[];
}

export function WargearAbilitiesPanel({ evaluations }: Props) {
    if (evaluations.length === 0) return null;

    return (
        <div className="bg-stone-900 rounded-lg p-4">
            <h3 className="text-sm font-medium text-stone-400 mb-3">
                Wargear Abilities
            </h3>
            <div className="space-y-3">
                {evaluations.map((ability) => (
                    <WargearAbilityCard
                        key={ability.name}
                        ability={ability}
                    />
                ))}
            </div>
        </div>
    );
}

interface AbilityCardProps {
    ability: WargearAbilityEvaluation;
}

function WargearAbilityCard({ ability }: AbilityCardProps) {
    const { name, description, isActive, triggerWeapons } = ability;

    return (
        <div
            className={`rounded-lg border p-3 transition-colors ${
                isActive
                    ? "bg-emerald-950/30 border-emerald-700/50"
                    : "bg-stone-800/50 border-stone-700/50 opacity-60"
            }`}
        >
            <div className="flex items-start gap-2">
                <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                        isActive
                            ? "bg-emerald-600 text-white"
                            : "bg-stone-700 text-stone-500"
                    }`}
                >
                    {isActive ? (
                        <Check className="w-3 h-3" />
                    ) : (
                        <Circle className="w-3 h-3" />
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span
                            className={`font-medium ${
                                isActive ? "text-emerald-300" : "text-stone-400"
                            }`}
                        >
                            {name}
                        </span>
                        {!isActive && triggerWeapons.length > 0 && (
                            <span className="text-xs text-stone-500">
                                (not equipped)
                            </span>
                        )}
                    </div>
                    {description && (
                        <p
                            className={`text-xs mt-1 ${
                                isActive ? "text-stone-300" : "text-stone-500"
                            }`}
                        >
                            {description}
                        </p>
                    )}
                    {triggerWeapons.length > 0 && (
                        <p className="text-xs text-stone-500 mt-1">
                            Requires:{" "}
                            {triggerWeapons.join(" or ")}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default WargearAbilitiesPanel;
