const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;
const app = express();

// middleware
app.use(cors());
app.use(express.json());

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    console.log(authHeader);
    if (!authHeader) {
        return res.status(401).send({ message: 'unAuthorized access token' })
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECREAT, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: 'UnAuthorized access token' })
        }
        console.log(decoded);
        req.decoded = decoded;
        next();
    })

}

const uri = `mongodb+srv://${process.env.DB_SERVER}:${process.env.DB_PASS}@cluster0.w1l0j5u.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        client.connect();
        const geniusCollection = client.db('geniusServer').collection('server');
        const orderCollection = client.db('geniusServer').collection('order')

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
        // faul
        app.get('/service', (req, res) => {
            res.send('service paice vai')
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

        // orderPlace
        app.post('/order', async (req, res) => {
            const order = req.body;
            const result = await orderCollection.insertOne(order);
            res.send(result);
        })
        // 
        app.get('/order', verifyJWT, async (req, res) => {
            const decodedEmail = req.decoded.email;
            const email = req.query.email;
            if (email === decodedEmail) {
                const query = { email: email };
                const cursor = orderCollection.find(query);
                const result = await cursor.toArray();
                res.send(result);
            }
            else {
                res.status(403).send({ message: 'forbidden' })
            }


        })

        // 
        app.post('/login', async (req, res) => {
            const user = req.body;
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECREAT, {
                expiresIn: '1D'
            })
            res.send({ accessToken })
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