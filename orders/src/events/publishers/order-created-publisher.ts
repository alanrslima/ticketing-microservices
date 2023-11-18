import {
  Publisher,
  Subjects,
  OrderCreatedEvent,
} from "@alanrslimatickets/common";

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
}
