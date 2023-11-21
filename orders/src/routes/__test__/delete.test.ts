import request from "supertest";
import { app } from "../../app";
import { Ticket } from "../../models/ticket";
import { Order, OrderStatus } from "../../models/order";
import { natsWrapper } from "../../nats-wrapper";
import mongoose from "mongoose";

it("should cancel an order", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  const ticket = Ticket.build({ title: "new ticket", price: 20, id });
  await ticket.save();

  const user = global.signin();
  const { body: order } = await request(app)
    .post("/api/orders")
    .set("Cookie", user)
    .send({ ticketId: ticket.id })
    .expect(201);

  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set("Cookie", user)
    .send()
    .expect(204);

  const updatedOrder = await Order.findById(order.id);
  expect(updatedOrder?.status).toEqual(OrderStatus.Cancelled);
});

it("returns an error if one user tries to cancel another user order", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();

  const ticket = Ticket.build({ title: "concert", price: 20, id });
  await ticket.save();

  const userOne = global.signin();
  const { body: order } = await request(app)
    .post("/api/orders")
    .set("Cookie", userOne)
    .send({ ticketId: ticket.id })
    .expect(201);

  const userTwo = global.signin();
  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set("Cookie", userTwo)
    .send()
    .expect(401);
});

it("returns an error if one user tries to cancel a order that not exists", async () => {
  await request(app)
    .delete("/api/orders/783124")
    .set("Cookie", global.signin())
    .send()
    .expect(400);
});

it("emits a order cancelled event", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();

  const ticket = Ticket.build({ title: "new ticket", price: 20, id });
  await ticket.save();

  const user = global.signin();
  const { body: order } = await request(app)
    .post("/api/orders")
    .set("Cookie", user)
    .send({ ticketId: ticket.id })
    .expect(201);

  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set("Cookie", user)
    .send()
    .expect(204);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
  expect(natsWrapper.client.publish).toHaveBeenCalledTimes(2);
});
