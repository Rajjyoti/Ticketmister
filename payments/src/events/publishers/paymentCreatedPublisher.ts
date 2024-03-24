import {PaymentCreatedEvent, Publisher, Subjects } from "@rjdtickets/commons";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
    subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
}