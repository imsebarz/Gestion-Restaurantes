import { GraphQLContext } from "../context";
import { RoleEnum } from "@prisma/client";

/**
 * Validates that the user has the required role to perform an action
 * @param context GraphQL context containing user information
 * @param allowedRoles Array of roles that are allowed to perform the action
 * @throws Error if user is not authenticated or doesn't have required role
 */
export function requireRole(context: GraphQLContext, allowedRoles: RoleEnum[]): void {
  if (!context.user) {
    throw new Error("No autorizado");
  }
  if (!allowedRoles.includes(context.user.role)) {
    throw new Error("Permiso insuficiente");
  }
}

/**
 * Validates that the user is authenticated
 * @param context GraphQL context containing user information
 * @throws Error if user is not authenticated
 */
export function requireAuth(context: GraphQLContext): void {
  if (!context.user) {
    throw new Error("No autorizado");
  }
}

/**
 * Checks if user has admin privileges (MANAGER or SUPERADMIN)
 * @param context GraphQL context containing user information
 * @returns true if user is admin, false otherwise
 */
export function isAdmin(context: GraphQLContext): boolean {
  return context.user?.role === RoleEnum.MANAGER || context.user?.role === RoleEnum.SUPERADMIN;
}

/**
 * Validates that the user has admin privileges
 * @param context GraphQL context containing user information
 * @throws Error if user is not authenticated or not an admin
 */
export function requireAdmin(context: GraphQLContext): void {
  requireAuth(context);
  if (!isAdmin(context)) {
    throw new Error("Permiso insuficiente - se requieren privilegios de administrador");
  }
}