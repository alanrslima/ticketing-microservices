import { OrderCreatedEvent, OrderStatus } from "@alanrslimatickets/common";
import { natsWrapper } from "../../../nats-wrapper";
import { OrderCreatedListener } from "../order-created-listener";
import mongoose from "mongoose";
import { Order } from "../../../models/order";

const setup = () => {
  const listener = new OrderCreatedListener(natsWrapper.client);
  const data: OrderCreatedEvent["data"] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    expiresAt: new Date().toISOString(),
    status: OrderStatus.Created,
    ticket: {
      id: new mongoose.Types.ObjectId().toHexString(),
      price: 100,
    },
    userId: "123",
    version: 0,
  };
  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { msg, listener, data };
};

it("replicates the order info", async () => {
  const { data, listener, msg } = setup();
  await listener.onMessage(data, msg);
  const order = await Order.findById(data.id);
  expect(order).toBeDefined();
  expect(order?.price).toEqual(data.ticket.price);
});

it("acks the message", async () => {
  const { data, listener, msg } = setup();
  await listener.onMessage(data, msg);
  expect(msg.ack).toHaveBeenCalled();
});
