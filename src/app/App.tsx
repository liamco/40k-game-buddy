import { Routes, Route, NavLink } from "react-router-dom";

import { buttonClasses } from "./components/_ui/button";

import TheCage from "./pages/TheCage/TheCage";
import { ListManagerLayout } from "./pages/ListManager/ListManagerLayout";
import { ListsOverview } from "./pages/ListManager/ListsOverview";
import { NewList } from "./pages/ListManager/NewList";
import { ListView } from "./pages/ListManager/ListView";
import Scanlines from "./components/ScanLines/Scanlines";

import Logo from "./assets/Logo.tsx";

const bgStyle = { opacity: "0.13", background: "radial-gradient(102.98% 52.72% at 1.84% 2.02%, #A4D065 0%, rgba(10, 26, 19, 0.00) 100%), radial-gradient(38.7% 24.73% at 3.1% 96.61%, #A4D065 0%, rgba(10, 26, 19, 0.00) 100%), radial-gradient(119.5% 64.31% at 98.62% 95.18%, #A4D065 0%, rgba(10, 26, 19, 0.00) 100%), radial-gradient(46.92% 30.92% at 97.19% 3.78%, #A4D065 0%, rgba(10, 26, 19, 0.00) 100%)" };

export default function App() {
    return (
        <div className="w-full bg-nocturneGreen text-skarsnikGreen">
            <div style={bgStyle} className="fixed pointer-events-none w-full h-full top-0 bottom-0 left-0 right-0" />
            <nav className="flex justify-between items-center p-6">
                <div className="flex w-[300px] gap-4 items-end">
                    <h1 className="text-blockcaps--xxl text-shadow-glow-green">Parp Boy</h1>
                    <span className="text-metadata-m text-shadow-glow-green">v1.027586</span>
                </div>
                <div className="grow-999 flex justify-center">
                    <Logo />
                </div>
                <div className="flex w-[300px] gap-2 justify-end">
                    <NavLink to="/" end className={({ isActive }) => (isActive ? buttonClasses.secondary : buttonClasses.ghost)}>
                        {({ isActive }) => <span className={`text-blockcaps-m ${!isActive ? "text-shadow-glow-green" : ""}`}>Combat analysis</span>}
                    </NavLink>
                    <NavLink to="/lists" className={({ isActive }) => (isActive ? buttonClasses.secondary : buttonClasses.ghost)}>
                        {({ isActive }) => <span className={`text-blockcaps-m ${!isActive ? "text-shadow-glow-green" : ""}`}>Army roster</span>}
                    </NavLink>
                </div>
            </nav>
            <Routes>
                <Route path="/" element={<TheCage />} />
                <Route path="/lists" element={<ListManagerLayout />}>
                    <Route index element={<ListsOverview />} />
                    <Route path="new" element={<NewList />} />
                    <Route path="view/:listId" element={<ListView />} />
                </Route>
            </Routes>
            <Scanlines />
        </div>
    );
}
