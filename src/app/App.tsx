import React from "react";
import { NavLink, Route, Routes } from "react-router-dom";

import Logo from "./assets/Logo.tsx";

import SidebarNavigation from "#components/SidebarNavigation/SidebarNavigation.tsx";
import Scanlines from "#assets/Scanlines.tsx";

import TheCage from "#modules/Engagements/Octagon.tsx";
import ListsIndex from "#modules/Lists/ListsIndex.tsx";
import ViewList from "#modules/Lists/ViewList.tsx";
import CreateList from "#modules/Lists/CreateList.tsx";
import EngagementIndex from "#modules/Engagements/EngagementIndex.tsx";
import CreateEngagement from "#modules/Engagements/CreateEngagement.tsx";

const bgStyle = {
    opacity: "0.13",
    background:
        "radial-gradient(102.98% 52.72% at 1.84% 2.02%, #A4D065 0%, rgba(10, 26, 19, 0.00) 100%), radial-gradient(38.7% 24.73% at 3.1% 96.61%, #A4D065 0%, rgba(10, 26, 19, 0.00) 100%), radial-gradient(119.5% 64.31% at 98.62% 95.18%, #A4D065 0%, rgba(10, 26, 19, 0.00) 100%), radial-gradient(46.92% 30.92% at 97.19% 3.78%, #A4D065 0%, rgba(10, 26, 19, 0.00) 100%)",
};

export default function App() {
    return (
        <div className="grid grid-cols-[auto_1fr] gap-6 h-[100vh] p-6">
            <div style={bgStyle} className="absolute top-0 left-0 w-full h-full pointer-events-none" />
            <nav className="flex flex-col gap-6">
                <NavLink to="/">
                    <Logo />
                </NavLink>
                <SidebarNavigation />
            </nav>
            <main>
                <Routes>
                    <Route path="/" element={<EngagementIndex />} />
                    <Route path="/engagements">
                        <Route path="new" element={<CreateEngagement />} />
                        {/*<Route path=":engagementId" element={<TheCage />} />*/}
                    </Route>
                    {/*<Route path="/lists">
                        <Route index element={<ListsIndex />} />
                        <Route path=":listId" element={<ViewList />} />
                        <Route path="new" element={<CreateList />} />
                    </Route>*/}
                </Routes>
            </main>
            <Scanlines />
        </div>
    );
}
