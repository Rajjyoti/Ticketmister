import { Listener, OrderCreatedEvent, Subjects } from "@rjdtickets/commons";
import { Message } from "node-nats-streaming";
import { queueGroupName } from "./queueGroupName";
import { Ticket } from "../../models/ticket";
import { TicketUpdatedPublisher } from "../publishers/ticketUpdatedPublisher";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    subject: Subjects.OrderCreated = Subjects.OrderCreated;
    queueGroupName = queueGroupName

    async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
        const ticket = await Ticket.findById(data.ticket.id)

        if (!ticket) {
            throw new Error('Ticket Not Found')
        }

        ticket.set({orderId: data.id})
        await ticket.save()

        new TicketUpdatedPublisher(this.client).publish({
            id: ticket.id,
            price: ticket.price,
            title: ticket.title,
            orderId: ticket.orderId,
            version: ticket.version,
            userId: ticket.userId
        })

        msg.ack()
    }

}