import {
  Publisher,
  Subjects,
  OrderCancelledEvent,
} from "@alanrslimatickets/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
}
