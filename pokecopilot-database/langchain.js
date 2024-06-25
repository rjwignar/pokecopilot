require('dotenv').config();
const { MongoClient } = require('mongodb');

// Import LangChain packages
// AzureCosmosDBVectorStore represents vector index in collection
// AzureCosmosDBSimilarityType performs vector search using cosine similarity
// OpenAIEmbeddings class generates embeddings for user's input for vector search
const { AzureCosmosDBVectorStore,
    AzureCosmosDBSimilarityType
} = require("@langchain/community/vectorstores/azure_cosmosdb");
const { OpenAIEmbeddings, ChatOpenAI } = require("@langchain/openai");
// To support the LangChain LCEL RAG chain
const { PromptTemplate }  = require("@langchain/core/prompts")
const { RunnableSequence, RunnablePassthrough } = require("@langchain/core/runnables")
const { StringOutputParser } = require("@langchain/core/output_parsers")
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

// set up the OpenAI chat model
const chatModel = new ChatOpenAI();
async function main() {
    try {
        await dbClient.connect();
        console.log("Connected to MongoDB");

        // // perform a vector search using the vector store
        // const results = await vectorStore.similaritySearch(
        //     "What abilities involve weather effects?",
        //     AzureCosmosDBSimilarityType.CosineSimilarity,
        //     1
        // );
        // console.log(results);
        // //

        // // Perform vector search with RAG using vectorStore object
        // console.log(await ragLCELChain("What physical fire type moves are there?"));

    } catch (err) {
        console.error(err);
    } finally {
        await dbClient.close();
        console.log('Disconnected from MongoDB');
    }
}

function formatDocuments(docs) {
    // Prepares the product list for the system prompt.  
    let strDocs = "";
    for (let index = 0; index < docs.length; index++) {
        let doc = docs[index];
        let docFormatted = { "_id": doc.pageContent };
        Object.assign(docFormatted, doc.metadata);

        // Build the product document without the contentVector and tags
        if ("contentVector" in docFormatted) {
            delete docFormatted["contentVector"];
        }
        if ("tags" in docFormatted) {
            delete docFormatted["tags"];
        }

        // Add the formatted product document to the list
        strDocs += JSON.stringify(docFormatted, null, '\t');

        // Add a comma and newline after each item except the last
        if (index < docs.length - 1) {
            strDocs += ",\n";
        }
    }
    // Add two newlines after the last item
    strDocs += "\n\n";
    return strDocs;
}

async function ragLCELChain(question) { 
    // A system prompt describes the responsibilities, instructions, and persona of the AI.
    // Note the addition of the templated variable/placeholder for the list of products and the incoming question.
    const systemPrompt = `
        You are a helpful, fun and friendly coach for Pokémon competitive play
        Your name is Pokécopilot.
        You are designed to answer questions about Pokémon competitive play, specifically regarding Pokémon, moves, and abilities that Pokécopilot has information on.
        
        Only answer questions related to the information provided in the list of Pokémon, moves, or abilities below that are represented
        in JSON format.

        When asked questions like "most powerful move" or "lowest base stat total", formulate your answer based on the numerical values of these properties
        
        If you are asked a question that is not in the list, respond with "I don't know."
        
        List of Pokémon, moves, or abilities:

        Only answer questions related to Pokémon competitive play

        If a question is not related to Pokémon competitive play,
        respond with "I only answer questions about Pokémon competitive play".

        List of moves:
        {moves}

        Question:
        {question}
    `;

    // Use a retriever on the Cosmos DB vector store
    const retriever = vectorStore.asRetriever();

    // Initialize the prompt
    const prompt = PromptTemplate.fromTemplate(systemPrompt);

    // The RAG chain will populate the variable placeholders of the system prompt
    // with the formatted list of moves based on the documents retrieved from the vector store.
    // The RAG chain will then invoke the LLM with the populated prompt and the question.
    // The response from the LLM is then parsed as a string and returned.
    const ragChain  = RunnableSequence.from([
        {
            moves: retriever.pipe(formatDocuments),
            question: new RunnablePassthrough()
        },
        prompt,
        chatModel,
        new StringOutputParser()
    ]);

    return await ragChain.invoke(question);
}
main().catch(console.error);