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
                <Dialog.Overlay className="fixed inset-0 z-50 bg-black/80" />
                <Dialog.Content className="fixed inset-0 z-50 bg-deathWorldForest flex flex-col">
                    <div className="flex items-center justify-between p-4 border-b border-skarsnikGreen/30">
                        <Dialog.Title className="text-metadata-l font-medium text-skarsnikGreen">{unit.name}</Dialog.Title>
                        <div className="flex items-center gap-4">
                            <span className="text-body-s text-skarsnikGreen">
                                {aliveCount}/{instances.length} alive
                            </span>
                            <Dialog.Close asChild>
                                <button className="text-skarsnikGreen hover:text-skarsnikGreen/70 transition-colors">
                                    <X className="w-6 h-6" />
                                </button>
                            </Dialog.Close>
                        </div>
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

                    <div className="p-4 border-t border-skarsnikGreen/30">
                        <Dialog.Close asChild>
                            <Button variant="secondary" className="w-full">
                                Done
                            </Button>
                        </Dialog.Close>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}

export default CasualtyPanel;
