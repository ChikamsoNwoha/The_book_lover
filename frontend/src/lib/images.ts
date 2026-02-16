import { API_BASE_URL } from "./api";

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

const isAbsoluteUrl = (value: string) => /^https?:\/\//i.test(value);

export const resolveImageUrl = (value?: string | null) => {
  if (!value || typeof value !== "string") return null;
  if (isAbsoluteUrl(value)) return value;
  if (value.startsWith("/uploads/")) {
    return `${trimTrailingSlash(API_BASE_URL)}${value}`;
  }
  return value;
};
