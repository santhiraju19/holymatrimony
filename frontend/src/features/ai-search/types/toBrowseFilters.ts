import type {
  BrowseSearchFilters,
} from "@/features/browse/types";

import type {
  AiSearchInterpretation,
} from "./index";

function text(
  value: string | null
): string {
  return value?.trim() ?? "";
}

function numberText(
  value: number | null
): string {
  return value == null
    ? ""
    : String(value);
}

function booleanText(
  value: boolean | null
): "" | "true" | "false" {
  if (value == null) {
    return "";
  }

  return value
    ? "true"
    : "false";
}

export function aiInterpretationToBrowseFilters(
  interpretation: AiSearchInterpretation
): Partial<BrowseSearchFilters> {
  const filters =
    interpretation.filters;

  return {
    /*
     * Do not keep the raw keyword when AI
     * successfully interpreted it.
     *
     * Otherwise the backend would require
     * BOTH the raw keyword and structured
     * filters to match.
     */
    keyword: "",

    ageFrom:
      numberText(filters.ageFrom),

    ageTo:
      numberText(filters.ageTo),

    heightFrom:
      numberText(filters.heightFrom),

    heightTo:
      numberText(filters.heightTo),

    maritalStatus:
      text(filters.maritalStatus),

    religion:
      text(filters.religion),

    denomination:
      text(filters.denomination),

    community:
      text(filters.community),

    motherTongue:
      text(filters.motherTongue),

    baptized:
      booleanText(filters.baptized),

    highestEducation:
      text(filters.highestEducation),

    profession:
      text(filters.profession),

    country:
      text(filters.country),

    state:
      text(filters.state),

    district:
      text(filters.district),

    city:
      text(filters.city),

    diet:
      text(filters.diet),

    smoking:
      text(filters.smoking),

    drinking:
      text(filters.drinking),

    aadhaarVerified:
      booleanText(
        filters.aadhaarVerified
      ),

    idVerified:
      booleanText(
        filters.idVerified
      ),

    churchVerified:
      booleanText(
        filters.churchVerified
      ),
  };
}
