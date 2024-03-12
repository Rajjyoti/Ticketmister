import express, {Request, Response} from 'express'
import { body } from 'express-validator'
import { BadRequestError, NotAuthorisedError, NotFoundError, OrderStatus, requireAuth, validateRequest } from '@rjdtickets/commons'
import { natsWrapper } from '../natsWrapper'
import mongoose from 'mongoose'
import { Ticket } from '../models/ticket'
import { Order } from '../models/order'

const router = express.Router()

const EXPIRATION_WINDOW_SECONDS = 15*60

//Create Order
router.post('/api/orders', requireAuth, [
    body('ticketId')
        .not()
        .isEmpty()
        .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
        .withMessage('TicketId is required')
], validateRequest, async (req: Request, res: Response) => {
    const {ticketId} = req.body

    const ticket = await Ticket.findById(ticketId)
    if (!ticket) {
        throw new NotFoundError()
    }

    const isReserved = await ticket.isReserved()
    if (isReserved) {
        throw new BadRequestError('Ticket is already reserved')
    }

    const expiration = new Date()
    expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS)

    const order = Order.build({
        userId: req.currentUser!.id,
        status: OrderStatus.Created,
        expiresAt: expiration,
        ticket
    })

    await order.save()

    res.status(201).send(order)

})

//Show orders
router.get('/api/tickets', requireAuth, async (req: Request, res: Response) => {
    const tickets = await Ticket.find({})

    res.send(tickets) //default 200
})

router.get('/api/tickets/:id', requireAuth, async (req: Request, res: Response) => {
    const ticket = await Ticket.findById(req.params.id)

    if (!ticket) {
        throw new NotFoundError()
    }

    res.send(ticket) //default 200
})

//Delete Order
router.delete('/api/orders/:orderId', validateRequest, async (req: Request, res: Response) => {
    return null
})

export {router as orderRouter}