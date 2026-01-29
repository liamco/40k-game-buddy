import { Outlet } from "react-router-dom";
import { ListManagerProvider } from "./ListManagerContext";

export function ListManagerLayout() {
    return (
        <ListManagerProvider>
            <Outlet />
        </ListManagerProvider>
    );
}

export default ListManagerLayout;
