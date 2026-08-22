import type {
  SavedSearch,
} from "./types";

function append(
  params: URLSearchParams,
  name: string,
  value:
    | string
    | number
    | boolean
    | null
    | undefined
): void {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return;
  }

  params.set(
    name,
    String(value)
  );
}

export function buildSavedSearchUrl(
  savedSearch: SavedSearch
): string {
  const params =
    new URLSearchParams();

  append(
    params,
    "ageFrom",
    savedSearch.ageFrom
  );

  append(
    params,
    "ageTo",
    savedSearch.ageTo
  );

  append(
    params,
    "heightFrom",
    savedSearch.heightFrom
  );

  append(
    params,
    "heightTo",
    savedSearch.heightTo
  );

  append(
    params,
    "gender",
    savedSearch.gender
  );

  append(
    params,
    "maritalStatus",
    savedSearch.maritalStatus
  );

  append(
    params,
    "religion",
    savedSearch.religion
  );

  append(
    params,
    "denomination",
    savedSearch.denomination
  );

  append(
    params,
    "community",
    savedSearch.community
  );

  append(
    params,
    "motherTongue",
    savedSearch.motherTongue
  );

  append(
    params,
    "baptized",
    savedSearch.baptized
  );

  append(
    params,
    "highestEducation",
    savedSearch.highestEducation
  );

  append(
    params,
    "profession",
    savedSearch.profession
  );

  append(
    params,
    "country",
    savedSearch.country
  );

  append(
    params,
    "state",
    savedSearch.state
  );

  append(
    params,
    "city",
    savedSearch.city
  );

  append(
    params,
    "diet",
    savedSearch.diet
  );

  append(
    params,
    "smoking",
    savedSearch.smoking
  );

  append(
    params,
    "drinking",
    savedSearch.drinking
  );

  append(
    params,
    "aadhaarVerified",
    savedSearch.aadhaarVerified
  );

  append(
    params,
    "idVerified",
    savedSearch.idVerified
  );

  append(
    params,
    "churchVerified",
    savedSearch.churchVerified
  );

  append(
    params,
    "sort",
    savedSearch.sort
  );

  const query =
    params.toString();

  return query
    ? `/search?${query}`
    : "/search";
}