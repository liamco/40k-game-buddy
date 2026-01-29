import { ArmyList, ArmyListItem } from "#types/Lists.tsx";
import SplitHeading from "#components/SplitHeading/SplitHeading.tsx";
import { Input } from "#components/Input/Input.tsx";
import ModelProfileCard from "#components/ModelProfileCard/ModelProfileCard.tsx";

interface Props {
    unit: ArmyListItem;
    list: ArmyList;
    onUpdateComposition: (line: number, newCount: number, min: number, max: number) => void;
}

const OverviewTab = ({ unit, list, onUpdateComposition }: Props) => {
    return (
        <div className="grid grid-cols-2 gap-6">
            {unit.unitComposition && unit.unitComposition.length > 0 && (
                <div className="space-y-4">
                    <SplitHeading label="Unit composition" />
                    <div className="space-y-2">
                        {unit.unitComposition.map((composition, idx) => {
                            const line = composition.line || idx + 1;
                            const min = composition.min ?? 0;
                            const max = composition.max ?? 999;
                            const currentCount = unit.compositionCounts?.[line] ?? min;

                            return (
                                <div key={idx} className="flex items-center justify-between">
                                    <div className="font-medium" dangerouslySetInnerHTML={{ __html: composition.description }} />
                                    <Input
                                        type="number"
                                        min={min}
                                        max={max}
                                        value={currentCount}
                                        disabled={max === min}
                                        onChange={(e) => {
                                            const value = parseInt(e.target.value, 10);
                                            if (!isNaN(value)) {
                                                onUpdateComposition(line, value, min, max);
                                            }
                                        }}
                                        className="w-20 text-center"
                                    />
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {unit.models && unit.models.length > 0 && (
                <div className="space-y-3">
                    {unit.models.map((model, idx) => (
                        <ModelProfileCard key={idx} model={model} />
                    ))}
                </div>
            )}

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
