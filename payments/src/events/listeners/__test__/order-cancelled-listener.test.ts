import {
  OrderCancelledEvent,
  OrderCreatedEvent,
  OrderStatus,
} from "@alanrslimatickets/common";
import { natsWrapper } from "../../../nats-wrapper";
import mongoose from "mongoose";
import { Order } from "../../../models/order";
import { OrderCancelledListener } from "../order-cancelled-listener";

const setup = async () => {
  const listener = new OrderCancelledListener(natsWrapper.client);
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    price: 100,
    status: OrderStatus.Created,
    userId: "123",
    version: 0,
  });
  await order.save();
  const data: OrderCancelledEvent["data"] = {
    id: order.id,
    ticket: { id: new mongoose.Types.ObjectId().toHexString() },
    version: 1,
  };
  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { msg, listener, data };
};

it("updates the status of the order", async () => {
  const { data, listener, msg } = await setup();
  await listener.onMessage(data, msg);
  const order = await Order.findById(data.id);
  expect(order).toBeDefined();
  expect(order?.status).toEqual(OrderStatus.Cancelled);
});

it("acks the message", async () => {
  const { data, listener, msg } = await setup();
  await listener.onMessage(data, msg);
  expect(msg.ack).toHaveBeenCalled();
});
