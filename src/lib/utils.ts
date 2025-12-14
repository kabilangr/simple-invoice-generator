import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isIntraState(state1?: string, state2?: string): boolean {
  if (!state1 || !state2) return false;
  return state1.trim().toLowerCase() === state2.trim().toLowerCase();
}
