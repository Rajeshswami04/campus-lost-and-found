export const USER_ROLES = ["student", "security", "admin"] as const;

export const USER_ACCOUNT_STATUSES = ["active", "blocked", "suspended"] as const;

export const ITEM_CATEGORIES = [
  "electronics",
  "documents",
  "id_card",
  "wallet",
  "keys",
  "clothing",
  "accessories",
  "books",
  "bottle",
  "bag",
  "other",
] as const;

export const LOST_ITEM_STATUSES = [
  "open",
  "under_review",
  "matched",
  "claimed",
  "returned",
  "closed",
] as const;

export const FOUND_ITEM_STATUSES = [
  "available",
  "under_verification",
  "matched",
  "claimed",
  "returned",
  "archived",
] as const;

export const HOLDER_TYPES = ["finder", "security", "admin", "office"] as const;
