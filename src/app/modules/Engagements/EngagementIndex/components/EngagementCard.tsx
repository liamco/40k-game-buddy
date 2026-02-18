import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "#components/AlertDialog/AlertDialog.tsx";
import { Button } from "#components/Button/Button.tsx";
import { useEngagementManager } from "#modules/Engagements/EngagementManagerContext.tsx";
import { Engagement } from "#types/Engagements.tsx";
import { Trash2 } from "lucide-react";
import { NavLink } from "react-router-dom";
import { buttonClasses } from "#components/Button/Button.tsx";

import styles from "./EngagementCard.module.css";

interface Props {
    engagement: Engagement;
}

const EngagementCard = ({ engagement }: Props) => {
    const { deleteEngagement } = useEngagementManager();

    return (
        <article className={styles.EngagementCard}>
            <div className="flex justify-between">
                <h3 className="text-blockcaps-s">{engagement.name || `Engagement ${engagement.id}`}</h3>
                <div className="flex gap-2">
                    <span className="text-blockcaps-xs-tight">{engagement.size}</span>
                    <span className="text-blockcaps-xs-tight">{engagement.type}</span>
                </div>
            </div>
            <div className="flex gap-2 items-center">
                <div className="grow">
                    <h4 className="text-blockcaps-s">{engagement.engagementForceA.name}</h4>
                    <span className="text-blockcaps-xs block opacity-75">{engagement.engagementForceA.factionName}</span>
                    <span className="text-blockcaps-xs block opacity-75">{engagement.engagementForceA.detachmentName}</span>
                </div>
                <span>vs</span>
                <div className="grow text-right">
                    <h4 className="text-blockcaps-s">{engagement.engagementForceB.name}</h4>
                    <span className="text-blockcaps-xs block opacity-75">{engagement.engagementForceB.factionName}</span>
                    <span className="text-blockcaps-xs block opacity-75">{engagement.engagementForceB.detachmentName}</span>
                </div>
            </div>
            <div className="flex justify-between items-center">
                <AlertDialog variant="destructive">
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive">Delete</Button>
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
                <NavLink to={`/engagements/view/${engagement.id}`} className={buttonClasses.primary}>
                    Continue
                </NavLink>
            </div>
        </article>
    );
};

export default EngagementCard;
