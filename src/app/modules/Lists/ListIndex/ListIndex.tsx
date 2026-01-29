import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";

import { Button } from "#components/Button/Button.tsx";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "#components/AlertDialog/AlertDialog.tsx";

import { useListManager } from "../ListManagerContext";
import EmptyState from "#components/EmptyState/EmptyState.tsx";
import IconList from "#components/icons/IconList.tsx";
import ListListItem from "./components/ListListItem";

export function ListIndex() {
    const { lists, deleteList } = useListManager();
    const [listToDelete, setListToDelete] = useState<{ id: string; name: string } | null>(null);

    return (
        <div className="w-full h-full border-1 border-skarsnikGreen">
            <header className="p-6 border-b-1 border-skarsnikGreen">
                <div className="flex items-center justify-between">
                    <h1>Your Lists</h1>
                    <Link to="/lists/new">
                        <Button size="sm">
                            <Plus className="h-4 w-4 mr-1" />
                            New
                        </Button>
                    </Link>
                </div>
            </header>
            {lists.length === 0 ? (
                <EmptyState leadingIcon={<IconList />} label="Lists lost or redacted." />
            ) : (
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {lists.map((list) => (
                        <ListListItem key={list.id} list={list} onDeleteClick={setListToDelete} />
                    ))}
                </div>
            )}
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
        </div>
    );
}

export default ListIndex;
