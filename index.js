const express = require('express');
const app = express()
const port = process.env.PORT || 5000
const cors = require('cors')
const { MongoClient, ServerApiVersion } = require('mongodb');
app.use(cors())
app.use(express.json())
require('dotenv').config()




const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASS}@cluster0.e98yk.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
console.log(uri)
const run = async () => {
    try {
        await client.connect();
        const serviceCollection=client.db('Bike_Parts').collection('services')
        const helmetCollection=client.db('Bike_Parts').collection('helmet')
        // get service data 
        app.get('/service-get',async(req,res)=>{
            const result=await serviceCollection.find().toArray()
           res.send(result)
        })
        // get helmet data 
        app.get('/get-helmet',async(req,res)=>{
            const result=await helmetCollection.find().toArray()
           res.send(result)
           console.log(result)
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