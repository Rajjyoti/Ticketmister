import { ExpirationCompleteEvent, Publisher, Subjects } from "@rjdtickets/commons";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
    subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
}