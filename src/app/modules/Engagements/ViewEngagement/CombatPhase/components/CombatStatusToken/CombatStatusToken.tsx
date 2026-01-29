import BaseIcon from "#components/icons/BaseIcon.tsx";
import IconAdvance from "#components/icons/IconAdvance.tsx";
import IconFallback from "#components/icons/IconFallBack.tsx";
import IconHoldPosition from "#components/icons/IconHoldPosition.tsx";
import IconShock from "#components/icons/IconShock.tsx";
import IconMove from "#components/icons/IconMove.tsx";
import styles from "./CombatStatusToken.module.css";

interface Props {
    variant?: keyof typeof Variant;
    active?: boolean;
    onChange: (checked: boolean) => void;
    icon: string;
}

const tokenIcons: Record<string, typeof IconMove> = {
    move: IconMove,
    advance: IconAdvance,
    fallBack: IconFallback,
    holdPosition: IconHoldPosition,
    shock: IconShock,
};

const Variant = {
    default: styles.CombatStatusTokenDefault,
    highlight: styles.CombatStatusTokenHighlight,
    destructive: styles.CombatStatusTokenDestructive,
} as const;

const CombatStatusToken = ({ variant = "default", active = false, onChange, icon }: Props) => {
    const IconComponent = tokenIcons[icon] ? tokenIcons[icon] : null;

    return (
        <label className={styles.CombatStatusTokenWrapper}>
            <input type="checkbox" checked={active} onChange={(e) => onChange(e.target.checked)} className={`${styles.CombatStatusToken} ${active ? styles.isActive : ""} ${Variant[variant]}`} />
            {IconComponent && (
                <span>
                    <BaseIcon size="medium" color="currentColor">
                        <IconComponent />
                    </BaseIcon>
                </span>
            )}
        </label>
    );
};

export default CombatStatusToken;
