import React from "react";

function ModifierBadge({ label, value, className }: { label: string; value?: number; className?: string }) {
    const isPositive = value !== undefined && value > 0;
    const bgColor = isPositive ? "bg-green-200" : value !== undefined && value < 0 ? "bg-red-200" : "bg-[#b3b3b3]";

    return (
        <div className={`${bgColor} px-1.5 py-0.5 rounded-[2px] ${className || ""}`} title={label}>
            <p className="font-bold text-[8px] uppercase">{label}</p>
        </div>
    );
}

interface ResultBoxProps {
    label?: string;
    value: string;
    modifiers?: { label: string; value: number }[];
}

function ResultBox({ label, value, modifiers }: ResultBoxProps) {
    return (
        <div className="col-span-2 flex items-center justify-center gap-1">
            {label && <p className="font-bold text-[10px]">{label}</p>}
            {modifiers && modifiers.length > 0 && modifiers.some((m) => m.value !== 0) && (
                <div className="flex flex-wrap gap-1 justify-center">
                    {modifiers
                        .filter((m) => m.value !== 0)
                        .map((mod, idx) => (
                            <ModifierBadge key={idx} label={mod.label} value={mod.value} />
                        ))}
                </div>
            )}
            <p className="font-bold text-[24px]">{value}</p>
        </div>
    );
}

export default ResultBox;
