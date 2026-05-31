import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

export const courseKeys = {
  all: ["courses"] as const,
  list: (category?: string) => [...courseKeys.all, "list", category] as const,
  detail: (id: string) => [...courseKeys.all, "detail", id] as const,
};

export function useCourses(category?: string) {
  return useQuery({
    queryKey: courseKeys.list(category),
    queryFn: () => api.getCourses(category),
  });
}

export function useCourse(id: string) {
  return useQuery({
    queryKey: courseKeys.detail(id),
    queryFn: () => api.getCourse(id),
    enabled: !!id,
  });
}