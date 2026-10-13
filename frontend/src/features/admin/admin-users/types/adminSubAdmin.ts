import type {
  AdminAccessLevel,
  AdminPermission,
} from "@/features/admin/access/types";

export type SubAdminStatus =
  | "ACTIVE"
  | "DEACTIVATED";

export interface AdminSubAdmin {
  id: string;
  fullName: string;
  email: string;
  accessLevel: AdminAccessLevel;
  status: SubAdminStatus;
  enabled: boolean;
  permissions: AdminPermission[];
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminSubAdminPage {
  content: AdminSubAdmin[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface CreateSubAdminRequest {
  fullName: string;
  email: string;
  permissions: AdminPermission[];
}

export interface UpdateSubAdminPermissionsRequest {
  permissions: AdminPermission[];
}

export interface UpdateSubAdminStatusRequest {
  status: SubAdminStatus;
  reason?: string | null;
}

export interface AdminSubAdminListParams {
  page?: number;
  size?: number;
  search?: string;
  status?: SubAdminStatus | "";
}

export interface SubAdminMessageResponse {
  message: string;
}
