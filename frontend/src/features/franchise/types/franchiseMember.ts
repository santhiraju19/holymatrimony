/**
 * Read-only member projection returned by the franchise member API.
 *
 * Geographic authorization is enforced by the backend using the
 * authenticated franchise user's active canonical district allocation.
 * No franchise, allocation, district, or territory authorization IDs
 * are accepted from the frontend.
 */
export interface FranchiseMember {
  profileId: string;
  memberId: string | null;
  fullName: string;
  email: string;
  dateOfBirth: string | null;
  gender: string | null;
  denomination: string | null;
  churchName: string | null;
  city: string | null;
  district: string | null;
  state: string | null;
  country: string | null;
  profileCompleted: boolean | null;
  profileLive: boolean | null;
}
