import React from "react";

import { NavLink } from "react-router-dom";

import BaseIcon from "#components/icons/BaseIcon.tsx";
import IconCrossedSwords from "#components/icons/IconCrossedSwords.tsx";
import { Trash2 } from "lucide-react";

import { buttonClasses } from "#components/Button/Button.tsx";
import { Button } from "#components/Button/Button.tsx";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "#components/AlertDialog/AlertDialog.tsx";
import { useEngagementManager } from "../EngagementManagerContext";

const EngagementIndex = () => {
    const { engagements, engagementsLoaded, deleteEngagement } = useEngagementManager();

    if (!engagementsLoaded) {
        return (
            <div className="w-full h-full flex items-center justify-center border-1 border-skarsnikGreen">
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <div className="space-y-4 w-full h-full items-center justify-center flex flex-col border-1 border-skarsnikGreen">
            <BaseIcon size="large">
                <IconCrossedSwords />
            </BaseIcon>
            <h1 className="text-title-xl">Ongoing engagements</h1>
            {engagements.length > 0 && (
                <div className="space-y-2 w-full max-w-md">
                    {engagements.map((engagement) => (
                        <div key={engagement.id} className="flex items-center gap-2">
                            <NavLink to={`/engagements/view/${engagement.id}`} className="flex-1 block p-4 rounded border-1 border-skarsnikGreen hover:bg-deathWorldForest transition-colors">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-semibold text-sm">{engagement.name || `Engagement ${engagement.id}`}</h3>
                                        <p className="text-xs mt-1">
                                            {engagement.engagementForceA.factionName} vs {engagement.engagementForceB.factionName}
                                        </p>
                                    </div>
                                    <span className="text-xs opacity-75">Turn {engagement.currentTurn}</span>
                                </div>
                            </NavLink>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="text-fireDragonBright hover:text-red-500">
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Delete Engagement</AlertDialogTitle>
                                        <AlertDialogDescription>Are you sure you want to delete this engagement? This action cannot be undone.</AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => deleteEngagement(engagement.id)}>Delete</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    ))}
                </div>
            )}
            <NavLink to="/engagements/new" className={buttonClasses.primary}>
                New engagement
            </NavLink>
        </div>
    );
};

export default EngagementIndex;
