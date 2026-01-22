import React from "react";

import type { Enhancement } from "../../types";
import BaseIcon from "../icons/BaseIcon";
import IconLaurels from "../icons/IconLaurels";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../_ui/collapsible";
import { ChevronDown } from "lucide-react";
import { Badge } from "../_ui/badge";
import { Button } from "../_ui/button";

interface Props {
    enhancement: Enhancement;
    showPoints?: boolean;
    showLegend?: boolean;
    isActive?: boolean;
    isAttached?: boolean;
    usedBy?: string;
    isUsedByOther?: boolean;
    handleAttachEnhancement?: (enhancement: { id: string; name: string; cost?: number }) => void;
}

const EnhancementCard = ({ enhancement, showPoints, showLegend, handleAttachEnhancement, isAttached, usedBy, isUsedByOther }: Props) => {
    return (
        <div className={`border-1 rounded p-3 space-y-2 ${isAttached ? "bg-skarsnikGreen text-deathWorldForest" : "border-skarsnikGreen "}`}>
            <div className="flex items-center gap-2 justify-between">
                <div className="flex items-center gap-2">
                    <BaseIcon color={isAttached ? "deathWorldForest" : "default"}>
                        <IconLaurels />
                    </BaseIcon>
                    <span className="text-metadata-l ">{enhancement.name}</span>
                    {enhancement.cost && showPoints && (
                        <Badge variant="outline">
                            <span className="text-metadata-s ">{enhancement.cost}pts</span>
                        </Badge>
                    )}
                </div>
                {isUsedByOther && (
                    <Badge variant="secondary">
                        <span className="text-metadata-s ">Used by {usedBy}</span>
                    </Badge>
                )}
                {handleAttachEnhancement && !isUsedByOther && (
                    <Button
                        variant={isAttached ? "outline" : "default"}
                        size="sm"
                        className="h-8"
                        disabled={isUsedByOther}
                        onClick={() => {
                            handleAttachEnhancement({
                                id: enhancement.id,
                                name: enhancement.name,
                                cost: enhancement.cost,
                            });
                        }}
                    >
                        {isAttached ? "Remove" : "Equip"}
                    </Button>
                )}
            </div>
            {enhancement.legend && showLegend && (
                <Collapsible defaultOpen={false}>
                    <CollapsibleTrigger className="flex items-center gap-1 group">
                        <ChevronDown className="h-3 w-3 transition-transform group-data-[state=open]:rotate-180" />
                        <span>Show lore</span>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <p className="italic">{enhancement.legend}</p>
                    </CollapsibleContent>
                </Collapsible>
            )}
            {enhancement.description && (
                <p
                    dangerouslySetInnerHTML={{
                        __html: enhancement.description.replace(/<span[^>]*class="[^"]*tooltip[^"]*"[^>]*>/g, "<span>").replace(/<span[^>]*data-tooltip[^>]*>/g, "<span>"),
                    }}
                />
            )}
        </div>
    );
};

export default EnhancementCard;
