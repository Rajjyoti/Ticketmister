import express from 'express'
import {json} from 'body-parser'

import { userRouter } from './routes/user'

const app = express()
app.use(json())

app.use(userRouter);

app.get('/api/users', (req, res) => {
    res.send("Hi there!!")
})

app.listen(3000, () => {
    console.log("Listening on port 3000!!!!")
})