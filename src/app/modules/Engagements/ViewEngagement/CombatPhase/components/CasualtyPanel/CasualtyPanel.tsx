import { useMemo } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { EngagementForceItem, EngagementModelInstance } from "#types/Engagements.tsx";

import { Button } from "#components/Button/Button.tsx";

import CasualtyCard from "./CasualtyCard.tsx";

interface CasualtyPanelProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    unit: EngagementForceItem;
    deadModelIds: string[];
    onCasualtyChange: (deadModelIds: string[]) => void;
}

export function CasualtyPanel({ open, onOpenChange, unit, deadModelIds, onCasualtyChange }: CasualtyPanelProps) {
    const instances = unit.modelInstances || [];
    const aliveCount = instances.length - deadModelIds.length;

    const handleToggle = (instanceId: string) => {
        const isDead = deadModelIds.includes(instanceId);
        if (isDead) {
            onCasualtyChange(deadModelIds.filter((id) => id !== instanceId));
        } else {
            onCasualtyChange([...deadModelIds, instanceId]);
        }
    };

    const getModelProfile = (instance: EngagementModelInstance) => {
        return unit.models[instance.modelTypeLine] || unit.models[0];
    };

    // Group instances by source unit name for combined units
    const groupedInstances = useMemo(() => {
        const groups: Record<string, EngagementModelInstance[]> = {};
        instances.forEach((instance) => {
            const source = instance.sourceUnitName || unit.name;
            if (!groups[source]) {
                groups[source] = [];
            }
            groups[source].push(instance);
        });
        return groups;
    }, [instances, unit.name]);

    const sourceUnitNames = Object.keys(groupedInstances);
    const isCombinedUnit = sourceUnitNames.length > 1;

    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-50 bg-nocturneGreen/70" />
                <Dialog.Content className="fixed inset-0 z-50 w-full h-full max-w-[72rem] max-h-[80vh] top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%] bg-nocturneGreen/85 border-1 border-skarsnikGreen flex flex-col">
                    <div className="flex justify-between">
                        <Dialog.Title className="p-4 text-metadata-l font-medium text-skarsnikGreen">{unit.name}</Dialog.Title>

                        <Dialog.Close asChild>
                            <button className="cursor-pointer aspect-square text-center text-deathWorldForest hover:text-deathWorldForest/70 bg-skarsnikGreen transition-colors p-2">
                                <X className="w-6 h-6 inline-block" />
                            </button>
                        </Dialog.Close>
                    </div>

                    <div className="flex-1 overflow-auto p-4 space-y-6">
                        {sourceUnitNames.map((sourceName) => (
                            <div key={sourceName}>
                                {isCombinedUnit && <h3 className="text-blockcaps-s text-skarsnikGreen/70 mb-3">{sourceName}</h3>}
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                                    {groupedInstances[sourceName].map((instance, idx) => (
                                        <CasualtyCard key={instance.instanceId} instance={instance} modelProfile={getModelProfile(instance)} wargear={unit.wargear} displayIndex={idx + 1} isDead={deadModelIds.includes(instance.instanceId)} onToggle={handleToggle} />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}

export default CasualtyPanel;
