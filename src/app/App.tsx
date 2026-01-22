import React from "react";
import Logo from "./assets/Logo.tsx";

import SidebarNavigation from "#components/SidebarNavigation/SidebarNavigation.tsx";

export default function App() {
    return (
        <div className="grid grid-rows-[auto_1fr] gap-6">
            <nav className="flex flex-col gap-6">
                <Logo />
                <SidebarNavigation />
            </nav>
            <main></main>
        </div>
    );
}
