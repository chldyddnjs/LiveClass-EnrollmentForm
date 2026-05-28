import { http, HttpResponse, delay } from "msw";
import type {
  CourseListResponse,
  EnrollmentRequest,
  EnrollmentResponse,
  ErrorResponse,
} from "../types/enrollment";
import { MOCK_COURSES } from "./data";

const SIMULATED_DELAY_MS = 600;

// 이미 신청된 강의 ID 추적 (세션 내 유지)
const enrolledCourseIds = new Set<string>();

export const handlers = [
  // ──────────────────────────────────────────────────────────────
  // GET /api/courses
  // ──────────────────────────────────────────────────────────────
  http.get("/api/courses", async ({ request }) => {
    await delay(SIMULATED_DELAY_MS);

    const url = new URL(request.url);
    const category = url.searchParams.get("category");

    const filtered =
      category && category !== "all"
        ? MOCK_COURSES.filter((c) => c.category === category)
        : MOCK_COURSES;

    const response: CourseListResponse = {
      courses: filtered,
      categories: ["development", "design", "marketing", "business"],
    };

    return HttpResponse.json(response);
  }),

  // ──────────────────────────────────────────────────────────────
  // GET /api/courses/:id
  // ──────────────────────────────────────────────────────────────
  http.get("/api/courses/:id", async ({ params }) => {
    await delay(SIMULATED_DELAY_MS);

    const course = MOCK_COURSES.find((c) => c.id === params.id);

    if (!course) {
      return HttpResponse.json(
        { code: "INVALID_INPUT", message: "강의를 찾을 수 없습니다." } satisfies Partial<ErrorResponse>,
        { status: 404 }
      );
    }

    return HttpResponse.json(course);
  }),

  // ──────────────────────────────────────────────────────────────
  // POST /api/enrollments
  // ──────────────────────────────────────────────────────────────
  http.post("/api/enrollments", async ({ request }) => {
    await delay(SIMULATED_DELAY_MS);

    const body = (await request.json()) as EnrollmentRequest;
    const course = MOCK_COURSES.find((c) => c.id === body.courseId);

    // 강의 없음
    if (!course) {
      return HttpResponse.json(
        {
          code: "INVALID_INPUT",
          message: "존재하지 않는 강의입니다.",
        } satisfies ErrorResponse,
        { status: 400 }
      );
    }

    // 중복 신청
    if (enrolledCourseIds.has(body.courseId)) {
      return HttpResponse.json(
        {
          code: "DUPLICATE_ENROLLMENT",
          message: "이미 신청한 강의입니다.",
        } satisfies ErrorResponse,
        { status: 409 }
      );
    }

    // 정원 초과
    const headCount = body.type === "group" ? body.group.headCount : 1;
    const remaining = course.maxCapacity - course.currentEnrollment;
    if (remaining < headCount) {
      return HttpResponse.json(
        {
          code: "COURSE_FULL",
          message: `정원이 초과되었습니다. 현재 잔여석: ${remaining}석`,
        } satisfies ErrorResponse,
        { status: 409 }
      );
    }

    // 성공 처리
    enrolledCourseIds.add(body.courseId);
    course.currentEnrollment += headCount;

    const response: EnrollmentResponse = {
      enrollmentId: `ENR-${Date.now()}`,
      status: "confirmed",
      enrolledAt: new Date().toISOString(),
    };

    return HttpResponse.json(response, { status: 201 });
  }),
];
