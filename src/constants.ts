import { PrizeTier } from "./types";

export const TICKET_PRICE = 10;
export const TOTAL_USERS_TARGET = 100000;
export const PRIZE_POOL_PERCENTAGE = 0.9;

export const PRIZE_TIERS: PrizeTier[] = [
  { level: 1, percentage: 40, label: "الجائزة الكبرى" },
  { level: 2, percentage: 20, label: "الجائزة الثانية" },
  { level: 3, percentage: 20, label: "الجائزة الثالثة (فائزان)" },
  { level: 4, percentage: 20, label: "جوائز ترضية (10 فائزين)" },
];
