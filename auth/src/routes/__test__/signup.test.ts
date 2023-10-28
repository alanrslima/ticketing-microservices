import request from "supertest";
import { app } from "../../app";

it("returns a 201 on sucessul signup", async () => {
  return request(app)
    .post("/api/users/signup")
    .send({ email: "johndoe@email.com", password: "password" })
    .expect(201);
});

it("returns a 400 with an invalid email on signup", async () => {
  return request(app)
    .post("/api/users/signup")
    .send({ email: "qwdme1ui", password: "password" })
    .expect(400);
});

it("returns a 400 with an invalid password on signup", async () => {
  return request(app)
    .post("/api/users/signup")
    .send({ email: "qwdme1ui", password: "p" })
    .expect(400);
});

it("returns a 400 with missign email and password on signup", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({ email: "johndoe@email.com" })
    .expect(400);
  await request(app)
    .post("/api/users/signup")
    .send({ password: "password" })
    .expect(400);
});

it("disallows duplicate emails", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({ email: "johndoe@email.com", password: "password" })
    .expect(201);
  await request(app)
    .post("/api/users/signup")
    .send({ email: "johndoe@email.com", password: "password" })
    .expect(400);
});

it("sets a cookie after successful signup", async () => {
  const response = await request(app)
    .post("/api/users/signup")
    .send({ email: "johndoe@email.com", password: "password" })
    .expect(201);
  expect(response.get("Set-Cookie")).toBeDefined();
});

it("returns user email and id after successful signup", async () => {
  const response = await request(app)
    .post("/api/users/signup")
    .send({ email: "johndoe@email.com", password: "password" })
    .expect(201);
  expect(response.body.id).toBeDefined();
  expect(response.body.email).toBeDefined();
  expect(response.body.email).toBe("johndoe@email.com");
});
