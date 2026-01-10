import { Outlet } from "react-router-dom";
import { ListManagerProvider } from "./ListManagerContext";

export function ListManagerLayout() {
    return (
        <ListManagerProvider>
            <div className="min-h-screen p-6">
                <Outlet />
            </div>
        </ListManagerProvider>
    );
}

export default ListManagerLayout;
