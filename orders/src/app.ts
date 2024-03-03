import express from 'express'
import 'express-async-errors'
import {json} from 'body-parser'
import cookieSession from 'cookie-session'


import { errorHandler, NotFoundError, currentUser } from '@rjdtickets/commons'
import { orderRouter } from './routes/order'

const app = express()
app.set('trust proxy', true)
app.use(json())
app.use(cookieSession({
    signed: false,
    secure: true
}))

app.use(currentUser)

app.use(orderRouter)

app.all('*', async(req, res) => {
    throw new NotFoundError()
})

app.use(errorHandler)

export {app}