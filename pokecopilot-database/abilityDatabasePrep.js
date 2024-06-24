const axios = require('axios');
const fs = require('fs');

const abilityData = {
    "count": 367,
    "next": "https://pokeapi.co/api/v2/ability?offset=20&limit=20",
    "previous": null,
    "results": [
        {
            "name": "stench",
            "url": "https://pokeapi.co/api/v2/ability/1/"
        },
        {
            "name": "drizzle",
            "url": "https://pokeapi.co/api/v2/ability/2/"
        },
        {
            "name": "speed-boost",
            "url": "https://pokeapi.co/api/v2/ability/3/"
        }
    ]
};

async function replaceUrls(abilityData) {
    abilityData.results = await Promise.all(abilityData.results.map(async (ability) =>{
        const response = await axios.get(ability.url);
        return {name : ability.name, ...response.data};
    }));
    return abilityData;
}

replaceUrls(abilityData).then((result) =>{
    let processedData = result.results.map((ability) =>{
        const englishEffect = ability.effect_entries.find((effect) => effect.language.name === "en")?.effect;
        return {
            _id: ability.id,
            name: ability.name,
            effect: englishEffect,
            generation: ability.generation.name,
            is_main_series: ability.is_main_series,
        };
    });

    // TO-DO: remove entries where is_main_series is false
    // TO-DO: remove is_main_series property
    fs.writeFileSync('processedData/abilities.json', JSON.stringify(processedData, null, 2));
    console.log('Processed data written to processedData/abilities.json');
})