import { buildClient } from "@/services/build-client";

async function getData() {
  const client = buildClient();
  const { data } = await client.get("/api/users/currentuser");
  return data;
}

export default async function Page() {
  const { currentUser } = await getData();
  return currentUser ? (
    <h1>You are signed in</h1>
  ) : (
    <h1>You are not signed in</h1>
  );
}
