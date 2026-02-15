import React from "react";

interface Props {
    label: string;
    labelClassName?: string;
}

const SplitHeading = ({ label, labelClassName = "text-blockcaps-s" }: Props) => (
    <div className="flex gap-2 items-center">
        <hr className="grow border-none h-[1px] bg-deathWorldForest" />
        <h3 className={labelClassName}>{label}</h3>
        <hr className="grow border-none h-[1px] bg-deathWorldForest" />
    </div>
);

export default SplitHeading;
