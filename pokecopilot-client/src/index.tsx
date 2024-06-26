import React from "react";
import ReactDOM from "react-dom/client";
import { createHashRouter, RouterProvider } from "react-router-dom";
import { initializeIcons } from "@fluentui/react";
import { MsalProvider } from "@azure/msal-react";
import { PublicClientApplication, EventType, AccountInfo } from "@azure/msal-browser";

import "./index.css";

import Layout from "./pages/layout/Layout";
import Chat from "./pages/chat/Chat";
import PokemonList from "./pokemon/PokemonList";
import PokemonDetails from "./pokemon/PokemonDetails";
import ChatAndPokemonList from "./components/ChatAndPokemonList";

var layout;

layout = <Layout />;

initializeIcons();

const router = createHashRouter([
    {
        path: "/",
        element: layout,
        children: [
            {
                index: true,
                // element: <Chat />
                element: <ChatAndPokemonList />
            },
            {
                path: "pokemon",
                children: [
                    {
                        index: true,
                        element: <PokemonList />
                    },
                    {
                        path: ":id",
                        element: <PokemonDetails />
                    }
                ]
            },
            {
                path: "*",
                lazy: () => import("./pages/NoPage")
            }
        ]
    }
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>
);
