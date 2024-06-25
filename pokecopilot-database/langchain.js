require('dotenv').config();
const { MongoClient } = require('mongodb');

// Import LangChain packages
// AzureCosmosDBVectorStore represents vector index in collection
// AzureCosmosDBSimilarityType performs vector search using cosine similarity
// OpenAIEmbeddings class generates embeddings for user's input for vector search
const { AzureCosmosDBVectorStore,
    AzureCosmosDBSimilarityType
} = require("@langchain/community/vectorstores/azure_cosmosdb");
const { OpenAIEmbeddings } = require("@langchain/openai");

// set up the MongoDB client
const dbClient = new MongoClient(process.env.AZURE_COSMOSDB_CONNECTION_STRING);

// Initialize connection to vector store that points to collections and associated index
// set up the Azure Cosmos DB vector store using the initialized MongoDB client
const azureCosmosDBConfig = {
    client: dbClient,
    databaseName: "pokecopilot",
    collectionName: "abilities",
    indexName: "VectorSearchIndex",
    embeddingKey: "contentVector",
    textKey: "_id"
}
const vectorStore = new AzureCosmosDBVectorStore(new OpenAIEmbeddings(), azureCosmosDBConfig);


async function main() {
    try {
        await dbClient.connect();
        console.log("Connected to MongoDB");

        // perform a vector search using the vector store
        const results = await vectorStore.similaritySearch(
            "What abilities involve weather effects?",
            AzureCosmosDBSimilarityType.CosineSimilarity,
            1
        );
        console.log(results);

    } catch (err) {
        console.error(err);
    } finally {
        await dbClient.close();
        console.log('Disconnected from MongoDB');
    }
}

main().catch(console.error);