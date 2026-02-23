import { ArmyList, ArmyListItem } from "#types/Lists.tsx";
import SplitHeading from "#components/SplitHeading/SplitHeading.tsx";
import ModelProfileCard from "#components/ModelProfileCard/ModelProfileCard.tsx";
import { useListManager } from "#modules/Lists/ListManagerContext.tsx";

interface Props {
    unit: ArmyListItem;
    list: ArmyList;
}

const OverviewTab = ({ unit, list }: Props) => {
    const { getModelCountForLine, addModelInstance, removeModelInstance } = useListManager();

    return (
        <div className="grid grid-cols-2 gap-6 p-6">
            {unit.unitComposition && unit.unitComposition.length > 0 && (
                <div className="space-y-4">
                    <SplitHeading label="Unit composition" />
                    <div className="space-y-2">
                        {unit.unitComposition.map((composition, idx) => {
                            const line = composition.line || idx + 1;
                            const min = composition.min ?? 0;
                            const max = composition.max ?? 999;
                            const currentCount = getModelCountForLine(unit, line);
                            const isFixed = max === min;

                            return (
                                <div key={idx} className="flex items-center justify-between">
                                    <div className="font-medium" dangerouslySetInnerHTML={{ __html: composition.description }} />
                                    {isFixed ? (
                                        <span className="w-20 text-center text-sm text-gray-400">{currentCount}</span>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <button
                                                className="w-8 h-8 flex items-center justify-center border border-skarsnikGreen text-skarsnikGreen hover:bg-skarsnikGreen hover:text-black transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                                disabled={currentCount <= min}
                                                onClick={() => removeModelInstance(list, unit.listItemId, line)}
                                            >
                                                -
                                            </button>
                                            <span className="w-8 text-center">{currentCount}</span>
                                            <button
                                                className="w-8 h-8 flex items-center justify-center border border-skarsnikGreen text-skarsnikGreen hover:bg-skarsnikGreen hover:text-black transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                                disabled={currentCount >= max}
                                                onClick={() => addModelInstance(list, unit.listItemId, line)}
                                            >
                                                +
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {unit.models && unit.models.length > 0 && (
                <div className="space-y-3">
                    {unit.models.map((model, idx) => (
                        <ModelProfileCard key={idx} model={model} abilities={unit.abilities} wargearAbilities={unit.resolvedWargearAbilities} />
                    ))}
                </div>
            )}

            {(() => {
                const factionAbilities = unit.abilities.filter((a) => a.type !== "Core" && a.type !== "Datasheet");
                const datasheetAbilities = unit.abilities.filter((a) => a.type === "Datasheet" && a.name.toUpperCase() !== "LEADER");
                const allAbilities = [...factionAbilities, ...datasheetAbilities];

                return (
                    allAbilities.length > 0 && (
                        <div className="space-y-3">
                            <SplitHeading label="Abilities" />
                            <div className="space-y-2">
                                {allAbilities.map((ability) => (
                                    <div key={ability.name} className="border border-fireDragonBright/30 rounded p-3 space-y-1">
                                        <p className="text-blockcaps-s text-fireDragonBright">
                                            {ability.name}
                                            {ability.parameter && (
                                                <span className="ml-1">
                                                    {/^\d+$/.test(ability.parameter) ? `${ability.parameter}+` : ability.parameter}
                                                </span>
                                            )}
                                        </p>
                                        {ability.description && (
                                            <p className="text-sm opacity-80" dangerouslySetInnerHTML={{ __html: ability.description }} />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                );
            })()}

            {unit.transport && (
                <div className="space-y-4">
                    <SplitHeading label="Transport" />
                    <p
                        className="text-sm"
                        dangerouslySetInnerHTML={{
                            __html: unit.transport,
                        }}
                    />
                </div>
            )}
        </div>
    );
};

export default OverviewTab;
