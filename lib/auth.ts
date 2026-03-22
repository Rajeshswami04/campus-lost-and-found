import jwt from "jsonwebtoken";

export type AuthUser = {
  id: string;
  username: string;
  email: string;
  role: "student" | "security" | "admin";
  accountStatus: "active" | "blocked" | "suspended";
};

export function verifyAuthToken(token: string) {
  return jwt.verify(token, process.env.TOKEN_SECRET!) as AuthUser;
}

export function hasRequiredRole(userRole: AuthUser["role"], allowedRoles: AuthUser["role"][]) {
  return allowedRoles.includes(userRole);
}
