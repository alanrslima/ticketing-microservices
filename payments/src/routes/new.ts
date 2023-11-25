import {
  BadRequestError,
  NotAuthorizedError,
  NotFoundError,
  OrderStatus,
  requireAuth,
  validateRequest,
} from "@alanrslimatickets/common";
import express, { Response, Request } from "express";
import { body } from "express-validator";
import { Order } from "../models/order";
import { stripe } from "../stripe";
import { Payment } from "../models/payments";
import { PaymentCreatedPublisher } from "../events/publishers/payment-created-publisher";
import { natsWrapper } from "../nats-wrapper";

const router = express.Router();

router.post(
  "/api/payments",
  requireAuth,
  [body("token").not().isEmpty(), body("orderId").not().isEmpty()],
  validateRequest,
  async (req: Request, res: Response) => {
    const { token, orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      throw new NotFoundError();
    }
    if (order.userId !== req.currentUser?.id) {
      throw new NotAuthorizedError();
    }
    if (order.status === OrderStatus.Cancelled) {
      throw new BadRequestError("Cannot pay for an cancelled order");
    }
    const stripeCharge = await stripe.charges.create({
      amount: order.price * 100,
      currency: "usd",
      source: token,
    });
    const payment = Payment.build({ orderId, stripeId: stripeCharge.id });
    await payment.save();
    new PaymentCreatedPublisher(natsWrapper.client).publish({
      id: payment.id,
      orderId: payment.orderId,
      stripeId: stripeCharge.id,
    });
    res.status(201).send({ id: payment.id });
  }
);

export { router as createChargeRouter };
