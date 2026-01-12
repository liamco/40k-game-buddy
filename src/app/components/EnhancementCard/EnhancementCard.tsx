import React from "react";

import type { Enhancement } from "../../types";
import BaseIcon from "../icons/BaseIcon";
import IconLaurels from "../icons/IconLaurels";

interface Props {
    enhancement: Enhancement;
    showPoints?: boolean;
    showLegend?: boolean;
}

const EnhancementCard = ({ enhancement, showPoints, showLegend }: Props) => {
    return (
        <div className="border-1 border-skarsnikGreen rounded p-3 space-y-2">
            <div className="flex items-center gap-2">
                <BaseIcon>
                    <IconLaurels />
                </BaseIcon>
                <span className="text-metadata-l text-skarsnikGreen">{enhancement.name}</span>
                {enhancement.cost && showPoints && <span className="text-metadata-s text-skarsnikGreen">{enhancement.cost}pts</span>}
            </div>
            {enhancement.legend && showLegend && <p className="text-body-s text-skarsnikGreen italic">{enhancement.legend}</p>}
            {enhancement.description && (
                <p
                    className="text-skarsnikGreen"
                    dangerouslySetInnerHTML={{
                        __html: enhancement.description.replace(/<span[^>]*class="[^"]*tooltip[^"]*"[^>]*>/g, "<span>").replace(/<span[^>]*data-tooltip[^>]*>/g, "<span>"),
                    }}
                />
            )}
        </div>
    );
};

export default EnhancementCard;
