import React from 'react';
import { WeaponProfile } from '../../types';

interface Props {
    profile: WeaponProfile;
    isSelected: boolean;
    onWeaponProfileChange: (profile: WeaponProfile | null) => void;
}

const WeaponProfileCard = ({ profile, isSelected, onWeaponProfileChange }:Props) => {
    return (
        <div
            key={profile.name}
            className={`bg-[#ccc] rounded-[4px] p-2 space-y-2 cursor-pointer border-2 transition-colors ${
                isSelected ? "border-[#2b344c]" : "border-transparent"
            }`}
            onClick={() => onWeaponProfileChange(isSelected ? null : profile)}
        >
            <div className="flex items-center justify-between">
                <p className=" font-bold text-[12px] ">
                    {profile.name}
                </p>
                <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        isSelected
                            ? "border-[#2c2c2c] bg-[#e6e6e6]"
                            : "border-[#757575] bg-white"
                    }`}
                >
                    {isSelected && (
                        <div className="w-2.5 h-2.5 rounded-full bg-[#1e1e1e]" />
                    )}
                </div>
            </div>

            {
                (profile.attributes) &&
                <div className="flex gap-2">
                    {
                        profile.attributes.map((attr:string)=>(
                            <span key={attr} className="text-[10px] font-bold uppercase p-1 px-2 rounded-s bg-[#B3B3B3]">{attr}</span>
                        ))
                    }
                </div>
            }

            <div className="grid grid-cols-6 gap-1 text-center">
                <div>
                    <p className=" font-bold text-[12px] ">
                        Range
                    </p>
                </div>
                <div>
                    <p className=" font-bold text-[12px] ">
                        A
                    </p>
                </div>
                <div>
                    <p className=" font-bold text-[12px] ">
                        BS
                    </p>
                </div>
                <div>
                    <p className=" font-bold text-[12px] ">
                        S
                    </p>
                </div>
                <div>
                    <p className=" font-bold text-[12px] ">
                        AP
                    </p>
                </div>
                <div>
                    <p className=" font-bold text-[12px] ">
                        D
                    </p>
                </div>
            </div>
            
            <div className="grid grid-cols-6 gap-1 text-center">
                <p className=" font-bold text-[12px] ">
                    {profile.range > 0 ? profile.range : "Melee"}
                </p>
                <p className=" font-bold text-[12px] ">
                    {profile.a}
                </p>
                <p className=" font-bold text-[12px] ">
                    {profile.bsWs}{(profile.bsWs != 'N/A')?'+':''}
                </p>
                <p className=" font-bold text-[12px] ">
                    {profile.s}
                </p>
                <p className=" font-bold text-[12px] ">
                    {profile.ap}
                </p>
                <p className=" font-bold text-[12px] ">
                    {profile.d}
                </p>
            </div>
            
        </div>
    )
}

export default WeaponProfileCard;