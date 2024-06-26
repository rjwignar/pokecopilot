import { useState, useEffect } from "react";

interface Pokemon {
    _id: number;
    name: string;
    description: string;
  }
  
function PokemonList() {
  const [pokemonArray, setPokemonArray] = useState([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_POKECOPILOT_API_ENDPINT}/api/pokemon`)
      .then((response) => response.json())
      .then((data) => setPokemonArray(data));
  }, []);

  return (
    <div>
      <h1>Pokémon List</h1>
      <ul>
        {pokemonArray.map((pokemon: Pokemon) => (
          <li key={pokemon._id}>{pokemon.name}</li>
        ))}
      </ul>
    </div>
  );
}

export default PokemonList;