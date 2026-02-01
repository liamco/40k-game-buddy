import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./app/App.tsx";
import { ListManagerProvider } from "./app/modules/Lists/ListManagerContext.tsx";
import "./styles/index.css";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <BrowserRouter>
            <ListManagerProvider>
                <App />
            </ListManagerProvider>
        </BrowserRouter>
    </StrictMode>
);
