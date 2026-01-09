import { Routes, Route, NavLink } from "react-router-dom";

import TheCage from "./pages/TheCage/TheCage";
import { ListManagerLayout } from "./pages/ListManager/ListManagerLayout";
import { ListsOverview } from "./pages/ListManager/ListsOverview";
import { NewList } from "./pages/ListManager/NewList";
import { ListView } from "./pages/ListManager/ListView";

export default function App() {
    return (
        <div className="w-full">
            <nav className="bg-[#2b344c] text-white flex justify-between items-center p-4">
                <h1>Holodeck</h1>
                <div className="flex gap-2">
                    <NavLink to="/" end className={({ isActive }) => (isActive ? "bg-white text-black px-3 py-1 rounded" : "text-[#767676] hover:text-[#999] px-3 py-1")}>
                        Battle Cogitatorium
                    </NavLink>
                    <NavLink to="/lists" className={({ isActive }) => (isActive ? "bg-white text-black px-3 py-1 rounded" : "text-[#767676] hover:text-[#999] px-3 py-1")}>
                        Muster armies
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
        </div>
    );
}
