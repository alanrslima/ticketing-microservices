import request from "supertest";
import { app } from "../../app";
import mongoose from "mongoose";
import { natsWrapper } from "../../nats-wrapper";
import { Ticket } from "../../models/ticket";

it("returns a 404 if the provided id does not exist", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/tickets/${id}`)
    .set("Cookie", global.signin())
    .send({
      title: "new ticket",
      price: 20,
    })
    .expect(404);
});

it("returns a 401 if the user is not authenticated", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/tickets/${id}`)
    .send({
      title: "new ticket",
      price: 20,
    })
    .expect(401);
});

it("returns a 401 if the user does not own the ticket", async () => {
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({
      title: "new ticket",
      price: 20,
    })
    .expect(201);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", global.signin())
    .send({
      title: "updated ticket",
      price: 10,
    })
    .expect(401);
});

it("returns a 400 if the user provides an invalid title or price", async () => {
  const cookie = global.signin();
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({
      title: "new ticket",
      price: 20,
    })
    .expect(201);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: "",
      price: 20,
    })
    .expect(400);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: "valid title",
      price: -20,
    })
    .expect(400);
});

it("updates the ticket provied valid inputs", async () => {
  const cookie = global.signin();
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({
      title: "new ticket",
      price: 20,
    })
    .expect(201);

  const updatedTicket = { title: "updated title", price: 100 };
  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send(updatedTicket)
    .expect(200);

  const ticketResponse = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .send()
    .expect(200);

  expect(ticketResponse.body.title).toEqual(updatedTicket.title);
  expect(ticketResponse.body.price).toEqual(updatedTicket.price);
});

it("publisheds an event on update a ticket", async () => {
  const cookie = global.signin();
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({
      title: "new ticket",
      price: 20,
    })
    .expect(201);

  const updatedTicket = { title: "updated title", price: 100 };
  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send(updatedTicket)
    .expect(200);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
  expect(natsWrapper.client.publish).toHaveBeenCalledTimes(2);
});

it("rejects updates is the ticket is reserved", async () => {
  const cookie = global.signin();
  const { body: createdTicket } = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({
      title: "new ticket",
      price: 20,
    })
    .expect(201);

  const ticket = await Ticket.findById(createdTicket.id);
  ticket?.set("orderId", new mongoose.Types.ObjectId().toHexString());
  await ticket?.save();

  const updatedTicket = { title: "updated title", price: 100 };
  await request(app)
    .put(`/api/tickets/${createdTicket.id}`)
    .set("Cookie", cookie)
    .send(updatedTicket)
    .expect(400);
});
