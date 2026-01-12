import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "../../components/_ui/button";
import { Badge } from "../../components/_ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/_ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../../components/_ui/alert-dialog";

import { useListManager } from "./ListManagerContext";

export function ListsOverview() {
    const { lists, deleteList, calculateItemPoints } = useListManager();
    const [listToDelete, setListToDelete] = useState<{ id: string; name: string } | null>(null);

    const calculateListTotalPoints = (list: (typeof lists)[0]) => {
        return list.items.reduce((total, item) => {
            const unitPoints = calculateItemPoints(item);
            const enhancementPoints = item.enhancement?.cost ?? 0;
            return total + unitPoints + enhancementPoints;
        }, 0);
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>Your Lists</CardTitle>
                    <Link to="/lists/new">
                        <Button size="sm">
                            <Plus className="h-4 w-4 mr-1" />
                            New
                        </Button>
                    </Link>
                </div>
            </CardHeader>
            <CardContent className="px-6 pb-4">
                {lists.length === 0 ? (
                    <p className="text-sm  text-center py-4">No lists yet. Create one to get started!</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {lists.map((list) => (
                            <Link key={list.id} to={`/lists/view/${list.id}`} className="block p-4 rounded border-1 border-skarsnikGreen  hover:bg-deathWorldForest transition-colors">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-sm">{list.name}</h3>
                                        <p className="text-xs  mt-1">
                                            {list.factionName} | {list.detachmentName}
                                        </p>
                                        <Badge variant="outline" className="text-xs">
                                            {calculateListTotalPoints(list)} pts
                                        </Badge>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setListToDelete({ id: list.id, name: list.name });
                                        }}
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </CardContent>

            <AlertDialog open={!!listToDelete} onOpenChange={(open) => !open && setListToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete List</AlertDialogTitle>
                        <AlertDialogDescription>Are you sure you want to delete "{listToDelete?.name}"? This action cannot be undone.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                if (listToDelete) {
                                    deleteList(listToDelete.id);
                                    setListToDelete(null);
                                }
                            }}
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Card>
    );
}

export default ListsOverview;
