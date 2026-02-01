import React from "react";

import type { CriticalEffect } from "#game-engine/types/ModifierResult";

import BaseIcon from "#components/icons/BaseIcon";
import IconSkull from "#components/icons/IconSkull";

interface Props {
    className?: string;
    value: string;
    isCritical?: boolean;
}

const FinalResultBox = ({ className = "bg-fireDragonBright text-mournfangBrown", value, isCritical }: Props) => {
    return (
        <div className={`${className} relative col-span-3 h-full bg-fireDragonBright text-mournfangBrown rounded px-4 flex items-center justify-center gap-1`}>
            <figure className="text-title-l">{value}</figure>
            {isCritical && (
                <BaseIcon color="mournfangBrown" size="large">
                    <IconSkull />
                </BaseIcon>
            )}
        </div>
    );
};

export default FinalResultBox;
