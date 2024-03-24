import express, {Request, Response} from 'express'
import { body } from 'express-validator'
import { BadRequestError, NotAuthorisedError, NotFoundError, OrderStatus, requireAuth, validateRequest } from '@rjdtickets/commons'
import { natsWrapper } from '../natsWrapper'
import mongoose from 'mongoose'
import { Order } from '../models/order'
import { stripe } from '../stripe'
import { Payment } from '../models/payment'

const router = express.Router()

//Create stripe payment intent
router.post('/api/payments', requireAuth, [
    body('orderId')
        .not()
        .isEmpty()
], validateRequest, async (req: Request, res: Response) => {
    console.log('hi')
    const {orderId} = req.body

    const order = await Order.findById(orderId)
    if (!order) {
        throw new NotFoundError()
    }

    if (order.userId !== req.currentUser?.id) {
        throw new NotAuthorisedError()
    }

    if (order.status === OrderStatus.Cancelled) {
        throw new BadRequestError('Cannot pay for a cancelled order')
    }

    const paymentIntent = await stripe.paymentIntents.create({
        amount: order.price * 100,
        currency: 'usd',
        automatic_payment_methods: {
          enabled: true,
        },
    })

    const payment = Payment.build({
        orderId,
        stripeId: paymentIntent.id
    })
    await payment.save()

    res.send({success: true})

})

export {router as paymentRouter}