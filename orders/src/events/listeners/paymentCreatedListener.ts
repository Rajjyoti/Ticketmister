import { Listener, OrderStatus, PaymentCreatedEvent, Subjects, TicketCreatedEvent } from "@rjdtickets/commons";
import { Message } from "node-nats-streaming";
import { queueGroupName } from "./queueGroupName";
import { Order } from "../../models/order";

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
    subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
    queueGroupName = queueGroupName

    async onMessage(data: PaymentCreatedEvent['data'], msg: Message) {
        const {id, orderId, stripeId} = data

        const order = await Order.findById(orderId)
        if (!order) {
            throw new Error('Order not found')
        }

        order.set({status: OrderStatus.Complete})
        await order.save()

        msg.ack()
    }

}