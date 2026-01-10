import React from "react";

interface Props {
    label: string;
}

const SplitHeading = ({ label }: Props) => (
    <div className="flex gap-2 items-center">
        <hr className="grow border-none h-[1px] bg-skarsnikGreen" />
        <h3 className="text-blockcaps-s">{label}</h3>
        <hr className="grow border-none h-[1px] bg-skarsnikGreen" />
    </div>
);

export default SplitHeading;
