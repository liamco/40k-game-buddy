import React from "react";

interface Props {
    className?: string;
    value: string;
}

const FinalResultBox = ({ className = "bg-fireDragonBright text-mournfangBrown", value }: Props) => {
    return (
        <div className={`${className} bg-fireDragonBright text-mournfangBrown col-span-2 rounded px-4 flex items-center justify-center`}>
            <figure className={`text-counter-l`}>{value}</figure>
        </div>
    );
};

export default FinalResultBox;
