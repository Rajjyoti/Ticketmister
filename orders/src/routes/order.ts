import express, {Request, Response} from 'express'
import { body } from 'express-validator'
import { BadRequestError, NotAuthorisedError, NotFoundError, OrderStatus, requireAuth, validateRequest } from '@rjdtickets/commons'
import { natsWrapper } from '../natsWrapper'
import mongoose from 'mongoose'
import { Ticket } from '../models/ticket'
import { Order } from '../models/order'
import { OrderCreatedPublisher } from '../events/publishers/orderCreatedPublisher'
import { OrderCancelledPublisher } from '../events/publishers/orderCancelledPublisher'

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

    new OrderCreatedPublisher(natsWrapper.client).publish({
        id: order.id,
        status: order.status,
        userId: order.userId,
        expiresAt: order.expiresAt.toISOString(),
        ticket: {
            id: ticket.id,
            price: ticket.price
        }
    })

    res.status(201).send(order)

})

//Show orders for a user
router.get('/api/orders', requireAuth, async (req: Request, res: Response) => {
    const orders = await Order.find({
        userId: req.currentUser!.id
    }).populate('ticket')

    res.send(orders)
})

//Show orders by id
router.get('/api/orders/:id', requireAuth, async (req: Request, res: Response) => {
    const order = await Order.findById(req.params.id).populate('ticket')

    if (!order) {
        throw new NotFoundError()
    }
    if (order.userId !== req.currentUser!.id) {
        throw new NotAuthorisedError();
    }

    res.send(order)
})

//Cancel Order
router.delete('/api/orders/:id', requireAuth, async (req: Request, res: Response) => {
    const order = await Order.findById(req.params.id).populate('ticket')
    if (!order) {
        throw new NotFoundError()
    }
    if (order.userId !== req.currentUser!.id) {
        throw new NotAuthorisedError()
    }

    order.status = OrderStatus.Cancelled
    await order.save()

    new OrderCancelledPublisher(natsWrapper.client).publish({
        id: order.id,
        ticket: {
            id: order.ticket.id
        }
    })

    res.send(order)
})

export {router as orderRouter}