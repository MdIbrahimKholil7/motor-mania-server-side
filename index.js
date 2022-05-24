const express = require('express');
const app = express()
const port = process.env.PORT || 5000
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
app.use(cors())
app.use(express.json())
require('dotenv').config()




const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASS}@cluster0.e98yk.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
console.log(uri)
const run = async () => {
    try {
        await client.connect();
        const serviceCollection = client.db('Bike_Parts').collection('services')
        const helmetCollection = client.db('Bike_Parts').collection('helmet')
        const partsCollection = client.db('Bike_Parts').collection('parts')
        const reviewCollection = client.db('Bike_Parts').collection('review')
        const usersOrderCollection = client.db('Bike_Parts').collection('users_order')
        // get service data 
        app.get('/service-get', async (req, res) => {
            const result = await serviceCollection.find().toArray()
            res.send(result)
        })
        // get service by id 
        app.get('/get-service/:id',async(req,res)=>{
            const id=req.params.id
            console.log(id)
            const filter={_id:ObjectId(id)}
            const result=await serviceCollection.findOne(filter)
            res.send(result)

        })
        // get helmet data 
        app.get('/get-helmet', async (req, res) => {
            const result = await helmetCollection.find().toArray()
            res.send(result)
        })
        // get all parts 
        app.get('/get-parts', async (req, res) => {
            const result = await partsCollection.find().toArray()
            res.send(result)

        })
        // get all review   
        app.get('/get-review', async (req, res) => {
            const result = await reviewCollection.find().toArray()
            res.send(result)
        })

        // users order data post 
        app.post('/users-order-data',async(req,res)=>{
            const body=req.body.body
            const result=await usersOrderCollection.insertOne(body)
            res.send(result)
        })
        // users order data get 
        app.get('/users-order-data',async(req,res)=>{
           const email=req.query.email
           const filter={email}
           const query= usersOrderCollection.find(filter)
           const result=await query.toArray()
           res.send(result)
        })
    } finally {

    }
}
run().catch(console.dir);

app.get('/', async (req, res) => {
    res.send('Dont worry Server is running ')
})
app.listen(port, () => {
    console.log('Port running on ', port)
})