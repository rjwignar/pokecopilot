import { Pokemon } from "../models/Pokemon";

interface PokemonCardProps {
  pokemon: Pokemon;
}

const PokemonListCard: React.FC<PokemonCardProps> = ({ pokemon }) => {
  return (
    <div className="bg-gray-800 p-2 mb-4 rounded-lg">
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
              <span key={type.name} className="px-2 py-1 rounded bg-gray-600">
                {type.name}
              </span>
            ))}
            {pokemon.abilities.map((ability) => (
              <span
                key={ability.name}
                className="px-2 py-1 rounded bg-gray-700"
              >
                {ability.name} {ability.is_hidden && "(Hidden)"}
              </span>
            ))}
            <div className="flex gap-4">
              {pokemon.stats.map((stat) => (
                <div key={stat.name} className="text-center">
                  <div className="font-semibold">{stat.name}</div>
                  <div>{stat.value}</div>
                </div>
              ))}
            </div>
            <div className="text-center">
              <div className="font-semibold">Total</div>
              <div>{pokemon.base_stat_total}</div>
            </div>
            <div className="text-center">
              <div className="font-semibold">Height</div>
              <div>{pokemon.height}</div>
            </div>
            <div className="text-center">
              <div className="font-semibold">Weight</div>
              <div>{pokemon.weight}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PokemonListCard;
