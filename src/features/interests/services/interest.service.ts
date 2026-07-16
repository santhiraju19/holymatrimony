import { Interest } from "../types";

let interests: Interest[] = [];

export const interestService = {
  async send(memberId: number, memberName: string) {
    const interest: Interest = {
      id: Date.now(),
      memberId,
      memberName,
      status: "Pending",
      sentAt: new Date().toISOString(),
      chatEnabled: false,
    };

    interests.push(interest);

    return interest;
  },

  async list() {
    return interests;
  },

  async update(
    id: number,
    status: "Accepted" | "Rejected"
  ) {
    interests = interests.map((interest) =>
      interest.id === id
        ? {
            ...interest,
            status,
            chatEnabled: status === "Accepted",
          }
        : interest
    );

    return interests;
  },

  async get(id: number) {
    return interests.find((i) => i.id === id);
  },
};