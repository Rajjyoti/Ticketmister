import express from 'express'
import 'express-async-errors'
import {json} from 'body-parser'
import cookieSession from 'cookie-session'

import { userRouter } from './routes/user'
import { errorHandler, NotFoundError } from '@rjdtickets/commons'

const app = express()
app.set('trust proxy', true)
app.use(json())
app.use(cookieSession({
    signed: false,
    secure: true
}))

app.use(userRouter);

app.all('*', async(req, res) => {
    throw new NotFoundError()
})

app.use(errorHandler)

export {app}