import { Publisher, Subjects, TicketUpdatedEvent } from "@rjdtickets/commons";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
    subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
}