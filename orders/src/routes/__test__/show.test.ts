import request from "supertest";
import { app } from "../../app";
import { Ticket } from "../../models/ticket";
import mongoose from "mongoose";

it("fetches the user order", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  const ticket = Ticket.build({ title: "concert", price: 20, id });
  await ticket.save();

  const user = global.signin();
  const { body: order } = await request(app)
    .post("/api/orders")
    .set("Cookie", user)
    .send({ ticketId: ticket.id })
    .expect(201);

  const { body: fetchedOrder } = await request(app)
    .get(`/api/orders/${order.id}`)
    .set("Cookie", user)
    .send()
    .expect(200);

  expect(fetchedOrder.id).toEqual(order.id);
});

it("returns an error if one user tries to fetch another user order", async () => {
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
    .get(`/api/orders/${order.id}`)
    .set("Cookie", userTwo)
    .send()
    .expect(401);
});

it("returns an error if one user tries to fetch a order that not exists", async () => {
  await request(app)
    .get(`/api/orders/783124`)
    .set("Cookie", global.signin())
    .send()
    .expect(400);
});
