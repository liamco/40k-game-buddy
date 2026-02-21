import BaseIcon from "#components/icons/BaseIcon.tsx";
import IconAdvance from "#components/icons/IconAdvance.tsx";
import IconFallback from "#components/icons/IconFallBack.tsx";
import IconHoldPosition from "#components/icons/IconHoldPosition.tsx";
import IconShock from "#components/icons/IconShock.tsx";
import IconMove from "#components/icons/IconMove.tsx";
import styles from "./CombatStatusToken.module.css";
import IconDefender from "#components/icons/IconDefender.tsx";

interface Props {
    variant?: keyof typeof Variant;
    active?: boolean;
    onChange?: (checked: boolean) => void;
    icon: string;
    disabled?: boolean;
}

const tokenIcons: Record<string, typeof IconMove> = {
    move: IconMove,
    advance: IconAdvance,
    fallBack: IconFallback,
    hold: IconHoldPosition,
    shock: IconShock,
    cover: IconDefender,
};

const Variant = {
    default: styles.CombatStatusTokenDefault,
    highlight: styles.CombatStatusTokenHighlight,
    destructive: styles.CombatStatusTokenDestructive,
} as const;

const CombatStatusToken = ({ variant = "default", active = false, disabled = false, onChange, icon }: Props) => {
    const IconComponent = tokenIcons[icon] ? tokenIcons[icon] : null;

    if (IconComponent) {
        return (
            <BaseIcon size="medium" color="currentColor">
                <IconComponent />
            </BaseIcon>
        );
    }
};

export default CombatStatusToken;
