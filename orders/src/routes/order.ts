import express, {Request, Response} from 'express'
import { body } from 'express-validator'
import { NotAuthorisedError, NotFoundError, requireAuth, validateRequest } from '@rjdtickets/commons'
import { natsWrapper } from '../natsWrapper'
import mongoose from 'mongoose'

const router = express.Router()

//Create Order
router.post('/api/orders', requireAuth, [
    body('ticketId')
        .not()
        .isEmpty()
        .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
        .withMessage('TicketId is required')
], validateRequest, async (req: Request, res: Response) => {
    const {title, price} = req.body

    const ticket = Ticket.build({
        title,
        price,
        userId: req.currentUser!.id
    })

    await ticket.save()
    new TicketCreatedPublisher(natsWrapper.client).publish({
        id: ticket.id,
        title: ticket.title,
        price: ticket.price,
        userId: ticket.userId
    })

    res.status(201).send(ticket)

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
router.delete('/api/orders/:orderId', requireAuth, [
    body('title')
        .not()
        .isEmpty()
        .withMessage('Title is required'),
    body('price')
        .isFloat({gt: 0})
        .withMessage('Price must be greater than 0')
], validateRequest, async (req: Request, res: Response) => {
    const ticket = await Ticket.findById(req.params.id)

    if (!ticket) {
        throw new NotFoundError()
    }

    if (ticket.userId !== req.currentUser!.id) {
        throw new NotAuthorisedError()
    }

    ticket.set({
        title: req.body.title,
        price: req.body.price
    })

    await ticket.save()
    new TicketUpdatedPublisher(natsWrapper.client).publish({
        id: ticket.id,
        title: ticket.title,
        price: ticket.price,
        userId: ticket.userId
    })

    res.send(ticket) //default 200
})

export {router as orderRouter}