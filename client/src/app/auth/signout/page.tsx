"use client";
import { useRequest } from "@/hooks/use-request";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Signout() {
  const { push } = useRouter();

  const { doRequest } = useRequest({
    url: "/api/users/signout",
    method: "post",
    body: {},
    onSuccess: () => push("/"),
  });

  useEffect(() => {
    doRequest();
  }, []);

  return <div>Signing you out...</div>;
}
