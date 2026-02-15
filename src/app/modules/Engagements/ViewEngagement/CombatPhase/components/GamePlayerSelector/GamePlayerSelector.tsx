import { EngagementForce } from "#types/Engagements.tsx";
import BaseIcon from "#components/icons/BaseIcon.tsx";
import IconSkull from "#components/icons/IconSkull.tsx";
import styles from "./GamePlayerSelector.module.css";

interface Props {
    onClick: (forceId: string) => void;
    activeForceId?: string;
    players: EngagementForce[];
}

const GamePlayerSelector = ({ players, activeForceId, onClick }: Props) => {
    return (
        <div className="space-y-1">
            {players.map((player) => {
                const isActive = player.sourceListId === activeForceId;
                return (
                    <button key={player.sourceListId} onClick={() => onClick(player.sourceListId)} type="button" className={`${styles.GamePlayerSelectorButton} ${isActive ? styles.GamePlayerSelectorButtonActive : ""}`}>
                        <div className="text-left grow">
                            <span className="block text-blockcaps-s">{player.name}</span>
                            <span className="block text-blockcaps-xs">{player.factionName}</span>
                            <span className="block text-blockcaps-xs">{player.detachmentName}</span>
                        </div>
                        {player.factionIcon ? (
                            <img src={player.factionIcon} alt={`Icon for ${player.name}`} width="22.5px" />
                        ) : (
                            <BaseIcon size="xlarge" color={isActive ? "skarsnikGreen" : "deathWorldForest"}>
                                <IconSkull />
                            </BaseIcon>
                        )}
                    </button>
                );
            })}
        </div>
    );
};

export default GamePlayerSelector;
