// src/pages/PokemonDetails.tsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Pokemon } from '../models/Pokemon';

const PokemonDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_POKECOPILOT_API_ENDPINT}/api/pokemon/${id}`)
      .then((response) => response.json())
      .then((data) => setPokemon(data))
      .catch((error) => console.error('Error fetching Pokémon:', error));
  }, [id]);

  if (!pokemon) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-8 bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-8">{pokemon.name}</h1>
      <img src={pokemon.official_art} alt={pokemon.name} className="w-36 h-36 mb-4" />
      <div className="flex gap-2 mb-2">
        {pokemon.types.map((type) => (
          <span key={type.name} className="px-2 py-1 rounded bg-gray-600">
            {type.name}
          </span>
        ))}
      </div>
      <div className="flex gap-2 mb-2">
        {pokemon.abilities.map((ability) => (
          <span key={ability.name} className="px-2 py-1 rounded bg-gray-700">
            {ability.name} {ability.is_hidden && '(Hidden)'}
          </span>
        ))}
      </div>
      <div className="flex flex-wrap gap-4">
        {pokemon.stats.map((stat) => (
          <div key={stat.name} className="text-center">
            <div className="font-semibold">{stat.name}</div>
            <div>{stat.value}</div>
          </div>
        ))}
      </div>
      <div className="flex gap-4 mt-2">
        <div className="text-center">
          <div className="font-semibold">Height</div>
          <div>{pokemon.height}</div>
        </div>
        <div className="text-center">
          <div className="font-semibold">Weight</div>
          <div>{pokemon.weight}</div>
        </div>
        <div className="text-center">
          <div className="font-semibold">Base Stat Total</div>
          <div>{pokemon.base_stat_total}</div>
        </div>
      </div>
      <div className="mt-2">
        <h3 className="font-semibold">Moves:</h3>
        <ul className="list-disc list-inside">
          {pokemon.moves.map((move) => (
            <li key={move}>{move}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PokemonDetails;