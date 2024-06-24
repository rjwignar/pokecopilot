require('dotenv').config();
const { MongoClient } = require('mongodb');
const fs = require('fs');

async function main() {
    const client = new MongoClient(process.env.MONGODB_URI);
    try {
        await client.connect();
        console.log("Connected to MongoDB");
        const db = client.db('pokecopilot');

        // DONE - LOAD MOVE DATA
        // load move data
        console.log("Loading move data...");

        // initialize move collection pointer
        const moveCollection = db.collection('moves');
        // load move data from local file
        const moveData = JSON.parse(fs.readFileSync('processedData/moves.json', 'utf-8'));

        // delete any existing move data
        console.log("Deleting existing moves");
        await moveCollection.deleteMany({});

        // BULK LOAD MOVE DATA
        let moveResult = await moveCollection.bulkWrite(
            moveData.map((move) => ({
                insertOne: {
                    document: move
                }
            }))
        );
        console.log(`${moveResult.insertedCount} moves inserted`);
    } catch (err) {
        console.error(err);
    } finally {
        await client.close();
        console.log('Disconnected from MongoDB');
    }
}


main().catch(console.error);