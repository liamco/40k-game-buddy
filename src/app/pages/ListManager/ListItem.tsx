import { X } from "lucide-react";
import { Badge } from "../../components/_ui/badge";
import { Button } from "../../components/_ui/button";
import { ArmyListItem } from "../../types";

interface Props {
    item: ArmyListItem;
    isSelected: boolean;
    isLeader: boolean;
    isAttachedUnit: boolean;
    isGroupedWithPrev: boolean;
    isGroupedWithNext: boolean;
    leaderCount?: number; // Number of leaders attached (if this is a bodyguard unit)
    calculateItemPoints: (item: ArmyListItem) => number;
    handleRemoveItem: (itemId: string) => void;
    setSelectedItem: (item: ArmyListItem) => void;
}

const ListItem = ({ calculateItemPoints, item, handleRemoveItem, setSelectedItem, isSelected, isGroupedWithPrev, isGroupedWithNext, isLeader, isAttachedUnit, leaderCount }: Props) => {
    return (
        <div key={item.listItemId} className={`space-y-4 p-3 border rounded border-skarsnikGreen cursor-pointer transition-colors ${isSelected ? "bg-skarsnikGreen text-deathWorldForest" : " hover:bg-deathWorldForest"} ${isGroupedWithNext ? "mb-0 rounded-b-none border-b-0" : ""} ${isGroupedWithPrev ? "rounded-t-none" : ""}`} onClick={() => setSelectedItem(item)}>
            <div className="flex justify-between items-center">
                <div>
                    <span className="font-medium text-sm">{item.name}</span>
                </div>
                <div className="flex gap-2 items-center">
                    <Badge variant={isSelected ? "outlineDark" : "outline"}>{calculateItemPoints(item)} pts</Badge>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveItem(item.listItemId);
                        }}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
                {isLeader && (
                    <Badge variant="outline" className="text-xs bg-green-100 border-green-300 text-green-700">
                        Leader
                    </Badge>
                )}
                {isAttachedUnit && (
                    <Badge variant="outline" className="text-xs bg-blue-100 border-blue-300 text-blue-700">
                        {leaderCount && leaderCount > 1 ? `${leaderCount} Leaders` : "Attached"}
                    </Badge>
                )}
                {item.enhancement && (
                    <Badge variant="outline" className="text-xs bg-purple-100 border-purple-300 text-purple-700">
                        {item.enhancement.name} ({item.enhancement.cost} pts)
                    </Badge>
                )}
                {item.loadoutSelections && Object.values(item.loadoutSelections).some((count) => count > 0) && (
                    <Badge variant="outline" className="text-xs bg-orange-100 border-orange-300 text-orange-700">
                        Custom Loadout
                    </Badge>
                )}
            </div>
        </div>
    );
};

export default ListItem;
