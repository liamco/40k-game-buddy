import React from "react";
import { WeaponProfile } from "../../types";
import { Badge } from "../_ui/badge";
import { Button } from "../_ui/button";

import BaseIcon from "../icons/BaseIcon.tsx";
import IconLaurels from "../icons/IconLaurels.tsx";
import IconLeader from "../icons/IconLeader.tsx";

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

interface Props {
    profile: WeaponProfile;
    isSelected?: boolean;
    onWeaponProfileChange?: (profile: WeaponProfile | null) => void;
    // Optional toggle mode for ListView optional weapons
    showToggleButton?: boolean;
    onToggle?: () => void;
    canToggle?: boolean;
    toggleLabel?: string;
    // Bonus attributes from enhancements/abilities (e.g., SUSTAINED HITS)
    bonusAttributes?: BonusAttribute[];
    // Stat bonuses from enhancements/abilities (e.g., +1 Strength)
    statBonuses?: StatBonus[];
}

const WeaponProfileCard = ({ profile, isSelected, onWeaponProfileChange, showToggleButton, onToggle, canToggle = true, toggleLabel, bonusAttributes, statBonuses }: Props) => {
    const handleClick = () => {
        if (showToggleButton) {
            if (canToggle && onToggle) {
                onToggle();
            }
        } else if (onWeaponProfileChange) {
            onWeaponProfileChange(profile);
        }
    };

    const isDisabled = showToggleButton && !canToggle;

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
                        <span className="text-[9px] text-skarsnikGreen/70">
                            ({bonus > 0 ? "+" : ""}
                            {bonus})
                        </span>
                    </>
                ) : (
                    <>
                        {baseValue}
                        <span className="text-[9px] text-skarsnikGreen/70">
                            ({bonus > 0 ? "+" : ""}
                            {bonus})
                        </span>
                    </>
                )}
                {suffix}
            </span>
        );
    };

    return (
        <div key={profile.name} className={`rounded p-3 space-y-2 border-1 transition-colors border-skarsnikGreen ${isDisabled ? "opacity-60 cursor-not-allowed" : ""} ${showToggleButton || onWeaponProfileChange ? "cursor-pointer" : ""} ${isSelected ? "bg-skarsnikGreen shadow-glow-green text-deathWorldForest" : "text-skarsnikGreen"}`} onClick={handleClick}>
            <div className="flex items-center justify-between">
                <span className="text-metadata-l">{profile.name}</span>
                {showToggleButton ? (
                    <Button
                        variant={isSelected ? "secondary" : "default"}
                        size="sm"
                        disabled={!canToggle}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (canToggle && onToggle) {
                                onToggle();
                            }
                        }}
                    >
                        {toggleLabel || (isSelected ? "Equipped" : "Equip")}
                    </Button>
                ) : (
                    isSelected && <span>Weapon armed</span>
                )}
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
    );
};

export default WeaponProfileCard;
