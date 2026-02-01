import BaseIcon from "#components/icons/BaseIcon.tsx";
import IconSkull from "#components/icons/IconSkull.tsx";

interface FactionBadgeData {
    name: string;
    factionName: string;
    factionIcon?: string;
    detachmentName?: string;
}

interface Props {
    faction?: FactionBadgeData;
}

const FactionBadge = ({ faction }: Props) => {
    if (!faction) {
        return <span>Loading...</span>;
    }

    return (
        <div className="flex gap-2">
            <div className="bg-skarsnikGreen p-1 flex items-center shrink-0 grow-0">
                {faction.factionIcon ? (
                    <img src={faction.factionIcon} alt={`Icon for ${faction.name}`} width="22.5px" />
                ) : (
                    <BaseIcon size="xlarge" color="deathWorldForest">
                        <IconSkull />
                    </BaseIcon>
                )}
            </div>
            <div>
                <span className="block">{faction.name}</span>
                <span className="text-blockcaps-xs opacity-75">
                    {faction.factionName} / {faction.detachmentName}
                </span>
            </div>
        </div>
    );
};

export default FactionBadge;
