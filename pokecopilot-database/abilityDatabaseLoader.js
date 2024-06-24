require('dotenv').config();
const { MongoClient } = require('mongodb');
const fs = require('fs');

async function main() {
    const client = new MongoClient(process.env.MONGODB_URI);
    try {
        await client.connect();
        console.log("Connected to MongoDB");
        const db = client.db('pokecopilot');

        // TO DO - LOAD ABILITY DATA
        // load ability data
        console.log("Loading ability data...");

        // initialize ability collection pointer
        const abilityCollection = db.collection('abilities');
        // load ability data from local file
        const abilityData = JSON.parse(fs.readFileSync('processedData/abilities.json', 'utf-8'));

        // delete any existing ability data
        console.log("Deleting existing abilities");
        await abilityCollection.deleteMany({});

        // BULK LOAD ABILITY DATA
        let abilityResult = await abilityCollection.bulkWrite(
            abilityData.map((ability) => ({
                insertOne: {
                    document: ability
                }
            }))
        );
        console.log(`${abilityResult.insertedCount} abilities inserted`);
    } catch (err) {
        console.error(err);
    } finally {
        await client.close();
        console.log('Disconnected from MongoDB');
    }
}


main().catch(console.error);