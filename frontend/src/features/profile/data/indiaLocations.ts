import {
  City,
  State,
} from "country-state-city";

export interface LocationOption {
  value: string;
  label: string;
}

export interface IndiaStateOption
  extends LocationOption {
  isoCode: string;
}

/*
 * India ISO country code.
 */
const INDIA_CODE = "IN";

export const INDIA_STATES: IndiaStateOption[] =
  State.getStatesOfCountry(INDIA_CODE)
    .map((state) => ({
      value: state.name,
      label: state.name,
      isoCode: state.isoCode,
    }))
    .sort((first, second) =>
      first.label.localeCompare(
        second.label
      )
    );

export function getStateIsoCode(
  stateName: string
): string {
  return (
    INDIA_STATES.find(
      (state) =>
        state.value === stateName
    )?.isoCode ?? ""
  );
}

export function getCitiesForState(
  stateName: string
): LocationOption[] {
  const stateCode =
    getStateIsoCode(stateName);

  if (!stateCode) {
    return [];
  }

  const cityNames = new Set(
    City.getCitiesOfState(
      INDIA_CODE,
      stateCode
    )
      .map((city) =>
        city.name.trim()
      )
      .filter(Boolean)
  );

  return Array.from(cityNames)
    .sort((first, second) =>
      first.localeCompare(second)
    )
    .map((city) => ({
      value: city,
      label: city,
    }));
}

/*
 * District information is kept separately because
 * the country-state-city package does not provide
 * a reliable district hierarchy.
 *
 * Add official district data here incrementally,
 * or replace this mapping with an API/database
 * dataset later.
 */
export const INDIA_DISTRICTS: Record<
  string,
  string[]
> = {
  "Andhra Pradesh": [
    "Alluri Sitharama Raju",
    "Anakapalli",
    "Anantapur",
    "Annamayya",
    "Bapatla",
    "Chittoor",
    "Dr. B. R. Ambedkar Konaseema",
    "East Godavari",
    "Eluru",
    "Guntur",
    "Kakinada",
    "Krishna",
    "Kurnool",
    "Nandyal",
    "NTR",
    "Palnadu",
    "Parvathipuram Manyam",
    "Prakasam",
    "Sri Potti Sriramulu Nellore",
    "Sri Sathya Sai",
    "Srikakulam",
    "Tirupati",
    "Visakhapatnam",
    "Vizianagaram",
    "West Godavari",
    "YSR Kadapa",
  ],

  Telangana: [
    "Adilabad",
    "Bhadradri Kothagudem",
    "Hanumakonda",
    "Hyderabad",
    "Jagtial",
    "Jangaon",
    "Jayashankar Bhupalpally",
    "Jogulamba Gadwal",
    "Kamareddy",
    "Karimnagar",
    "Khammam",
    "Komaram Bheem Asifabad",
    "Mahabubabad",
    "Mahabubnagar",
    "Mancherial",
    "Medak",
    "Medchal–Malkajgiri",
    "Mulugu",
    "Nagarkurnool",
    "Nalgonda",
    "Narayanpet",
    "Nirmal",
    "Nizamabad",
    "Peddapalli",
    "Rajanna Sircilla",
    "Rangareddy",
    "Sangareddy",
    "Siddipet",
    "Suryapet",
    "Vikarabad",
    "Wanaparthy",
    "Warangal",
    "Yadadri Bhuvanagiri",
  ],
};

export function getDistrictsForState(
  stateName: string
): LocationOption[] {
  return (
    INDIA_DISTRICTS[stateName] ??
    []
  ).map((district) => ({
    value: district,
    label: district,
  }));
}

export interface ParsedLocation {
  city: string;
  district: string;
  state: string;
}

export function parseLocation(
  location: string
): ParsedLocation {
  if (!location.trim()) {
    return {
      city: "",
      district: "",
      state: "",
    };
  }

  const parts = location
    .split(",")
    .map((part) => part.trim());

  if (parts.length >= 3) {
    return {
      city: parts[0] ?? "",
      district: parts[1] ?? "",
      state:
        parts
          .slice(2)
          .join(", ")
          .trim() ?? "",
    };
  }

  if (parts.length === 2) {
    return {
      city: parts[0] ?? "",
      district: "",
      state: parts[1] ?? "",
    };
  }

  const value = parts[0] ?? "";

  const isState =
    INDIA_STATES.some(
      (state) =>
        state.value === value
    );

  return isState
    ? {
        city: "",
        district: "",
        state: value,
      }
    : {
        city: value,
        district: "",
        state: "",
      };
}

export function formatLocation(
  city: string,
  district: string,
  state: string
): string {
  if (
    !city.trim() &&
    !district.trim() &&
    !state.trim()
  ) {
    return "";
  }

  return [
    city.trim(),
    district.trim(),
    state.trim(),
  ].join(", ");
}