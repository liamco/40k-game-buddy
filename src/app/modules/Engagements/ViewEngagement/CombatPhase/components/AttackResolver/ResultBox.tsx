import React from "react";
import { Badge } from "#components/Badge/Badge";

interface ResultBoxProps {
    label?: string;
    value: string;
    modifiers?: { label: string; value: number }[];
    className?: string;
}

function ResultBox({ label, value, modifiers, className }: ResultBoxProps) {
    return (
        <div className={`flex items-center justify-center gap-1 ${className}`}>
            {label && <p className="font-bold text-[10px]">{label}</p>}
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
            <p className="font-bold text-[24px]">{value}</p>
        </div>
    );
}

export default ResultBox;
