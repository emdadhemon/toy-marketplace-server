const express = require("express");
const cors = require("cors");
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.ze5l9xc.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
    useNewUrlParser : true ,
    useUnifiedTopology : true,
    maxPoolSize : 10,
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
       

        const toyCollection = client.db("toy-market").collection("toys");

        app.get('/toys', async (req, res) => {
            const toys = toyCollection.find().limit(20);
            const result = await toys.toArray();
            res.send(result);
        })
        app.get("/toys/:category", async (req, res) => {
            const category = req.params.category;
            const result = await toyCollection.find({ category: category }).toArray();
            res.send(result);
        });

        app.get("/findbysubcategory/:subcategory", async (req, res) => {
            const subcategory = req.params.subcategory;
            const result = await toyCollection.find({ subcategory: subcategory }).toArray();
            res.send(result);
        });

        app.get("/findone/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await toyCollection.findOne(query)
            res.send(result);
        });

        app.get("/mytoys/:email", async (req, res) => {
            const query = { selleremail: req.params.email }
            const jobs = await toyCollection.find(query).toArray();
            res.send(jobs);
        });
        app.get("/ascendingbyprice/:email", async (req, res) => {
            const query = { selleremail: req.params.email }
            const jobs = await toyCollection.find(query).sort({price : 1}).toArray();
            res.send(jobs);
        });
        app.get("/descendingbyprice/:email", async (req, res) => {
            const query = { selleremail: req.params.email }
            const jobs = await toyCollection.find(query).sort({price : -1}).toArray();
            res.send(jobs);
        });

        app.get("/searchtoysByText/:text", async (req, res) => {
            const text = req.params.text;
            const result = await toyCollection.find({
                $or: [
                    { toyname: { $regex: text, $options: "i" } },
                ]
            }).toArray();
            res.send(result);
        });


        app.post("/toys", async (req, res) => {
            const newToy = req.body;
            const result = await toyCollection.insertOne(newToy);
            res.send(result);
        });

        app.put("/updatetoy/:id", async (req, res) => {
            const id = req.params.id;
            const body = req.body;
            const query = { _id: new ObjectId(id) };
            const updatedtoy = {
                $set: {
                    toyname: body.toyname,
                    price: body.price,
                    category: body.category,
                    subcategory: body.subcategory,
                    photourl: body.photourl,
                    quantity: body.quantity,
                    ratings: body.ratings,
                    details: body.details,
                },
            };
            const result = await toyCollection.updateOne(query, updatedtoy);
            res.send(result);
        });

        app.delete('/toy/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await toyCollection.deleteOne(query);
            res.send(result);
        })



        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('ser')
})

app.listen(port, () => {
    console.log("server is running")
})