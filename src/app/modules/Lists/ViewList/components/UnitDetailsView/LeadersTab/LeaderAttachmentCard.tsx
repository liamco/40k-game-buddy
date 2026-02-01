import { ArmyList, ArmyListItem } from "#types/Lists.tsx";
import { MultiLeaderValidationResult } from "../../../ListManagerContext";
import { Button } from "#components/Button/Button.tsx";

interface Props {
    leader: ArmyListItem;
    targetUnit: ArmyListItem;
    list: ArmyList;
    isAttached: boolean;
    validation: MultiLeaderValidationResult;
    onAttach: () => void;
    onDetach: () => void;
}

const LeaderAttachmentCard = ({ leader, targetUnit, list, isAttached, validation, onAttach, onDetach }: Props) => {
    const existingLeaderRefs = targetUnit.leadBy || [];
    const hasExistingLeaders = existingLeaderRefs.length > 0;

    const existingLeaderNames = existingLeaderRefs
        .map((ref) => list.items.find((i) => i.id === ref.id && i.name === ref.name)?.name)
        .filter(Boolean)
        .join(", ");

    const getButtonLabel = () => {
        if (isAttached) return "Detach";
        if (hasExistingLeaders) {
            return validation.canAttach ? "Join" : "Replace";
        }
        return "Attach";
    };

    return (
        <div className={`border-skarsnikGreen border-1 rounded p-3 ${isAttached ? "bg-deathWorldForest" : ""}`}>
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <span>{targetUnit.name}</span>
                    {hasExistingLeaders && !isAttached && (
                        <div className="text-xs mt-1">
                            <span className="text-yellow-600">
                                {existingLeaderRefs.length} leader{existingLeaderRefs.length > 1 ? "s" : ""} attached
                                {existingLeaderNames && <span className="text-gray-500"> ({existingLeaderNames})</span>}
                            </span>
                            {validation.canAttach ? <span className="text-green-600 ml-1">• Can join</span> : <span className="text-red-500 ml-1">• Will replace</span>}
                        </div>
                    )}
                    {isAttached && <div className="text-xs text-green-600 mt-1 font-medium">Attached</div>}
                </div>
                <Button variant={isAttached ? "outline" : "default"} size="sm" onClick={isAttached ? onDetach : onAttach}>
                    {getButtonLabel()}
                </Button>
            </div>
        </div>
    );
};

export default LeaderAttachmentCard;
