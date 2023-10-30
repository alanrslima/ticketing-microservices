import axios from "axios";
import { headers } from "next/headers";

export const buildClient = () => {
  const headersData: { [key: string]: string } = {};
  headers().forEach((value, key) => {
    headersData[key] = value;
  });
  return axios.create({
    baseURL: "http://ingress-nginx-controller.ingress-nginx.svc.cluster.local",
    headers: headersData,
  });
};
