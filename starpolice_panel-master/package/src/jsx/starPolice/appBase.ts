import type { PanelType } from "./types";

export const APP_BASE = import.meta.env.BASE_URL.replace(/\/$/, "") || "";

export function stripAppBase(pathname: string): string {
  if (!APP_BASE) return pathname;
  if (pathname === APP_BASE) return "/";
  if (pathname.startsWith(`${APP_BASE}/`)) {
    return pathname.slice(APP_BASE.length) || "/";
  }
  return pathname;
}

export function resolvePanelFromPath(pathname: string): PanelType {
  const path = stripAppBase(pathname);
  if (path.startsWith("/student")) return "student";
  if (path.startsWith("/staff")) return "staff";
  return "admin";
}

export function toAbsoluteAppPath(route: string): string {
  const normalized = route.startsWith("/") ? route : `/${route}`;
  return `${APP_BASE}${normalized}`;
}
