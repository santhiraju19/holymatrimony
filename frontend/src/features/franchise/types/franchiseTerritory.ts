export type FranchiseTerritoryType =
  | "CITY"
  | "MUNICIPALITY"
  | "MANDAL"
  | "TALUK"
  | "PIN_CLUSTER"
  | "CUSTOM";

export interface FranchiseTerritory {
  territoryId: string;
  territoryCode: string;
  name: string;
  territoryType: FranchiseTerritoryType;
  coverageDescription: string | null;
}

export interface UpdateFranchiseTerritoryRequest {
  name: string;
  coverageDescription: string | null;
}
