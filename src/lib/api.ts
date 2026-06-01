import type {
  CourseListResponse,
  Course,
  EnrollmentRequest,
  EnrollmentResponse,
  ErrorResponse,
} from "../types/enrollment";

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const error: ErrorResponse = await res.json();
    throw error;
  }
  return res.json();
}

export const api = {
  getCourses: (category?: string): Promise<CourseListResponse> => {
    const params = category && category !== "all" ? `?category=${category}` : "";
    return fetch(`/api/courses${params}`).then(handleResponse<CourseListResponse>);
  },

  getCourse: (id: string): Promise<Course> =>
    fetch(`/api/courses/${id}`).then(handleResponse<Course>),

  postEnrollment: (body: EnrollmentRequest): Promise<EnrollmentResponse> =>
    fetch("/api/enrollments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then(handleResponse<EnrollmentResponse>),
};