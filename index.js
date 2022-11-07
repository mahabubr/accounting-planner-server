const express = require('express')
const app = express()
const cors = require('cors')
const port = process.env.PORT || 5000
require('colors');

// Middle Wares
app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
    res.send('Server Running')
})

app.listen(port, () => {
    console.log(`Server Running On PORT ${port}`.bgRed);
})