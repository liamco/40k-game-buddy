import React from "react";
import BaseIcon from "../icons/BaseIcon";
import IconCrossedSwords from "../icons/IconCrossedSwords";
import IconSkull from "../icons/IconSkull";

enum Variants {
    "default" = "skarsnikGreen",
    "orange" = "fireDragonBright",
    "red" = "wildRiderRed",
}

interface Props {
    label: string;
    leadingIcon: React.ReactNode;
    variant?: keyof typeof Variants;
}

const EmptyState = ({ leadingIcon, label, variant = "default" }: Props) => {
    return (
        <div className="col-span-5 h-full flex items-center justify-center">
            <div>
                <div className="flex gap-2 items-center mb-2">
                    <hr className={`grow border-none h-[1px] bg-${Variants[variant]}`} />
                    {leadingIcon && <BaseIcon color={Variants[variant]}>{leadingIcon}</BaseIcon>}
                    <hr className={`grow border-none h-[1px] bg-${Variants[variant]}`} />
                </div>
                <div className="flex items-center gap-4">
                    <span>+++</span>
                    <span className="text-blockcaps-m">{label}</span>
                    <span>+++</span>
                </div>
                <div className="flex gap-2 items-center mt-3">
                    <hr className={`grow border-none h-[1px] bg-${Variants[variant]}`} />
                    <BaseIcon size="small" color={Variants[variant]}>
                        <IconSkull />
                    </BaseIcon>
                    <hr className={`grow border-none h-[1px] bg-${Variants[variant]}`} />
                </div>
            </div>
        </div>
    );
};

export default EmptyState;
