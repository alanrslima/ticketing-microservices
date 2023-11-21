import mongoose from "mongoose";
import request from "supertest";
import { app } from "../../app";
import { Ticket } from "../../models/ticket";
import { Order, OrderStatus } from "../../models/order";
import { natsWrapper } from "../../nats-wrapper";

it("returns an error if the ticket does not exist", async () => {
  const ticketId = new mongoose.Types.ObjectId();
  await request(app)
    .post("/api/orders")
    .set("Cookie", global.signin())
    .send({ ticketId })
    .expect(404);
});

it("returns an error if the ticket is already reserved", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  const ticket = Ticket.build({ price: 20, title: "mock ticket", id });
  await ticket.save();

  const order = Order.build({
    ticket,
    status: OrderStatus.Created,
    expiresAt: new Date(),
    userId: "123yefn",
  });
  await order.save();

  await request(app)
    .post("/api/orders")
    .set("Cookie", global.signin())
    .send({ ticketId: ticket.id })
    .expect(400);
});

it("reserves a ticket", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  const ticket = Ticket.build({ price: 20, title: "mock ticket", id });
  await ticket.save();

  const response = await request(app)
    .post("/api/orders")
    .set("Cookie", global.signin())
    .send({ ticketId: ticket.id })
    .expect(201);

  expect(response.body.status).toEqual("created");
  expect(response.body.ticket.id).toEqual(ticket.id);
});

it("emits an order created event", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  const ticket = Ticket.build({ price: 20, title: "mock ticket", id });
  await ticket.save();

  await request(app)
    .post("/api/orders")
    .set("Cookie", global.signin())
    .send({ ticketId: ticket.id })
    .expect(201);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
  expect(natsWrapper.client.publish).toHaveBeenCalledTimes(1);
});
