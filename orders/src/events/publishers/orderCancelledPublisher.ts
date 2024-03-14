import { OrderCancelledEvent, Publisher, Subjects } from "@rjdtickets/commons";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
    subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
}