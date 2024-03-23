import { Listener, OrderCreatedEvent, Subjects } from "@rjdtickets/commons";
import { Message } from "node-nats-streaming";
import { queueGroupName } from "./queueGroupName";
import { Order } from "../../models/order";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    subject: Subjects.OrderCreated = Subjects.OrderCreated;
    queueGroupName = queueGroupName

    async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
        const order = Order.build({
            id: data.id,
            userId: data.userId,
            price: data.ticket.price,
            version: data.version,
            status: data.status
        })
        await order.save()

        msg.ack()
    }

}