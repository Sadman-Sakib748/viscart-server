const express = require('express');
const cors = require('cors');  // You forgot to import cors
const app = express();
require('dotenv').config()
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

const { MongoClient, ServerApiVersion } = require('mongodb');

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qam3y.mongodb.net/?retryWrites=true&w=majority&appName=Cluster01`;  // Closed backtick and replaced one DB_PASS with DB_USER

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        await client.connect();


        const usersCollection = client.db('Viscart').collection('users')
        const menuCollection = client.db('Viscart').collection('menus')
        const saveFilters = client.db('Viscart').collection('saveFilters')
        const contactCollection = client.db('Viscart').collection('contact')


        // user
        app.get('/users', async (req, res) => {
            const result = await usersCollection.find().toArray();
            res.send(result);
        })
        app.post("/users", upload.single("image"), async (req, res) => {
            try {
                const { name, email } = req.body;
                let imageUrl = null;

                // If an image file is uploaded, save its path
                if (req.file) {
                    imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
                }

                // Create user object with image URL
                const user = {
                    name,
                    email,
                    image: imageUrl,
                    createdAt: new Date(),
                };

                // Insert into MongoDB
                const result = await usersCollection.insertOne(user);

                res.status(201).json({ insertedId: result.insertedId, user });
            } catch (error) {
                console.error("Error inserting user:", error);
                res.status(500).json({ error: "Failed to create user" });
            }
        });


        // menu related
        app.get('/menus', async (req, res) => {
            const result = await menuCollection.find().toArray();
            res.send(result)
        })
        app.post("/menus", async (req, res) => {
            const filters = req.body;
            console.log("Received filters:", filters);
            const result = await menuCollection.insertOne(filters);
            res.send(result)
        });

        // save data relateded 
        app.get('/saveFilters', async (req, res) => {
            const result = await saveFilters.find().toArray();
            res.send(result)
        })
        app.post("/saveFilters", async (req, res) => {
            const filters = req.body;
            console.log("Received filters:", filters);
            const result = await saveFilters.insertOne(filters);
            res.send(result)
        });

        // contact

        app.post("/contact", async (req, res) => {
            const filters = req.body;
            const result = await contactCollection.insertOne(filters);
            res.send(result)
        });






        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Optional: await client.close();
    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
