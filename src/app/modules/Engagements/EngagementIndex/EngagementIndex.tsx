import React from "react";

import { NavLink } from "react-router-dom";

import BaseIcon from "#components/icons/BaseIcon.tsx";
import IconCrossedSwords from "#components/icons/IconCrossedSwords.tsx";

import { buttonClasses } from "#components/Button/Button.tsx";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "#components/AlertDialog/AlertDialog.tsx";
import { useEngagementManager } from "../EngagementManagerContext";
import EngagementCard from "./components/EngagementCard";

const EngagementIndex = () => {
    const { engagements, engagementsLoaded, deleteEngagement } = useEngagementManager();

    if (!engagementsLoaded) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <div className="space-y-4 w-full h-full items-center justify-center flex flex-col">
            <BaseIcon size="large">
                <IconCrossedSwords />
            </BaseIcon>
            <h1 className="text-title-xl">Ongoing engagements</h1>
            {engagements.length > 0 && (
                <div className="space-y-2 w-full max-w-md">
                    {engagements.map((engagement) => (
                        <EngagementCard key={engagement.id} engagement={engagement} />
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
