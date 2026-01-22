import React from "react";

import { buttonClasses } from "#components/_ui/button.tsx";
import { NavLink } from "react-router-dom";

const EngagementIndex = () => {
    return (
        <div className="space-y-4 w-full h-full items-center justify-center flex flex-col border-1 border-skarsnikGreen">
            <h1>Ongoing engagements</h1>
            <NavLink to="/engagements/new" className={buttonClasses.primary}>
                New engagement
            </NavLink>
        </div>
    );
};

export default EngagementIndex;
