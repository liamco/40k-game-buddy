import Attention from "#components/Attention/Attention.tsx";
import { Badge } from "#components/Badge/Badge.tsx";
import FactionBadge from "#components/FactionBadge/FactionBadge.tsx";
import HorizontalRule from "#components/HorizontalRule/HorizontalRule.tsx";
import { ArmyList } from "#types/Lists.tsx";
import { getUnitById } from "#utils/unitHelpers";

interface Props {
    force: ArmyList;
    role: "attacker" | "defender";
    engagementPointsLimit: number;
}

const ForceOverViewCard = ({ force, role, engagementPointsLimit }: Props) => {
    // Calculate stats from the list
    const attachedLeaders = force.items.filter((item) => item.leading).length;
    const enhancements = force.items.filter((item) => item.enhancement).length;
    const warlord = force.warlordItemId ? getUnitById(force.items, force.warlordItemId) : null;

    return (
        <div className="flex flex-col h-full justify-between p-4">
            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <FactionBadge faction={force} />
                    {force.totalPointsCost > 0 && <Badge variant="outline">{force.totalPointsCost} pts</Badge>}
                </div>
                <HorizontalRule />
                <div className="flex justify-between items-center">
                    <span className="text-blockcaps-m">Warlord</span>
                    {warlord ? <span className="text-blockcaps-m opacity-75">{warlord.name}</span> : <span className="text-blockcaps-m opacity-75">-</span>}
                </div>
                <HorizontalRule />
                <div className="flex justify-between items-start">
                    <span className="text-blockcaps-m">units</span>
                    <span className="text-blockcaps-m opacity-75">{force.items.length}</span>
                </div>
                <HorizontalRule />
                <div className="flex justify-between items-start">
                    <span className="text-blockcaps-m">leaders</span>
                    <span className="text-blockcaps-m opacity-75">{attachedLeaders}</span>
                </div>
                <HorizontalRule />
                <div className="flex justify-between items-start">
                    <span className="text-blockcaps-m">Enhancements</span>
                    <span className="text-blockcaps-m opacity-75">{enhancements}</span>
                </div>
            </div>
            <div className="space-y-2">
                {!warlord && <Attention label="Warlord MIA" variant="destructive" />}
                {force.totalPointsCost < engagementPointsLimit && <Attention label="Force underpointed" />}
                {force.totalPointsCost > engagementPointsLimit && <Attention variant="destructive" label="Force overpointed" />}
                {enhancements < 1 && <Attention label="No enhancements selected" />}
            </div>
        </div>
    );
};

export default ForceOverViewCard;
