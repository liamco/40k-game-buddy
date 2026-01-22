import { X } from "lucide-react";
import { Badge } from "../../components/_ui/badge";
import { Button } from "../../components/_ui/button";
import { ArmyListItem } from "../../types";

import BaseIcon from "../../components/icons/BaseIcon.tsx";
import IconLaurels from "../../components/icons/IconLaurels.tsx";
import IconLeader from "../../components/icons/IconLeader.tsx";

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
        <div
            key={item.listItemId}
            className={`space-y-3 p-3 border rounded border-skarsnikGreen cursor-pointer transition-colors ${isSelected ? "bg-skarsnikGreen text-deathWorldForest" : " hover:bg-deathWorldForest"} ${isGroupedWithNext ? "mb-0 rounded-b-none border-b-0" : ""} ${isGroupedWithPrev ? "rounded-t-none" : ""}`}
            onClick={() => setSelectedItem(item)}
        >
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{item.name}</span>
                    {isLeader && (
                        <BaseIcon color={isSelected ? "deathWorldForest" : "default"}>
                            <IconLeader />
                        </BaseIcon>
                    )}
                </div>
                <div className="flex gap-2 items-center">
                    <Badge variant={isSelected ? "outlineDark" : "outline"}>{calculateItemPoints(item)} pts</Badge>
                    <Button
                        variant="ghostSecondary"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveItem(item.listItemId);
                        }}
                    >
                        <X className={`"h-4 w-4" ${isSelected ? "stroke-deathWorldForest" : ""}`} />
                    </Button>
                </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
                {item.enhancement && (
                    <Badge variant={isSelected ? "outlineDark" : "outline"}>
                        <BaseIcon color={isSelected ? "deathWorldForest" : "default"}>
                            <IconLaurels />
                        </BaseIcon>
                        <span>
                            {item.enhancement.name} ({item.enhancement.cost} pts)
                        </span>
                    </Badge>
                )}
                {item.loadoutSelections && Object.values(item.loadoutSelections).some((count) => count > 0) && <Badge variant={isSelected ? "outlineDark" : "outline"}>Custom Loadout</Badge>}
            </div>
        </div>
    );
};

export default ListItem;
