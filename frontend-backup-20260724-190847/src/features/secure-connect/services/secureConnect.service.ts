import { CallRequest } from "../types";

let requests: CallRequest[] = [];

export const secureConnectService = {
  async create(
    request: Omit<
      CallRequest,
      "id" | "status" | "createdAt"
    >
  ) {
    const newRequest: CallRequest = {
      ...request,
      id: crypto.randomUUID(),
      status: "Pending",
      createdAt: new Date().toISOString(),
    };

    requests.push(newRequest);

    return newRequest;
  },

  async list() {
    return requests;
  },

  async updateStatus(
    id: string,
    status: CallRequest["status"]
  ) {
    requests = requests.map((request) =>
      request.id === id
        ? {
            ...request,
            status,
          }
        : request
    );
  },

  async get(id: string) {
    return requests.find((request) => request.id === id);
  },
};