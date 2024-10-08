require('dotenv').config();
const { MongoClient } = require('mongodb');
// Import AzureOpenAI Client and Azure Key Credential Classes
const { OpenAIClient, AzureKeyCredential } = require("@azure/openai");
// set up the MongoDB client
const dbClient = new MongoClient(process.env.MONGODB_URI);
// set up the Azure OpenAI client 
const embeddingsDeploymentName = "embeddings";
const completionsDeploymentName = "completions";
const aoaiClient = new OpenAIClient(process.env.AOAI_ENDPOINT, new AzureKeyCredential(process.env.AOAI_KEY));

const GROOKEY = 810;
const PECHARUNT = 1025;
async function main() {
    try {
        await dbClient.connect();
        console.log('Connected to MongoDB');
        const db = dbClient.db('pokecopilot');

        // // vectorize and store embeddings in each document in pokemon, abilities, and moves collections
        // await addCollectionContentVectorField(db, 'pokemon'); // COMPLETE
        // await addCollectionContentVectorField(db, 'abilities'); // COMPLETE
        // await addCollectionContentVectorField(db, 'moves'); // COMPLETE


        // // VECTOR SEARCH IN VCORE-BASED AZURE COSMOS DB FOR MONGO
        // // vector search 3 most powerful fire-type moves
        // const searchResults = await vectorSearch(db, 'moves', 'Give me the three most powerful fire-type moves');    
        // searchResults.forEach(printProductSearchResult);

        // VECTOR SEARCH IN RETRIEVAL AUGMENTED GENERATION (RAG) PATTERN
        // RAG with vector search for the top 3 most relevant products
        // console.log(await ragWithVectorsearch(db, 'moves', 'What dragon type moves deal the most special damage?', 3));


    } catch (err) {
        console.error(err);
    } finally {
        await dbClient.close();
        console.log('Disconnected from MongoDB');
    }
}

async function generateEmbeddings(text) {
    const embeddings = await aoaiClient.getEmbeddings(embeddingsDeploymentName, text);
    // Rest period to avoid rate limiting on Azure OpenAI  
    await new Promise(resolve => setTimeout(resolve, 500));
    return embeddings.data[0].embedding;
}

async function addCollectionContentVectorField(db, collectionName) {
    const collection = db.collection(collectionName);
    const docs = await collection.find({}).toArray();
    const bulkOperations = [];
    console.log(`Generating content vectors for ${docs.length} documents in ${collectionName} collection`);
    for (let i = 0; i < docs.length; i++) {
        const doc = docs[i];
        // do not include contentVector field in the content to be embedded
        if ('contentVector' in doc) {
            delete doc['contentVector'];
        }
        const content = JSON.stringify(doc);
        const contentVector = await generateEmbeddings(content);
        bulkOperations.push({
            updateOne: {
                filter: { '_id': doc['_id'] },
                update: { '$set': { 'contentVector': contentVector } },
                upsert: true
            }
        });
        //output progress every 1 documents
        if ((i + 1) % 1 === 0 || i === docs.length - 1) {
            console.log(`Generated ${i + 1} content vectors of ${docs.length} in the ${collectionName} collection`);
        }
    }
    if (bulkOperations.length > 0) {
        console.log(`Persisting the generated content vectors in the ${collectionName} collection using bulkWrite upserts`);
        await collection.bulkWrite(bulkOperations);
        console.log(`Finished persisting the content vectors to the ${collectionName} collection`);
    }

    //check to see if the vector index already exists on the collection
    console.log(`Checking if vector index exists in the ${collectionName} collection`)
    const vectorIndexExists = await collection.indexExists('VectorSearchIndex');
    if (!vectorIndexExists) {
        await db.command({
            "createIndexes": collectionName,
            "indexes": [
                {
                    "name": "VectorSearchIndex",
                    "key": {
                        "contentVector": "cosmosSearch"
                    },
                    "cosmosSearchOptions": {
                        "kind": "vector-ivf",
                        "numLists": 1,
                        "similarity": "COS",
                        "dimensions": 1536
                    }
                }
            ]
        });
        console.log(`Created vector index on contentVector field on ${collectionName} collection`);
    }
    else {
        console.log(`Vector index already exists on contentVector field in the ${collectionName} collection`);
    }
}

// // VECTOR SEARCH IN VCORE-BASED AZURE COSMOS DB FOR MONGO (NO RAG)
async function vectorSearch(db, collectionName, query, numResults = 3) {
    const collection = db.collection(collectionName);
    // generate the embedding for incoming question
    console.log("Query inputted: " + query);
    const queryEmbedding = await generateEmbeddings(query);

    const pipeline = [
        {
            '$search': {
                "cosmosSearch": {
                    "vector": queryEmbedding,
                    "path": "contentVector",
                    "k": numResults
                },
                "returnStoredSource": true
            }
        },
        { '$project': { 'similarityScore': { '$meta': 'searchScore' }, 'document': '$$ROOT' } }
    ];

    //perform vector search and return the results as an array
    const results = await collection.aggregate(pipeline).toArray();
    return results;
}

function printProductSearchResult(result) {
    // Print the search result document in a readable format  
    console.log(`Similarity Score: ${result['similarityScore']}`);
    console.log(`Name: ${result['document']['name']}`);
    console.log(`Type: ${result['document']['type']}`);
    console.log(`Category: ${result['document']['category']}`);
    console.log(`Effect: ${result['document']['effect']}`);
    console.log(`Base Power: ${result['document']['power']}`);
    console.log(`_id: ${result['document']['_id']}\n`);
}

// VECTOR SEARCH IN RETRIEVAL AUGMENTED GENERATION (RAG) PATTERN
async function ragWithVectorsearch(db, collectionName, question, numResults = 3) {
    //A system prompt describes the responsibilities, instructions, and persona of the AI.
    const systemPrompt = `
        You are a helpful, fun and friendly coach for Pokémon competitive play
        Your name is Pokécopilot.
        You are designed to answer questions about Pokémon competitive play, specifically regarding Pokémon, moves, and abilities
        
        Only answer questions related to the information provided in the list of Pokémon, moves, or abilities below that are represented
        in JSON format.

        When asked questions like "most powerful move" or "lowest base stat total", pay attention to the values of the criteria given
        
        If you are asked a question that is not in the list, respond with "I don't know."
        
        List of Pokémon, moves, or abilities:
    `;
    const collection = db.collection(collectionName);
    //generate vector embeddings for the incoming question
    const queryEmbedding = await generateEmbeddings(question);
    //perform vector search and return the results
    results = await vectorSearch(db, collectionName, question, numResults);
    productList = "";
    //remove contentVector from the results, create a string of the results for the prompt
    for (const result of results) {
        delete result['document']['contentVector'];
        productList += JSON.stringify(result['document']) + "\n\n";
    }

    //assemble the prompt for the large language model (LLM)
    const formattedPrompt = systemPrompt + productList;
    //prepare messages for the LLM call, TODO: if message history is desired, add them to this messages array
    const messages = [
        {
            "role": "system",
            "content": formattedPrompt
        },
        {
            "role": "user",
            "content": question
        }
    ];

    //call the Azure OpenAI model to get the completion and return the response
    const completion = await aoaiClient.getChatCompletions(completionsDeploymentName, messages);
    return completion.choices[0].message.content;
}

main().catch(console.error);