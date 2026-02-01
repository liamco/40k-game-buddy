import React, { Fragment } from "react";
import { Badge } from "#components/Badge/Badge";

interface ResultBoxProps {
    value?: string;
    modifiers?: { label: string; value: number }[];
    className?: string;
}

function ResultBox({ value, modifiers, className }: ResultBoxProps) {
    return (
        <div className={`flex col-span-2 items-center justify-center gap-1 ${className}`}>
            {value ? (
                <Fragment>
                    {modifiers && modifiers.length > 0 && modifiers.some((m) => m.value !== 0) && (
                        <div className="flex flex-wrap gap-1 justify-center">
                            {modifiers
                                .filter((m) => m.value !== 0)
                                .map((mod, idx) => (
                                    <Badge key={idx}>
                                        <span>{mod.label}</span>
                                    </Badge>
                                ))}
                        </div>
                    )}
                    <figure className="text-title-l">{value}</figure>
                </Fragment>
            ) : (
                <span>-</span>
            )}
        </div>
    );
}

export default ResultBox;
