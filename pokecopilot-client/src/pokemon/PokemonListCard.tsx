import { Pokemon } from "../models/Pokemon";

interface PokemonCardProps {
  pokemon: Pokemon;
}

const PokemonListCard: React.FC<PokemonCardProps> = ({ pokemon }) => {
  return (
    <div className="pokemon-card">
      <div className="pokemon-header">
        <img src={pokemon.official_art} alt={pokemon.name} />
        <h2>{pokemon.name}</h2>
        <div className="pokemon-types">
          {pokemon.types.map((type) => (
            <span key={type.name} className={`type ${type.name.toLowerCase()}`}>
              {type.name}
            </span>
          ))}
        </div>
      </div>
      <div className="pokemon-abilities">
        {pokemon.abilities.map((ability) => (
          <span key={ability.name} className="ability">
            {ability.name} {ability.is_hidden && '(Hidden)'}
          </span>
        ))}
      </div>
      <div className="pokemon-stats">
        {pokemon.stats.map((stat) => (
          <div key={stat.name}>
            {stat.name}: {stat.value}
          </div>
        ))}
      </div>
      {/* <div className="pokemon-moves">
        <h3>Moves:</h3>
        <ul>
          {pokemon.moves.map((move) => (
            <li key={move}>{move}</li>
          ))}
        </ul>
      </div> */}
      <div className="pokemon-info">
        <div>Height: {pokemon.height}</div>
        <div>Weight: {pokemon.weight}</div>
        <div>Base Stat Total: {pokemon.base_stat_total}</div>
      </div>
    </div>
  );
};

export default PokemonListCard;