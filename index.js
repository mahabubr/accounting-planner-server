const express = require('express')
const app = express()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
const { query } = require('express');
const port = process.env.PORT || 5000
require('dotenv').config()
require('colors');

// Middle Wares
app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.vlhy1ml.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });



async function run() {
    try {

        const serviceCollection = client.db('AccountServices').collection('Service')
        const serviceReview = client.db('AccountServices').collection('Review')

        // Service Server

        app.get('/home-services', async (req, res) => {
            const query = {}
            const cursor = serviceCollection.find(query)
            const result = await cursor.limit(3).toArray()
            res.send(result)
        })

        app.get('/services', async (req, res) => {
            const query = {}
            const cursor = serviceCollection.find(query)
            const result = await cursor.toArray()
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

        app.get('/reviewService', async (req, res) => {

            let query = {}

            if (req.query.email) {
                query = {
                    user_email: req.query.email
                }
            }

            const cursor = serviceReview.find(query)
            const result = await cursor.toArray()
            res.send(result)
        })

        app.get('/reviewService/:id', async (req, res) => {
            const id = req.params.id
            const filter = { service_id: id }
            const cursor = serviceReview.find(filter)
            const result = await cursor.toArray()
            res.send(result)
        })

        app.delete('/reviewService/:id', async (req, res) => {
            const id = req.params.id
            const filter = { _id: ObjectId(id) }
            const result = await serviceReview.deleteOne(filter)
            res.send(result)
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