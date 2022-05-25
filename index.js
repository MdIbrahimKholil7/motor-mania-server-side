const express = require('express');
const app = express()
const port = process.env.PORT || 5000
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
app.use(cors())
app.use(express.json())
require('dotenv').config()
const stripe = require('stripe')(process.env.STRIPE_TEST_KEY);
const verifyJwt = (req, res, next) => {
    const authorization = req.headers.authorization
    if (!authorization) {
        return res.status(401).send({ message: 'unAuthorized access' })
    }
    const token = authorization.split(' ')[1]
    jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: 'Forbidden' })
        }
        console.log(decoded)
        req.decoded = decoded
        next()
    })
}

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
        const userCollection = client.db('Bike_Parts').collection('users')
        // get service data 
        app.get('/service-get', async (req, res) => {
            const result = await serviceCollection.find().toArray()
            res.send(result)
        })
        // get service by id 
        app.get('/get-service', verifyJwt, async (req, res) => {
            const id = req.query.id
            console.log('from ',req.query)
            const email = req.query.email
            if (req.decoded.email === email) {
                const filter = { _id: ObjectId(id) }
                const result = await serviceCollection.findOne(filter)
                res.send(result)
               
            }else{                                                          
                res.status(401).send({message:'Forbidden access'})
            }                                                                                                                                                                   
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
        app.post('/users-order-data', async (req, res) => {
            const body = req.body.body
            const result = await usersOrderCollection.insertOne(body)
            res.send(result)
        })
        // users order data get 
        app.get('/users-order-data', verifyJwt,async (req, res) => {
            const email = req.query.email
            const filter = { email }
            const query = usersOrderCollection.find(filter)
            const result = await query.toArray()
            res.send(result)
        })
        // get user data for token 
        app.get('/get-payment/:id',async(req,res)=>{
            const id=req.params.id
            const filter={_id:ObjectId(id)}
            const result=await usersOrderCollection.findOne(filter)
            res.send(result)
          
        })

        // update user information and service data 
        app.put('/payment-complete',async(req,res)=>{
            console.log('from body',req.body)
        })
        // payment intent 
        app.post('/create-payment-intent', verifyJwt,async(req,res)=>{
            const {price}=req.body
            const paymentIntent=await stripe.paymentIntents.create({
                amount:price * 100,
                currency:'usd',
                payment_method_types:['card']
            })
            res.send({clientSecret:paymentIntent.client_secret})
        })


        app.put('/token', async (req, res) => {
            const email = req.body.email
            const user = req.body
            const filter = { email: email };
            const options = { upsert: true };
            const updateDoc = {
                $set: user
            };
            const result = await userCollection.updateOne(filter, updateDoc, options);
            const accessToken = jwt.sign({ email }, process.env.ACCESS_TOKEN, {
                expiresIn: '1d'
            })
            console.log(result)
            res.send({ accessToken })
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