const express = require('express');
const cors = require('cors');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mvjtu.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'Unauthorized Access' });
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'Forbidden Accesss' })
        }
        req.decoded = decoded;
        next();
    })
}

async function run() {
    try {
        await client.connect();
        const doubtCollection = client.db('xetGo_solver').collection('doubts');
        const commentCollection = client.db('xetGo_solver').collection('comments');
        const userCollection = client.db('xetGo_solver').collection('users');

        //load all doubts from database
        app.get('/doubt', async (req, res) => {
            const query = {};
            const cursor = doubtCollection.find(query);
            const doubts = await cursor.toArray();
            res.send(doubts);
        });


        //load all specific from database
        app.get('/doubt/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const doubt = await doubtCollection.findOne(query);
            res.send(doubt);
        });


        //send doubt to database by student
        app.post('/doubt', async (req, res) => {
            const doubt = req.body;
            const result = await doubtCollection.insertOne(doubt);
            res.send(result);
        });

        app.put('/doubt/:id', async (req, res) => {
            const id = req.params.id;
            const doubt = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updatedDoc = {
                $set: doubt,
            };
            const result = await doubtCollection.updateOne(filter, updatedDoc, options);
            res.send(result);
        })

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


        // upsert userCollection
        app.put('/user/:email', async (req, res) => {
            const email = req.params.email;
            const user = req.body;
            const filter = { email: email };
            const options = { upsert: true };
            const updatedDoc = {
                $set: user,
            };
            const result = await userCollection.updateOne(filter, updatedDoc, options);
            const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '10d'
            });
            res.send({ result, token });
        });


        //load all users
        app.get('/user', async (req, res) => {
            const query = {};
            const cursor = userCollection.find(query);
            const users = await cursor.toArray();
            return res.send(users);
        });


        //onlyteacher api
        app.get('/teacher/:email', async (req, res) => {
            const email = req.params.email;
            const user = await userCollection.findOne({ email: email });
            const isTeacher = user.role === 'teacher';
            res.send({ teacher: isTeacher })
        });


        // onlyUser api
        app.get('/student/:email', async (req, res) => {
            const email = req.params.email;
            const user = await userCollection.findOne({ email: email });
            const isStudent = user.role === 'student';
            res.send({ student: isStudent })
        });



        //load user based on email
        // app.get('/user/:email', async (req, res) => {
        //     const email = req.params.email;
        //     const query = { email: email };
        //     const cursor = userCollection.findOne(query);
        //     const user = await cursor.toArray();
        //     return res.send(user);
        // });

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