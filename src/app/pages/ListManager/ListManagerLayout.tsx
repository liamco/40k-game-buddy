import { Outlet } from "react-router-dom";
import { ListManagerProvider } from "./ListManagerContext";

export function ListManagerLayout() {
    return (
        <ListManagerProvider>
            <div className="min-h-screen bg-[#f5f5f5] p-6">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold mb-2">Army Lists</h1>
                    <p className="text-[#767676]">Create and manage your army lists</p>
                </div>
                <Outlet />
            </div>
        </ListManagerProvider>
    );
}

export default ListManagerLayout;
