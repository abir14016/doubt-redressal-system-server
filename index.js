const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello from doubt redressal system')
})

app.listen(port, () => {
    console.log(`doubd redressal system listening on port ${port}`)
})