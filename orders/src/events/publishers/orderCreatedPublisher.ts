import { OrderCreatedEvent, Publisher, Subjects } from "@rjdtickets/commons";

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
    subject: Subjects.OrderCreated = Subjects.OrderCreated;
}