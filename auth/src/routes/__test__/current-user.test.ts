import request from "supertest";
import { app } from "../../app";

it("response with details about the current user", async () => {
  const cookie = await global.signin();

  const response = await request(app)
    .get("/api/users/currentuser")
    .set("Cookie", cookie)
    .send()
    .expect(200);
  expect(response.body.currentUser.id).toBeDefined();
  expect(response.body.currentUser.email).toBe("johndoe@email.com");
});

it("response with bull if not authenticated", async () => {
  const response = await request(app)
    .get("/api/users/currentuser")
    .send()
    .expect(200);
  expect(response.body.currentUser).toBe(null);
});
