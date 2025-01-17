import express, {Request, Response} from 'express'
import { body } from 'express-validator'
import { BadRequestError, NotAuthorisedError, NotFoundError, requireAuth, validateRequest } from '@rjdtickets/commons'
import { Ticket } from '../models/ticket'
import { TicketCreatedPublisher } from '../events/publishers/ticketCreatedPublisher'
import { natsWrapper } from '../natsWrapper'
import { TicketUpdatedPublisher } from '../events/publishers/ticketUpdatedPublisher'

const router = express.Router()

router.post('/api/tickets', requireAuth, [
    body('title')
        .not()
        .isEmpty()
        .withMessage('Title is required'),
    body('price')
        .isFloat({gt: 0})
        .withMessage('Price must be greater than 0')
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
        userId: ticket.userId,
        version: ticket.version
    })

    res.status(201).send(ticket)

})

//get non reserved tickets
router.get('/api/tickets', async (req: Request, res: Response) => {
    const tickets = await Ticket.find({orderId: undefined})

    res.send(tickets) //default 200
})

router.get('/api/tickets/:id', async (req: Request, res: Response) => {
    const ticket = await Ticket.findById(req.params.id)

    if (!ticket) {
        throw new NotFoundError()
    }

    res.send(ticket)
})

router.put('/api/tickets/:id', requireAuth, [
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

    if (ticket.orderId) {
        throw new BadRequestError('Cannot edit a reserved ticket')
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
        userId: ticket.userId,
        version: ticket.version
    })

    res.send(ticket) //default 200
})

export {router as ticketRouter}