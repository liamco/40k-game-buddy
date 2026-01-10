import React from "react";

interface Props {
    className?: string;
    value: string;
}

const FinalResultBox = ({ className = "bg-fireDragonBright text-mournfangBrown", value }: Props) => {
    return (
        <div className={`${className} col-span-2 rounded px-4 flex items-center justify-center`}>
            <figure className={`leading-none text-counter-l ${className === "bg-amber-300" ? "" : ""}`}>{value}</figure>
        </div>
    );
};

export default FinalResultBox;
