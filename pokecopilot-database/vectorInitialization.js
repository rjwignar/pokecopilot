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
async function main() {
    try {
        await dbClient.connect();
        console.log('Connected to MongoDB');
        const db = dbClient.db('pokemon');
    } catch (err) {
        console.error(err);
    } finally {
        await dbClient.close();
        console.log('Disconnected from MongoDB');
    }
}

main().catch(console.error);