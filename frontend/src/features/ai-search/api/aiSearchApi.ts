import api from "@/lib/api";

import type {
  AiSearchApiEnvelope,
  AiSearchInterpretation,
} from "../types";

export async function interpretAiSearch(
  query: string
): Promise<AiSearchInterpretation> {
  const normalizedQuery = query.trim();

  if (!normalizedQuery) {
    throw new Error(
      "A search query is required."
    );
  }

  const response =
    await api.post<
      | AiSearchApiEnvelope
      | AiSearchInterpretation
    >(
      "/profiles/ai-search/interpret",
      {
        query: normalizedQuery,
      }
    );

  const payload = response.data;

  if (
    payload &&
    typeof payload === "object" &&
    "data" in payload
  ) {
    return (
      payload as AiSearchApiEnvelope
    ).data;
  }

  return payload as AiSearchInterpretation;
}
