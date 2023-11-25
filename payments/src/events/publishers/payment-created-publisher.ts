import {
  Publisher,
  PaymentCreatedEvent,
  Subjects,
} from "@alanrslimatickets/common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
}
