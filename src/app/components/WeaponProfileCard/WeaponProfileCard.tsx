import React from "react";

import { WeaponProfile } from "#types/Weapons.tsx";

import { Badge } from "#components/Badge/Badge.tsx";
import { Button } from "#components/Button/Button.tsx";

import BaseIcon from "../icons/BaseIcon.tsx";
import IconLaurels from "../icons/IconLaurels.tsx";
import IconLeader from "../icons/IconLeader.tsx";

import strikethrough from "#assets/Strikethrough.svg";

export type BonusSourceType = "leader" | "enhancement" | "detachment";

export interface BonusAttribute {
    name: string;
    value?: string | number | null;
    sourceName?: string;
    sourceType?: BonusSourceType;
}

// Stat bonuses that modify weapon characteristics
export interface StatBonus {
    attribute: "a" | "s" | "ap" | "d" | "range" | "bsWs";
    value: number;
    sourceName?: string;
    sourceType?: BonusSourceType;
}

// Counter controls for ratio-based selections
export interface CounterControls {
    current: number;
    max: number;
    onIncrement: () => void;
    onDecrement: () => void;
}

interface Props {
    profile: WeaponProfile;
    isSelected?: boolean;
    isLinked?: boolean;
    isDisabled?: boolean;
    onWeaponProfileChange?: (profile: WeaponProfile | null) => void;
    onToggle?: () => void;
    canToggle?: boolean;
    // Click handler for the whole card (used when no button is shown)
    onCardClick?: () => void;
    // Bonus attributes from enhancements/abilities (e.g., SUSTAINED HITS)
    bonusAttributes?: BonusAttribute[];
    // Stat bonuses from enhancements/abilities (e.g., +1 Strength)
    statBonuses?: StatBonus[];
}

const WeaponProfileCard = ({ profile, isSelected, isLinked, isDisabled, onWeaponProfileChange, onToggle, canToggle = true, onCardClick, bonusAttributes, statBonuses }: Props) => {
    const handleClick = () => {
        if (canToggle && onToggle) {
            onToggle();
        } else if (onCardClick) {
            onCardClick();
        } else if (onWeaponProfileChange) {
            onWeaponProfileChange(profile);
        }
    };

    // Format bonus attribute for display (e.g., "SUSTAINED HITS" + value 1 = "SUSTAINED HITS 1")
    const formatBonusAttribute = (bonus: BonusAttribute): string => {
        if (bonus.value !== null && bonus.value !== undefined && bonus.value !== true) {
            return `${bonus.name} ${bonus.value}`;
        }
        return bonus.name;
    };

    // Get total bonus for a specific stat
    const getStatBonus = (attr: StatBonus["attribute"]): number => {
        if (!statBonuses) return 0;
        return statBonuses.filter((b) => b.attribute === attr).reduce((sum, b) => sum + b.value, 0);
    };

    // Get sources for a specific stat bonus (for tooltip)
    const getStatBonusSources = (attr: StatBonus["attribute"]): string[] => {
        if (!statBonuses) return [];
        return statBonuses.filter((b) => b.attribute === attr && b.sourceName).map((b) => b.sourceName!);
    };

    // Render a stat value with optional bonus
    const renderStat = (attr: StatBonus["attribute"], baseValue: string | number, suffix?: string) => {
        const bonus = getStatBonus(attr);
        const sources = getStatBonusSources(attr);
        const hasBonus = bonus !== 0;

        if (!hasBonus) {
            return (
                <span className="text-profile-attribute">
                    {baseValue}
                    {suffix}
                </span>
            );
        }

        // For numeric values, calculate the new value
        const numericBase = typeof baseValue === "number" ? baseValue : parseInt(baseValue as string, 10);
        const isNumeric = !isNaN(numericBase);

        return (
            <span className="text-profile-attribute flex items-center justify-center gap-0.5" title={sources.length > 0 ? `From: ${sources.join(", ")}` : undefined}>
                {isNumeric ? (
                    <>
                        <span className="text-skarsnikGreen">{numericBase + bonus}</span>
                        <span className="text-skarsnikGreen/70">
                            ({bonus > 0 ? "+" : ""}
                            {bonus})
                        </span>
                    </>
                ) : (
                    <>
                        {baseValue}
                        <span className="text-skarsnikGreen/70">
                            ({bonus > 0 ? "+" : ""}
                            {bonus})
                        </span>
                    </>
                )}
                {suffix}
            </span>
        );
    };

    const linkedClasses = "";
    const selectedClasses = "bg-skarsnikGreen shadow-glow-green text-deathWorldForest";

    return (
        <div
            key={profile.name}
            className={`relative rounded p-3 border-1 transition-colors border-skarsnikGreen ${isDisabled ? "cursor-not-allowed" : ""} ${onWeaponProfileChange || onCardClick ? "cursor-pointer" : ""} ${isSelected ? selectedClasses : "text-skarsnikGreen"} ${isLinked ? linkedClasses : ""}`}
            onClick={handleClick}
        >
            <div className={`${isDisabled ? "opacity-25" : ""} space-y-2`}>
                <div className="flex items-center justify-between">
                    <h4 className="text-metadata-l">{profile.name}</h4>
                </div>
                {(profile.attributes || (bonusAttributes && bonusAttributes.length > 0)) && (
                    <div className="flex flex-wrap gap-2">
                        {profile.attributes?.map((attr: string) => (
                            <Badge key={attr} variant={isSelected ? "secondary" : "default"}>
                                {attr}
                            </Badge>
                        ))}
                        {bonusAttributes
                            ?.filter((bonus) => {
                                // Filter out bonuses that already exist in profile attributes
                                if (!profile.attributes) return true;
                                const bonusFormatted = formatBonusAttribute(bonus).toUpperCase();
                                return !profile.attributes.some((attr) => attr.toUpperCase() === bonusFormatted);
                            })
                            .map((bonus, idx) => (
                                <Badge key={`bonus-${idx}`} variant={isSelected ? "secondary" : "default"} className={`flex items-center gap-1`} title={bonus.sourceName ? `From: ${bonus.sourceName}` : undefined}>
                                    <BaseIcon color={isSelected ? "default" : "deathWorldForest"}>
                                        {bonus.sourceType === "leader" && <IconLeader />}
                                        {bonus.sourceType === "enhancement" && <IconLaurels />}
                                    </BaseIcon>
                                    {formatBonusAttribute(bonus)}
                                </Badge>
                            ))}
                    </div>
                )}
                <div className="grid grid-cols-6 gap-1 text-center">
                    <span className="text-profile-attribute">Range</span>
                    <span className="text-profile-attribute">A</span>
                    <span className="text-profile-attribute">{profile.type === "Ranged" ? "BS" : "WS"}</span>
                    <span className="text-profile-attribute">S</span>
                    <span className="text-profile-attribute">AP</span>
                    <span className="text-profile-attribute">D</span>
                </div>
                <div className="grid grid-cols-6 gap-1 text-center">
                    {renderStat("range", profile.range > 0 ? profile.range : "Melee")}
                    {renderStat("a", profile.a)}
                    {profile.bsWs === "N/A" ? <span className="text-profile-attribute">N/A</span> : renderStat("bsWs", profile.bsWs, "+")}
                    {renderStat("s", profile.s)}
                    {renderStat("ap", profile.ap)}
                    {renderStat("d", profile.d)}
                </div>
            </div>
            {isDisabled && <img className="absolute w-full h-full top-0 bottom-0 right-0 left-0" src={strikethrough} alt="X" />}
        </div>
    );
};

export default WeaponProfileCard;
