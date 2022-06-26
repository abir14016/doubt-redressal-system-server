const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mvjtu.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const doubtCollection = client.db('xetGo_solver').collection('doubts');
        const commentCollection = client.db('xetGo_solver').collection('comments');

        //load all doubts from database
        app.get('/doubt', async (req, res) => {
            const query = {};
            const cursor = doubtCollection.find(query);
            const doubts = await cursor.toArray();
            res.send(doubts);
        });

        //send doubt to database by student
        app.post('/doubt', async (req, res) => {
            const doubt = req.body;
            const result = await doubtCollection.insertOne(doubt);
            res.send(result);
        });

        //load all comments from database
        app.get('/comment', async (req, res) => {
            const query = {};
            const cursor = commentCollection.find(query);
            const comments = await cursor.toArray();
            res.send(comments);
        });

        //load comments for specific doubt from database
        app.get('/comment/:postId', async (req, res) => {
            const postId = req.params.postId;
            const query = { postId: postId };
            const cursor = commentCollection.find(query);
            const comments = await cursor.toArray();
            return res.send(comments);
        });

        //send user comment to the database
        app.post('/comment', async (req, res) => {
            const comment = req.body;
            const result = await commentCollection.insertOne(comment);
            res.send(result);
        });

    }
    finally {

    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Hello from doubt redressal system')
})

app.listen(port, () => {
    console.log(`doubd redressal system listening on port ${port}`)
})