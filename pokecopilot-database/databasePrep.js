const axios = require('axios');
const fs = require('fs');

// initial data for all pokemon obtained from https://pokeapi.co/api/v2/pokemon/?limit=1304
/**
 * {
 *  "count": 1302,
 *  "next": null,
 *  "previous": null,
 *  "results": [
 *      {
 *          "name": "bulbasaur",
 *          "url": "https://pokeapi.co/api/v2/pokemon/1/"
 *      },
 *      // ... 1300+ more entries
 *  ]
 * }
 */

// working dataset for processing
/**
 * Information we want:
 * name
 * abilities
 * height
 * id
 * moves
 * sprites-?other->official-artwork->front_default OR
 * sprites->other->showdown->front_default
 * stats
 * types
 * weight
 */
const pokemonData = {
  "count": 1302,
  "next": "https://pokeapi.co/api/v2/pokemon/?offset=10&limit=10",
  "previous": null,
  "results": [
    {
      "name": "bulbasaur",
      "url": "https://pokeapi.co/api/v2/pokemon/1/"
    },
    {
      "name": "ivysaur",
      "url": "https://pokeapi.co/api/v2/pokemon/2/"
    },
    {
      "name": "venusaur",
      "url": "https://pokeapi.co/api/v2/pokemon/3/"
    },
    {
      "name": "charmander",
      "url": "https://pokeapi.co/api/v2/pokemon/4/"
    },
    {
      "name": "charmeleon",
      "url": "https://pokeapi.co/api/v2/pokemon/5/"
    },
    {
      "name": "charizard",
      "url": "https://pokeapi.co/api/v2/pokemon/6/"
    },
  ]
};

async function replaceUrls(pokemonData) {
    pokemonData.results = await Promise.all(pokemonData.results.map(async (pokemon) => {
      const response = await axios.get(pokemon.url);
      return { name: pokemon.name, ...response.data };
    }));
    return pokemonData;
  }

  replaceUrls(pokemonData).then((result) => {
    console.log("result", result);
    console.log("result results", result.results);
    const transform = result.results.map((pokemon) => {
        return {
          name: pokemon.name,
          abilities: pokemon.abilities.map((abilityElement)=> ({
            name: abilityElement.ability.name,
            is_hidden: abilityElement.is_hidden,
            id: parseInt(abilityElement.ability.url.match(/\/(\d+\/)$/)[1], 10),
          })),
          height: pokemon.height,
          id: pokemon.id,
          moves: pokemon.moves.map((move) => move.move),
          official_art: pokemon.sprites.other['official-artwork']['front_default'],
          showdown_gif: pokemon.sprites.other['showdown']['front_default'],
          stats: pokemon.stats,
          types: pokemon.types,
          weight: pokemon.weight
        };
      });

      console.log("transformedData", transform);
    fs.writeFileSync('pokemonData.json', JSON.stringify(result, null, 2));
    fs.writeFileSync('transform.json', JSON.stringify(transform,null, 2));
    console.log('Data written to pokemonData.json');
  });
  