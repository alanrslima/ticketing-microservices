import { TicketUpdatedEvent } from "@alanrslimatickets/common";
import { natsWrapper } from "../../../nats-wrapper";
import { TicketUpdatedListener } from "../ticket-updated-listener";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../../models/ticket";

const setup = async () => {
  // creae an instance of the listener
  const listener = new TicketUpdatedListener(natsWrapper.client);
  // Create and save a ticket
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    price: 100,
    title: "concert",
  });
  await ticket.save();

  // create a fake data event
  const data: TicketUpdatedEvent["data"] = {
    id: ticket.id,
    title: "show",
    price: 200,
    userId: new mongoose.Types.ObjectId().toHexString(),
    version: ticket.version + 1,
  };
  // create a fake message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };
  return { listener, data, msg };
};

it("finds, updates and saves a ticket", async () => {
  const { data, listener, msg } = await setup();
  // call the onMessage function with the data object + message object
  await listener.onMessage(data, msg);
  // write assertion to make sure a ticket was created!
  const updatedTicket = await Ticket.findById(data.id);
  expect(updatedTicket).toBeDefined();
  expect(updatedTicket?.title).toEqual(data.title);
  expect(updatedTicket?.price).toEqual(data.price);
});

it("acks the message", async () => {
  const { data, listener, msg } = await setup();
  // call the onMessage function with the data object + message object
  await listener.onMessage(data, msg);
  // write assertions to make sure ack function is called
  expect(msg.ack).toHaveBeenCalled();
  expect(msg.ack).toHaveBeenCalledTimes(1);
});

it("does not call ack if the event has a skipped version number", async () => {
  const { data, listener, msg } = await setup();
  data.version = 10;
  try {
    await listener.onMessage(data, msg);
  } catch (error) {}

  expect(msg.ack).not.toHaveBeenCalled();
});
