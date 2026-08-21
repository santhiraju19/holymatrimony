import BrowseProfilesPage from "@/features/browse/components/BrowseProfilesPage";

import type {
  BrowseSearchFilters,
} from "@/features/browse/types";

interface SearchPageProps {
  searchParams: Promise<{
    ageFrom?: string | string[];
    ageTo?: string | string[];
    religion?: string | string[];
    denomination?: string | string[];
    location?: string | string[];
  }>;
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

export default async function SearchPage({
  searchParams,
}: SearchPageProps) {
  const params =
    await searchParams;

  const location =
    firstValue(
      params.location
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

      religion:
        firstValue(
          params.religion
        ),

      denomination:
        firstValue(
          params.denomination
        ),

      /*
       * Homepage Quick Search uses a lightweight
       * free-text Location field.
       *
       * For now it maps to City.
       */
      city:
        location,
    };

  return (
    <BrowseProfilesPage
      initialFilters={
        initialFilters
      }
    />
  );
}
