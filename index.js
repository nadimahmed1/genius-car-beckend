const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;
const app = express();

// middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_SERVER}:${process.env.DB_PASS}@cluster0.w1l0j5u.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const geniusCollection = client.db('geniusServer').collection('server');

        app.get('/server', async (req, res) => {
            const query = {};
            const cursor = geniusCollection.find(query);
            const servers = await cursor.toArray();
            res.send(servers);
        });

        app.get('/server/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const server = await geniusCollection.findOne(query);
            res.send(server);

        })

        // POST
        app.post('/server', async (req, res) => {
            const newServer = req.body;
            const result = await geniusCollection.insertOne(newServer);
            res.send(result);
        });

        // Delete
        app.delete('/server/:id', (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = geniusCollection.deleteOne(query);
            res.send(result);
        })
    }
    finally {

    }

}

run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Running server');
});

app.listen(port, () => {
    console.log('Listening to port', port);
})