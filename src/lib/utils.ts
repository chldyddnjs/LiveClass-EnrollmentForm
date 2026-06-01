import type { CourseCategory } from "../types/enrollment";

export const CATEGORY_LABELS: Record<string | "all", string> = {
  all: "전체",
  development: "개발",
  design: "디자인",
  marketing: "마케팅",
  business: "비즈니스",
};

export const formatPrice = (price: number) => {
  return price.toLocaleString("ko-KR") + "원";
}

export const formatDateRange = (startDate: string, endDate: string) => {
  const fmt = (d: string) =>
    new Date(d).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  return `${fmt(startDate)} ~ ${fmt(endDate)}`;
}

export const getRemainingSeats = (max: number, current: number): number => {
  return max - current;
}

export const isCategoryValid = (cat: string | null): cat is CourseCategory => {
  return ["development", "design", "marketing", "business"].includes(cat ?? "");
}