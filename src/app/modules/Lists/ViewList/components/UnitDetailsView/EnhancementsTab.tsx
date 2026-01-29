import { ArmyList, ArmyListItem } from "#types/Lists.tsx";
import { Enhancement } from "#types/Enhancements.tsx";
import { useListManager } from "../../../ListManagerContext";

import SplitHeading from "#components/SplitHeading/SplitHeading.tsx";
import EnhancementCard from "#components/EnhancementCard/EnhancementCard.tsx";

interface Props {
    unit: ArmyListItem;
    list: ArmyList;
    detachmentEnhancements: Enhancement[];
    usedEnhancements: Map<string, string>;
}

const EnhancementsTab = ({ unit, list, detachmentEnhancements, usedEnhancements }: Props) => {
    const { attachEnhancementToLeader } = useListManager();

    if (detachmentEnhancements.length === 0) {
        return (
            <div className="text-sm text-gray-500">
                <p>No enhancements available for this detachment.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <SplitHeading label="Enhancement options" />
            <div className="space-y-3">
                {detachmentEnhancements.map((enhancement, idx) => {
                    const isAttached = unit?.enhancement?.id === enhancement.id;
                    const usedByLeader = usedEnhancements.get(enhancement.id);
                    const isUsedByOther = !!usedByLeader && !isAttached;
                    return (
                        <EnhancementCard
                            key={enhancement.id || idx}
                            enhancement={enhancement}
                            showPoints
                            showLegend
                            isAttached={isAttached}
                            isUsedByOther={isUsedByOther}
                            usedBy={usedByLeader}
                            handleAttachEnhancement={() => {
                                attachEnhancementToLeader(list, unit.listItemId, { id: enhancement.id, name: enhancement.name, cost: enhancement.cost });
                            }}
                        />
                    );
                })}
            </div>
        </div>
    );
};

export default EnhancementsTab;
