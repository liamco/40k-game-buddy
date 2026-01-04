import React from 'react';
import type { Stratagem } from "../../types";

interface Props {
    stratagem: Stratagem;
}

export const StratagemCard = ({ stratagem }: Props) => {
    return (

        <div className="bg-[#ccc] rounded-[4px] p-2 space-y-2">
            <div className="flex items-center gap-2 flex-1">
                <p className=" font-bold text-[14px] ">
                    {stratagem.name}
                </p>
                <div className="bg-[#b3b3b3] px-1 py-0.5 rounded-[2px]">
                    <p className=" font-bold text-[8px]  uppercase">
                        {stratagem.cpCost}CP
                    </p>
                </div>
            </div>
            <div>
                <p className="text-[12px]">
                    {stratagem.legend}
                </p>
            </div>
        </div>
    )
}

export default StratagemCard;