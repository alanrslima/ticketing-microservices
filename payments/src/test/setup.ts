import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

declare global {
  var signin: (userId?: string) => string[];
}

jest.mock("../nats-wrapper");
let mongo: any;

process.env.STRIPE_KEY =
  "sk_test_51OGJDBKmfbamMwdpod6lla1S5wpoja9KjAOeGpsYjYAKpttwinm3v36Ys6BgeWjuR1U5e3BI2P1vNfS0rUo2q8eD00LIaHSnOC";

beforeAll(async () => {
  process.env.JWT_KEY = "qwd231h!";
  process.env.NODE_ENV = "test";

  mongo = await MongoMemoryServer.create();
  const mongoUri = mongo.getUri();
  await mongoose.connect(mongoUri, {});
});

beforeEach(async () => {
  jest.clearAllMocks();
  const collections = await mongoose.connection.db.collections();
  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  if (mongo) {
    await mongo.stop();
  }
  await mongoose.connection.close();
});

global.signin = (userId?: string) => {
  const payload = {
    id: userId || new mongoose.Types.ObjectId().toHexString(),
    email: "johndoe@email.com",
  };
  const token = jwt.sign(payload, process.env.JWT_KEY!);
  const session = { jwt: token };
  const sessionJSON = JSON.stringify(session);
  const base64 = Buffer.from(sessionJSON).toString("base64");
  return [`session=${base64}`];
};
