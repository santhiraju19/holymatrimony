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
    interests = interests.map((i) =>
      i.id === id ? { ...i, status } : i
    );

    return interests;
  },
};