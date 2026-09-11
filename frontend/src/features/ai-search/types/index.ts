export interface AiSearchFilters {
  ageFrom: number | null;
  ageTo: number | null;

  heightFrom: number | null;
  heightTo: number | null;

  maritalStatus: string | null;

  religion: string | null;
  denomination: string | null;
  community: string | null;
  motherTongue: string | null;

  baptized: boolean | null;

  highestEducation: string | null;
  profession: string | null;

  country: string | null;
  state: string | null;
  district: string | null;
  city: string | null;

  diet: string | null;
  smoking: string | null;
  drinking: string | null;

  aadhaarVerified: boolean | null;
  idVerified: boolean | null;
  churchVerified: boolean | null;
}

export interface AiSearchInterpretation {
  originalQuery: string;
  understoodAs: string | null;
  filters: AiSearchFilters;
  aiInterpreted: boolean;
}

export interface AiSearchApiEnvelope {
  success: boolean;
  message: string;
  data: AiSearchInterpretation;
}
