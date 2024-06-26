// import React from "react";

import Chat from "../pages/chat/Chat";
import PokemonList from "../pokemon/PokemonList";

const ChatAndPokemonList = () => {
    return (
        <div className="flex w-full h-screen">
            <div className="w-9/10 border-r border-gray-300">
                <PokemonList />
            </div>
            <div className="w-1/10">
                <Chat />
            </div>
        </div>
    );
};

export default ChatAndPokemonList;
