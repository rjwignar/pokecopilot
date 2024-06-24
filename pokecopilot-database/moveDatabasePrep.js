const axios = require('axios');
const fs = require('fs');

// sample poke api starting data from https://pokeapi.co/api/v2/move?limit=3
const moveData = JSON.parse(fs.readFileSync('pokeapiData/moves.json', 'utf-8'));

async function replaceUrls(moveData) {
    moveData.results = await Promise.all(moveData.results.map(async (move) =>{
        const response = await axios.get(move.url);
        return {name : move.name, ...response.data};
    }));
    return moveData;
}

replaceUrls(moveData).then((result) =>{
    const processedData = result.results.map((move) =>{
        // Search for an English effect in effect_entries first, then flavor_text_entries
        let englishEffect = move.effect_entries.find((effect) => effect.language.name === "en")?.effect;
        if (!englishEffect) {
            englishEffect = move.flavor_text_entries && move.flavor_text_entries.find((flavorText) => flavorText.language.name === "en")?.flavor_text;
          }
        return {
            // Don't include id and let MongoDB autoassign _id values
            // Currently all moves listed in pokeAPI exist in main-series games, but this might change in the future
            // _id: move.id,
            name: move.name,
            effect: englishEffect,
            type: move.type.name,
            category: move.damage_class.name,
            power: move.power,
            priority: move.priority,
            power_points_pp: move.pp,
        };
    });

    // Move that don't have an effect in `effect_entries` or `flavor_text_entries` appear to be from spin off games (like Pokemon Legends: Arceus)
    // They may be introduced into the main series games in the future (and have an effect entry or flavor text entry)
    // However, for now let's only include moves that appear in main series games.
    const mainSeriesMoves = processedData.filter(move => move.effect);

    fs.writeFileSync('processedData/moves.json', JSON.stringify(mainSeriesMoves, null, 2));
    console.log('Processed data written to processedData/moves.json');
})