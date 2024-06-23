require('dotenv').config();
const { MongoClient } = require('mongodb');
const fs = require('fs');

async function main() {
    const client = new MongoClient(process.env.MONGODB_URI);
    try {
        await client.connect();
        console.log("Connected to MongoDB");
        const db = client.db('pokemon');
        // load pokemon data
        console.log("Loading pokemon data...");
        // Initialize pokemon collection pointer (will be auto-created if it doesn't exist)
        const pokemonCollection = db.collection('pokemon');
        // Load pokemon data from local file
        const pokemonData = JSON.parse(fs.readFileSync('processedData/pokemon.json', 'utf-8'));

        // Delete any existing pokemon data so we can run this many times without duplicates
        console.log("Deleting existing pokemon");
        await pokemonCollection.deleteMany({});

        // TO-DO: Bulk Load
        let result = await pokemonCollection.bulkWrite(
            pokemonData.map((pokemon) => ({
                insertOne: {
                    document: pokemon
                }
            }))
        );
        console.log(`${result.insertedCount} pokemon inserted`);
    } catch (err) {
        console.error(err);
    } finally {
        await client.close();
        console.log('Disconnected from MongoDB');
    }
}


main().catch(console.error);