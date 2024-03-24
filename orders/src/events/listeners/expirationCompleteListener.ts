import { ExpirationCompleteEvent, Listener, OrderStatus, Subjects } from "@rjdtickets/commons";
import { Message } from "node-nats-streaming";
import { queueGroupName } from "./queueGroupName";
import { Order } from "../../models/order";
import { OrderCancelledPublisher } from "../publishers/orderCancelledPublisher";
import { natsWrapper } from "../../natsWrapper";

export class ExpirationCompleteListener extends Listener<ExpirationCompleteEvent> {
    subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
    queueGroupName = queueGroupName

    async onMessage(data: ExpirationCompleteEvent['data'], msg: Message) {
        const order =await Order.findById(data.orderId).populate('ticket')
        if (!order) {
            throw new Error('Order not found')
        }
        if (order.status === OrderStatus.Complete) {
            return msg.ack()
        }
        
        order.set({
            status: OrderStatus.Cancelled,
        })
        await order.save()

        await new OrderCancelledPublisher(natsWrapper.client).publish({
            id: order.id,
            version: order.version,
            ticket: {
                id: order.ticket.id
            }
        })

        msg.ack()
    }

}