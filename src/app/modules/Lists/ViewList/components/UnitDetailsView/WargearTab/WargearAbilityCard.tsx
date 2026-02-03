import React from "react";

import { WargearAbility } from "#types/Units.tsx";

import BaseIcon from "#components/icons/BaseIcon.tsx";
import IconShield from "#components/icons/IconShield.tsx";

import styles from "./WargearProfileCard.module.css";

import strikethrough from "#assets/StrikethroughOrange.svg";

interface Props {
    ability: WargearAbility;
    className?: string;
    isSelected?: boolean;
    isDisabled?: boolean;
    isStacked?: boolean;
    onCardClick?: () => void;
    disabledLabel?: string;
}

/**
 * WargearAbilityCard - displays a wargear ability (like Storm Shield, Relic Shield)
 * Similar to WargearProfileCard but shows description/mechanics instead of weapon stats
 */
const WargearAbilityCard = ({ ability, className, isSelected, isDisabled, isStacked, onCardClick, disabledLabel }: Props) => {
    const handleClick = () => {
        if (onCardClick && !isDisabled) {
            onCardClick();
        }
    };

    // Format mechanic for display
    const formatMechanic = (mechanic: { entity?: string; effect?: string; attribute?: string; value?: number }): string | null => {
        if (!mechanic.attribute || mechanic.value === undefined) return null;

        const attrMap: Record<string, string> = {
            w: "Wounds",
            sv: "Save",
            t: "Toughness",
            m: "Movement",
            ld: "Leadership",
            oc: "OC",
            a: "Attacks",
            s: "Strength",
            charge: "Charge Roll",
        };

        const attrName = attrMap[mechanic.attribute] || mechanic.attribute.toUpperCase();

        if (mechanic.effect === "staticNumber") {
            return `${attrName}: ${mechanic.value}${mechanic.attribute === "sv" ? "+" : ""}`;
        } else if (mechanic.effect === "rollBonus") {
            const sign = mechanic.value > 0 ? "+" : "";
            return `${sign}${mechanic.value} to ${attrName}`;
        } else if (mechanic.effect === "statBonus") {
            const sign = mechanic.value > 0 ? "+" : "";
            return `${sign}${mechanic.value} ${attrName}`;
        }

        return null;
    };

    const selectedClasses = `${styles.WargearProfileCardSelected} bg-fireDragonBright shadow-glow-orange text-mournfangBrown`;

    return (
        <div
            key={ability.id}
            className={`relative rounded p-3 border-1 ${isStacked ? styles.WargearProfileCardStacked : ""} transition-colors border-fireDragonBright ${isDisabled ? "cursor-not-allowed" : ""} ${onCardClick ? "cursor-pointer" : ""} ${isSelected ? selectedClasses : "text-fireDragonBright"} ${className || ""}`}
            onClick={handleClick}
        >
            <div className={`${isDisabled ? "opacity-25" : ""} flex justify-between items-center min-h-[61px]`}>
                <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                        <BaseIcon size="small" color={isSelected ? "mournfangBrown" : "fireDragonBright"}>
                            <IconShield />
                        </BaseIcon>
                        <h4 className="text-metadata-l">{ability.name}</h4>
                    </div>
                    {ability.description && <p className={`text-body-s ${isSelected ? "text-mournfangBrown/80" : "text-fireDragonBright/70"}`}>{ability.description}</p>}
                </div>

                {/* Display parsed mechanics as stats if available */}
                {ability.mechanics && ability.mechanics.length > 0 && (
                    <div className="flex flex-col items-end gap-1 ml-4">
                        {ability.mechanics.map((mechanic, idx) => {
                            const formatted = formatMechanic(mechanic);
                            if (!formatted) return null;
                            return (
                                <span key={idx} className={`text-profile-attribute font-medium ${isSelected ? "text-mournfangBrown" : "text-fireDragonBright"}`}>
                                    {formatted}
                                </span>
                            );
                        })}
                    </div>
                )}
            </div>

            {isDisabled && (
                <>
                    <img className="absolute w-full h-full top-0 bottom-0 right-0 left-0" src={strikethrough} alt="X" />
                    {disabledLabel && <span className="absolute top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%] text-fireDragonBright inline-block bg-mournfangBrown border-1 border-fireDragonBright p-2">{disabledLabel}</span>}
                </>
            )}
        </div>
    );
};

export default WargearAbilityCard;
