import { Request, Response, Router } from "express";
import {
  NotAuthorizedError,
  NotFoundError,
  requireAuth,
  validateRequest,
} from "@alanrslimatickets/common";
import { Ticket } from "../models/ticket";
import { body } from "express-validator";
import { TicketUpdatedPublisher } from "../events/publishers/ticket-updated-publisher";
import { natsWrapper } from "../nats-wrapper";

const router = Router();

router.put(
  "/api/tickets/:id",
  requireAuth,
  [
    body("title").not().isEmpty().withMessage("Title is required"),
    body("price")
      .isFloat({ gt: 0 })
      .withMessage("Price must be greater then 0"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      throw new NotFoundError();
    }
    if (ticket.userId !== req.currentUser?.id) {
      throw new NotAuthorizedError();
    }
    const { title, price } = req.body;
    ticket.set({ title, price });
    await ticket.save();
    new TicketUpdatedPublisher(natsWrapper.client).publish({
      id: ticket.id,
      price: ticket.price,
      title: ticket.title,
      userId: ticket.userId,
    });
    res.send(ticket);
  }
);

export { router as updateTicketRouter };
