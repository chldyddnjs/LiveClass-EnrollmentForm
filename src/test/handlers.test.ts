import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import { setupServer } from "msw/node";
import { handlers, enrolledCourseIds } from "../mocks/handlers";
import { MOCK_COURSES } from "../mocks/data";

const server = setupServer(...handlers);

// 테스트 시작 전 원본 enrollment 수치 저장
const ORIGINAL_ENROLLMENTS = new Map(
  MOCK_COURSES.map((c) => [c.id, c.currentEnrollment])
);

beforeAll(() => server.listen({ onUnhandledRequest: "bypass" }));
afterEach(() => {
  enrolledCourseIds.clear();
  // 각 테스트 후 MOCK_COURSES 원복
  MOCK_COURSES.forEach((c) => {
    c.currentEnrollment = ORIGINAL_ENROLLMENTS.get(c.id)!;
  });
});
afterAll(() => server.close());

const post = (body: object) =>
  fetch("/api/enrollments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

const personalBody = {
  courseId: "course-002", // 잔여석 충분한 강의
  type: "personal",
  applicant: { name: "홍길동", email: "hong@example.com", phone: "010-1234-5678" },
  agreedToTerms: true,
};

describe("수강 신청 비즈니스 규칙", () => {
  it("정원이 만석이면 COURSE_FULL을 반환한다", async () => {
    // course-001을 강제로 만석으로 설정
    const course = MOCK_COURSES.find((c) => c.id === "course-001")!;
    course.currentEnrollment = course.maxCapacity;

    const res = await post({ ...personalBody, courseId: "course-001" });
    const data = await res.json();

    expect(res.status).toBe(409);
    expect(data.code).toBe("COURSE_FULL");
  });

  it("같은 강의를 두 번 신청하면 DUPLICATE_ENROLLMENT를 반환한다", async () => {
    await post(personalBody);
    const res = await post(personalBody);
    const data = await res.json();

    expect(res.status).toBe(409);
    expect(data.code).toBe("DUPLICATE_ENROLLMENT");
  });

  it("단체 신청 성공 시 currentEnrollment가 headCount만큼 증가한다", async () => {
    const courseId = "course-006";
    const before = MOCK_COURSES.find((c) => c.id === courseId)!.currentEnrollment;

    await post({
      courseId,
      type: "group",
      applicant: { name: "홍길동", email: "hong@example.com", phone: "010-1234-5678" },
      group: {
        organizationName: "(주)테스트",
        headCount: 3,
        participants: [
          { name: "김철수", email: "kim@example.com" },
          { name: "이영희", email: "lee@example.com" },
          { name: "박민수", email: "park@example.com" },
        ],
        contactPerson: "010-9999-8888",
      },
      agreedToTerms: true,
    });

    const after = MOCK_COURSES.find((c) => c.id === courseId)!.currentEnrollment;
    expect(after).toBe(before + 3);
  });

  it("단체 신청 인원이 잔여석을 초과하면 COURSE_FULL을 반환한다", async () => {
    // course-001 잔여석을 1석으로 설정
    const course = MOCK_COURSES.find((c) => c.id === "course-001")!;
    course.currentEnrollment = course.maxCapacity - 1;

    const res = await post({
      courseId: "course-001",
      type: "group",
      applicant: { name: "홍길동", email: "hong@example.com", phone: "010-1234-5678" },
      group: {
        organizationName: "(주)테스트",
        headCount: 2, // 잔여 1석인데 2명 신청
        participants: [
          { name: "김철수", email: "kim@example.com" },
          { name: "이영희", email: "lee@example.com" },
        ],
        contactPerson: "010-9999-8888",
      },
      agreedToTerms: true,
    });
    const data = await res.json();

    expect(res.status).toBe(409);
    expect(data.code).toBe("COURSE_FULL");
  });
});
