import { OrderCreatedEvent, OrderStatus } from "@alanrslimatickets/common";
import { Ticket } from "../../../models/ticket";
import { natsWrapper } from "../../../nats-wrapper";
import { OrderCreatedListener } from "../order-created-listener";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";

const setup = async () => {
  // create an instance of the listener
  const listener = new OrderCreatedListener(natsWrapper.client);
  // create and save a ticket
  const ticket = Ticket.build({ price: 10, title: "concert", userId: "123" });
  await ticket.save();
  // create the fake data event
  const data: OrderCreatedEvent["data"] = {
    expiresAt: new Date().toISOString(),
    id: new mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    ticket: {
      id: ticket.id,
      price: ticket.price,
    },
    userId: "123",
    version: 0,
  };

  //   @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { data, listener, msg };
};

it("sets the orderId of the ticket", async () => {
  const { data, listener, msg } = await setup();
  await listener.onMessage(data, msg);
  const updatedTicket = await Ticket.findById(data.ticket.id);
  expect(updatedTicket!.orderId).toEqual(data.id);
});

it("acks the message", async () => {
  const { data, listener, msg } = await setup();
  await listener.onMessage(data, msg);
  expect(msg.ack).toHaveBeenCalled();
});

it("publishes a ticket updated event", async () => {
  const { data, listener, msg } = await setup();
  await listener.onMessage(data, msg);
  expect(natsWrapper.client.publish).toHaveBeenCalled();
  const ticketUpdatedData = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  );
  expect(data.id).toEqual(ticketUpdatedData.orderId);
});
