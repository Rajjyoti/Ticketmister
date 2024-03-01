import { Publisher, Subjects, TicketCreatedEvent } from "@rjdtickets/commons";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
    subject: Subjects.TicketCreated = Subjects.TicketCreated;
}