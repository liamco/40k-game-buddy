import React from "react";
import { WeaponProfile } from "../../types";
import { Badge } from "../_ui/badge";

interface Props {
    profile: WeaponProfile;
    isSelected: boolean;
    onWeaponProfileChange: (profile: WeaponProfile | null) => void;
}

const WeaponProfileCard = ({ profile, isSelected, onWeaponProfileChange }: Props) => {
    return (
        <div key={profile.name} className={`rounded p-2 space-y-2 cursor-pointer border-1 transition-colors border-skarsnikGreen ${isSelected ? "bg-skarsnikGreen shadow-glow-green text-deathWorldForest" : "text-skarsnikGreen"}`} onClick={() => onWeaponProfileChange(profile)}>
            <div className="flex items-center justify-between">
                <span className="text-metadata-l">{profile.name}</span>
                {isSelected && <span>Weapon armed</span>}
            </div>

            {profile.attributes && (
                <div className="flex gap-2">
                    {profile.attributes.map((attr: string) => (
                        <Badge key={attr} variant={isSelected ? "secondary" : "default"}>
                            {attr}
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
                <span className="text-profile-attribute">{profile.range > 0 ? profile.range : "Melee"}</span>
                <span className="text-profile-attribute">{profile.a}</span>
                <span className="text-profile-attribute">
                    {profile.bsWs}
                    {profile.bsWs != "N/A" ? "+" : ""}
                </span>
                <span className="text-profile-attribute">{profile.s}</span>
                <span className="text-profile-attribute">{profile.ap}</span>
                <span className="text-profile-attribute">{profile.d}</span>
            </div>
        </div>
    );
};

export default WeaponProfileCard;
