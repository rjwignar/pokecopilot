import { useState, useEffect } from "react";
import PokemonListCard from "./PokemonListCard";
import { Pokemon } from "../models/Pokemon";

function PokemonList() {
  const [pokemonArray, setPokemonArray] = useState([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_POKECOPILOT_API_ENDPINT}/api/pokemon`)
      .then((response) => response.json())
      .then((data) => setPokemonArray(data));
  }, []);

  return (
    // <div>
    //   <h1>Pokémon List</h1>
    //   <ul>
    //     {pokemonArray.map((pokemon: Pokemon) => (
    //       <li key={pokemon._id}>{pokemon.name}</li>
    //     ))}
    //   </ul>
    // </div>
    <div>
      <h1>Pokemon</h1>
      <div className="pokemon-list">
        {pokemonArray.map((pokemon : Pokemon) => (
          <PokemonListCard key={pokemon._id} pokemon={pokemon} />
        ))}
      </div>
    </div>
  );
}

export default PokemonList;
