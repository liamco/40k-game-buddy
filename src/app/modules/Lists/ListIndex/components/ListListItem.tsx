import { Link } from "react-router-dom";

import { ArmyList } from "#types/Lists.tsx";

import { Badge } from "#components/Badge/Badge.tsx";
import { Button } from "#components/Button/Button.tsx";

import { Trash2 } from "lucide-react";

interface Props {
    list: ArmyList;
    onDeleteClick: (params: { id: string; name: string }) => void;
}

const ListListItem = ({ list, onDeleteClick }: Props) => {
    return (
        <Link key={list.id} to={`/lists/view/${list.id}`} className="block p-4 space-y-2 rounded border-1 border-skarsnikGreen  hover:bg-deathWorldForest transition-colors">
            <div className="flex items-center justify-between">
                <h3 className="font-semibold text-m">{list.name}</h3>
                <Button
                    variant="ghostSecondary"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onDeleteClick({ id: list.id, name: list.name });
                    }}
                >
                    <Trash2 className="h-3 w-3" />
                </Button>
            </div>
            <div className="flex items-start justify-between">
                <p className="text-xs  mt-1">
                    {list.factionName} | {list.detachmentName}
                </p>
                <Badge variant="outline" className="text-xs">
                    {list.totalPointsCost} pts
                </Badge>
            </div>
        </Link>
    );
};

export default ListListItem;
