import express from 'express'
import 'express-async-errors'
import {json} from 'body-parser'
import cookieSession from 'cookie-session'


import { errorHandler, NotFoundError, currentUser } from '@rjdtickets/commons'
import { ticketRouter } from './routes/ticket'

const app = express()
app.set('trust proxy', true)
app.use(json())
app.use(cookieSession({
    signed: false,
    secure: true
}))

app.use(currentUser)

app.use(ticketRouter)

app.all('*', async(req, res) => {
    throw new NotFoundError()
})

app.use(errorHandler)

export {app}