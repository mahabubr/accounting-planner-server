const express = require('express')
const app = express()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
const port = process.env.PORT || 5000
var jwt = require('jsonwebtoken');
require('dotenv').config()
require('colors');

// Middle Wares
app.use(cors())
app.use(express.json())


// Middle Were JWT

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).send({ message: 'unauthorized access' });
    }
    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'Forbidden access' });
        }
        req.decoded = decoded;
        next();
    })
}

// MongoDB Connect URL

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.vlhy1ml.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });



async function run() {
    try {

        // Services Documents
        const serviceCollection = client.db('AccountServices').collection('Service')
        // Review Documents
        const serviceReview = client.db('AccountServices').collection('Review')

        // Service Server

        // Get Home 3 Services
        app.get('/home-services', async (req, res) => {
            const query = {}
            const cursor = serviceCollection.find(query).sort({ _id: -1 })
            const result = await cursor.limit(3).toArray()
            res.send(result)
        })

        // Get Home All Services For Services Page
        app.get('/services', async (req, res) => {
            const query = {}
            const cursor = serviceCollection.find(query).sort({ _id: -1 })
            const result = await cursor.toArray()
            res.send(result)
        })

        app.post('/services', async (req, res) => {
            const service = req.body
            const result = await serviceCollection.insertOne(service)
            res.send(result)
        })

        app.get('/services/:id', async (req, res) => {
            const id = req.params.id
            const filter = { _id: ObjectId(id) }
            const result = await serviceCollection.findOne(filter)
            res.send(result)
        })

        // Review Services

        app.post('/reviewService', async (req, res) => {
            const user_review = req.body
            const result = await serviceReview.insertOne(user_review)
            res.send(result)
        })

        app.get('/reviewService', verifyJWT, async (req, res) => {

            let query = {}
            // Check JOT Condition
            const decoded = req.decoded;

            if (decoded.email !== req.query.email) {
                res.status(403).send({ message: 'unauthorized access' })
            }
            // Email Query For Fetch Data To My Review Section
            if (req.query.email) {
                query = {
                    user_email: req.query.email
                }
            }

            const cursor = serviceReview.find(query)
            const result = await cursor.toArray()
            res.send(result)
        })

        // Get Review To Show ALl User Review
        app.get('/reviewService/:id', async (req, res) => {
            const id = req.params.id
            const filter = { service_id: id }
            const cursor = serviceReview.find(filter).sort({ time: -1 })
            const result = await cursor.toArray()
            res.send(result)
        })

        // Get Single Review To Update User Review
        app.get('/reviewService/update/:id', async (req, res) => {
            const id = req.params.id
            const filter = { _id: ObjectId(id) }
            const result = await serviceReview.findOne(filter)
            res.send(result)
        })
        // Update Service Review
        app.put('/reviewService/update/:id', async (req, res) => {
            const id = req.params.id
            const update_body = req.body.review

            const filter = { _id: ObjectId(id) }
            const option = { upsert: true }

            const updateReview = {
                $set: {
                    message: update_body
                }
            }

            const result = await serviceReview.updateOne(filter, updateReview, option)
            res.send(result)

        })

        // Delete Review From My Service
        app.delete('/reviewService/:id', async (req, res) => {
            const id = req.params.id
            const filter = { _id: ObjectId(id) }
            const result = await serviceReview.deleteOne(filter)
            res.send(result)
        })


        // JWT Token

        app.post('/jwt', (req, res) => {
            const user = req.body
            const token = jwt.sign(user, process.env.JWT_ACCESS_TOKEN_SECRET, { expiresIn: '1d' })
            res.send({ token })
        })

    }
    catch (error) {
        console.log(error);
    }
}

run()

app.get('/', (req, res) => {
    res.send('Server Running')
})

app.listen(port, () => {
    console.log(`Server Running On PORT ${port}`.bgRed);
})