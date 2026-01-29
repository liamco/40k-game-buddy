import React from "react";

interface Props {
    className?: string;
    value: string;
}

const FinalResultBox = ({ className = "bg-fireDragonBright text-mournfangBrown", value }: Props) => {
    return (
        <div className={`${className} h-full bg-fireDragonBright text-mournfangBrown rounded px-4 flex items-center justify-center`}>
            <figure className={`text-title-m`}>{value}</figure>
        </div>
    );
};

export default FinalResultBox;
