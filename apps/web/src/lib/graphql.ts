import { GraphQLClient } from "graphql-request";
import { getSdk } from "@/graphql/generated";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/graphql";

export function getClient(token?: string) {
  return new GraphQLClient(API_URL, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}

export function getSdkClient(token?: string) {
  return getSdk(getClient(token));
}
