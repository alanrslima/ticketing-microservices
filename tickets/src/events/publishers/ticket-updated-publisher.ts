import {
  Publisher,
  Subjects,
  TicketUpdatedEvent,
} from "@alanrslimatickets/common";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
}
