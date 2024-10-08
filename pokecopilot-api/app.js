require('dotenv').config();
const express = require('express');
const cors = require('cors')
const swagger = require('./swagger');
// const CosmicWorksAIAgent = require('./cosmic_works/cosmic_works_ai_agent');
const PokecopilotAIAgent = require('./pokecopilot/pokecopilot_ai_agent');
const { MongoClient, ObjectId } = require('mongodb');
const client = new MongoClient(process.env.AZURE_COSMOSDB_CONNECTION_STRING);
const app = express();
app.use(express.json());
app.use(cors()); // enable all CORS requests


// This map is to store agents and their chat history for each session.
// This is for demonstration only and should be hydrated by storing these
// values in a database rather than in-memory.
let agentInstancesMap = new Map();


// Cosmos DB Collection Routes
// GET All Pokemon

/* Get all Pokemon endpoint. */
/**
 * @openapi
 * /api/pokemon:
 *   get:
 *     description: Get all Pokemon endpoint
 *     responses:
 *       200:
 *         description: Returns all pokemon in database
 */
app.get('/api/pokemon', async (req, res) => {
    try {
        const db = client.db("pokecopilot");
        const collection = db.collection('pokemon');
        const pokemon = await collection.find().toArray();
        res.json(pokemon);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching Pokémon' });
    }
});

// GET One Pokemon by pokedex id

/* Get one Pokemon endpoint. */
/**
 * @openapi
 * /api/pokemon/{id}:
 *   get:
 *     description: Get one Pokemon by pokedex id
 *     responses:
 *       200:
 *         description: Returns one pokemon in database
 */
app.get('/api/pokemon/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        const db = client.db("pokecopilot");
        const collection = db.collection('pokemon');
        const pokemon = await collection.findOne({ _id: id });
        if (!pokemon) {
            res.status(404).json({ message: 'Pokémon not found' });
        } else {
            res.json(pokemon);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching Pokémon' });
    }
});

// GET All moves
/* Get all moves endpoint. */
/**
 * @openapi
 * /api/moves:
 *   get:
 *     description: Get all moves endpoint
 *     responses:
 *       200:
 *         description: Returns all moves in database
 */
app.get('/api/moves', async (req, res) => {
    try {
        const db = client.db("pokecopilot");
        const collection = db.collection('moves');
        const moves = await collection.find().toArray();
        res.json(moves);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching moves' });
    }
});

// Get One Move by _id (note the _id property is autogenerated and non-sequential)
/* Get one Move endpoint. */
/**
 * @openapi
 * /api/moves/{id}:
 *   get:
 *     description: Get one move by MongoDB ID
 *     responses:
 *       200:
 *         description: Returns one move in database
 */
app.get('/api/moves/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const db = client.db("pokecopilot");
        const collection = db.collection('moves');
        const move = await collection.findOne({ _id: new ObjectId(id) });
        if (!move) {
            res.status(404).json({ message: 'Move not found' });
        } else {
            res.json(move);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: `Error fetching move with ID ${id}`});
    }
});

// Get One Ability by _id (note the _id property is autogenerated and non-sequential)
/* Get one Ability endpoint. */
/**
 * @openapi
 * /api/abilities/{id}:
 *   get:
 *     description: Get one ability by MongoDB ID
 *     responses:
 *       200:
 *         description: Returns one ability in database
 */
app.get('/api/abilities/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const db = client.db("pokecopilot");
        const collection = db.collection('abilities');
        const ability = await collection.findOne({ _id: new ObjectId(id) });
        if (!ability) {
            res.status(404).json({ message: 'Ability not found' });
        } else {
            res.json(ability);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: `Error fetching ability with ID ${id}`});
    }
});

// GET All abilities
/* Get all abilities endpoint. */
/**
 * @openapi
 * /api/abilities:
 *   get:
 *     description: Get all abilities endpoint
 *     responses:
 *       200:
 *         description: Returns all abilities in database
 */
app.get('/api/abilities', async (req, res) => {
    try {
        const db = client.db("pokecopilot");
        const collection = db.collection('abilities');
        const abilities = await collection.find().toArray();
        res.json(abilities);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching abilities' });
    }
});

/* Health probe endpoint. */
/**
 * @openapi
 * /:
 *   get:
 *     description: Health probe endpoint
 *     responses:
 *       200:
 *         description: Returns status=ready json
 */
app.get('/', (req, res) => {
    res.send({ "status": "ready" });
});


/**
 * @openapi
 * /ai:
 *   post:
 *     description: Run the Pokécopilot AI agent
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               prompt:
 *                 type: string
 *                 default: ""
 *               session_id:
 *                 type: string
 *                 default: "1234"
 *     responses:
 *       200:
 *         description: Returns the OpenAI response.
 */
app.post('/ai', async (req, res) => {
    let agent = {};
    let prompt = req.body.prompt;
    let session_id = req.body.session_id;

    if (agentInstancesMap.has(session_id)) {
        agent = agentInstancesMap.get(session_id);
    } else {
        // agent = new CosmicWorksAIAgent();
        agent = new PokecopilotAIAgent();
        agentInstancesMap.set(session_id, agent);
    }

    let result = await agent.executeAgent(prompt);
    res.send({ message: result });
});

swagger(app)


// parse out hosting port from cmd arguments if passed in
// otherwise default to port 4242
var port = (() => {
    const { argv } = require('node:process');
    var port = 4242; // default
    if (argv) {
        argv.forEach((v, i) => {
            if (v && (v.toLowerCase().startsWith('port='))) {
                port = v.substring(5);
            }
        });
    }
    return port;
})();

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});