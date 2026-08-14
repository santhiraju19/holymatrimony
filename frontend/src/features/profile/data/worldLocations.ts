import {
  City,
  Country,
  State,
} from "country-state-city";

export interface CountryOption {
  value: string;
  label: string;
  isoCode: string;
}

export interface StateOption {
  value: string;
  label: string;
  isoCode: string;
}

export interface CityOption {
  value: string;
  label: string;
}

/*
 * =========================================================
 * Countries
 * =========================================================
 */

export const COUNTRIES: CountryOption[] =
  Country.getAllCountries()
    .map((country) => ({
      value: country.name,
      label: country.name,
      isoCode: country.isoCode,
    }))
    .sort((first, second) =>
      first.label.localeCompare(
        second.label
      )
    );

/*
 * =========================================================
 * Country helpers
 * =========================================================
 */

export function getCountryIsoCode(
  countryName: string
): string {
  if (!countryName.trim()) {
    return "";
  }

  return (
    COUNTRIES.find(
      (country) =>
        country.value ===
        countryName
    )?.isoCode ?? ""
  );
}

/*
 * =========================================================
 * States
 * =========================================================
 */

export function getStatesForCountry(
  countryName: string
): StateOption[] {
  const countryCode =
    getCountryIsoCode(
      countryName
    );

  if (!countryCode) {
    return [];
  }

  return State.getStatesOfCountry(
    countryCode
  )
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
}

export function getStateIsoCode(
  countryName: string,
  stateName: string
): string {
  if (
    !countryName.trim() ||
    !stateName.trim()
  ) {
    return "";
  }

  return (
    getStatesForCountry(
      countryName
    ).find(
      (state) =>
        state.value ===
        stateName
    )?.isoCode ?? ""
  );
}

/*
 * =========================================================
 * Cities for selected Country + State
 * =========================================================
 */

export function getCitiesForCountryState(
  countryName: string,
  stateName: string
): CityOption[] {
  const countryCode =
    getCountryIsoCode(
      countryName
    );

  const stateCode =
    getStateIsoCode(
      countryName,
      stateName
    );

  if (
    !countryCode ||
    !stateCode
  ) {
    return [];
  }

  const names = new Set(
    City.getCitiesOfState(
      countryCode,
      stateCode
    )
      .map((city) =>
        city.name.trim()
      )
      .filter(Boolean)
  );

  return Array.from(names)
    .sort((first, second) =>
      first.localeCompare(
        second
      )
    )
    .map((city) => ({
      value: city,
      label: city,
    }));
}
