import BrowseProfilesPage from "@/features/browse/components/BrowseProfilesPage";

import type {
  BrowseSearchFilters,
  BrowseSortOption,
} from "@/features/browse/types";

interface SearchPageProps {
  searchParams: Promise<
    Record<
      string,
      string |
      string[] |
      undefined
    >
  >;
}

function firstValue(
  value:
    | string
    | string[]
    | undefined
): string {
  if (
    Array.isArray(value)
  ) {
    return (
      value[0] ?? ""
    );
  }

  return (
    value ?? ""
  );
}

function sortValue(
  value: string
): BrowseSortOption {
  if (
    value === "NEWEST" ||
    value === "TRUST_VERIFIED"
  ) {
    return value;
  }

  return "RECOMMENDED";
}

export default async function SearchPage({
  searchParams,
}: SearchPageProps) {
  const params =
    await searchParams;

  const homepageLocation =
    firstValue(
      params.location
    );

  const explicitCity =
    firstValue(
      params.city
    );

  const initialFilters:
    Partial<BrowseSearchFilters> =
    {
      ageFrom:
        firstValue(
          params.ageFrom
        ),

      ageTo:
        firstValue(
          params.ageTo
        ),

      heightFrom:
        firstValue(
          params.heightFrom
        ),

      heightTo:
        firstValue(
          params.heightTo
        ),

      gender:
        firstValue(
          params.gender
        ),

      maritalStatus:
        firstValue(
          params.maritalStatus
        ),

      religion:
        firstValue(
          params.religion
        ),

      denomination:
        firstValue(
          params.denomination
        ),

      community:
        firstValue(
          params.community
        ),

      motherTongue:
        firstValue(
          params.motherTongue
        ),

      baptized:
        firstValue(
          params.baptized
        ),

      highestEducation:
        firstValue(
          params.highestEducation
        ),

      profession:
        firstValue(
          params.profession
        ),

      country:
        firstValue(
          params.country
        ),

      state:
        firstValue(
          params.state
        ),

      district:
        firstValue(
          params.district
        ),

      city:
        explicitCity ||
        homepageLocation,

      diet:
        firstValue(
          params.diet
        ),

      smoking:
        firstValue(
          params.smoking
        ),

      drinking:
        firstValue(
          params.drinking
        ),

      aadhaarVerified:
        firstValue(
          params.aadhaarVerified
        ),

      idVerified:
        firstValue(
          params.idVerified
        ),

      churchVerified:
        firstValue(
          params.churchVerified
        ),

      sort:
        sortValue(
          firstValue(
            params.sort
          )
        ),
    };

  return (
    <BrowseProfilesPage
      initialFilters={
        initialFilters
      }
    />
  );
}
