import { Pokemon } from "../models/Pokemon";

interface PokemonCardProps {
  pokemon: Pokemon;
}

const PokemonListCard: React.FC<PokemonCardProps> = ({ pokemon }) => {
  return (
    <div className="bg-gray-800 p-4 mb-4 rounded-lg">
      <div className="flex items-start">
        <img
          src={pokemon.official_art}
          alt={pokemon.name}
          className="w-36 h-36 mr-4"
        />
        <div className="flex flex-col">
          <h2 className="text-2xl font-bold mb-2">{pokemon.name}</h2>
          <div className="flex gap-2 mb-2">
            {pokemon.types.map((type) => (
              <span
                key={type.name}
                className="px-2 py-1 rounded bg-gray-600"
              >
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
          <div className="flex flex-col gap-1 mb-2">
            {pokemon.stats.map((stat) => (
              <div key={stat.name}>
                {stat.name}: {stat.value}
              </div>
            ))}
          </div>
          {/* <div className="mb-2">
            <h3 className="font-semibold">Moves:</h3>
            <ul className="list-disc list-inside">
              {pokemon.moves.map((move) => (
                <li key={move}>{move}</li>
              ))}
            </ul>
          </div> */}
          <div className="flex flex-col gap-1">
            <div>Height: {pokemon.height}</div>
            <div>Weight: {pokemon.weight}</div>
            <div>Base Stat Total: {pokemon.base_stat_total}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PokemonListCard;