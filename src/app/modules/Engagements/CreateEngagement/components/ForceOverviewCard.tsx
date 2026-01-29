import { Badge } from "#components/Badge/Badge.tsx";
import FactionBadge from "#components/FactionBadge/FactionBadge.tsx";
import { ArmyList } from "#types/Lists.tsx";

interface Props {
    force: ArmyList;
    role: "attacker" | "defender";
}

const ForceOverViewCard = ({ force, role }: Props) => {
    // Calculate stats from the list
    const attachedLeaders = force.items.filter((item) => item.leading).length;
    const enhancements = force.items.filter((item) => item.enhancement).length;

    return (
        <div className="space-y-2 p-4">
            <FactionBadge faction={force} />
            <hr />
            <div className="flex justify-between items-center">
                <span className="text-blockcaps-m">Points</span>
                {force.totalPointsCost > 0 && <Badge variant="outline">{force.totalPointsCost} pts</Badge>}
            </div>

            <hr />
            <div className="flex justify-between items-start">
                <span className="text-blockcaps-m">Units</span>
                <span className="text-blockcaps-m opacity-75">{force.items.length}</span>
            </div>
            <hr />
            <div className="flex justify-between items-start">
                <span className="text-blockcaps-m">Attached leaders</span>
                <span className="text-blockcaps-m opacity-75">{attachedLeaders}</span>
            </div>
            <hr />
            <div className="flex justify-between items-start">
                <span className="text-blockcaps-m">Enhancements</span>
                <span className="text-blockcaps-m opacity-75">{enhancements}</span>
            </div>
        </div>
    );
};

export default ForceOverViewCard;
