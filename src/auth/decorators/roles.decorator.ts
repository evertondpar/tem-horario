import { SetMetadata } from "@nestjs/common";

export type UserRole = "establishment" | "collaborator";
export const ROLES_KEY = "roles";
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
