import {
  ExpirationCompleteEvent,
  Publisher,
  Subjects,
} from "@alanrslimatickets/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
}
