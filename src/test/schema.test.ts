import { describe, it, expect } from "vitest";
import { step2Schema } from "../schemas/enrollmentSchema";

// 유효한 단체 신청 기본값
const validGroup = {
  enrollmentType: "group" as const,
  applicant: {
    name: "홍길동",
    email: "hong@example.com",
    phone: "010-1234-5678",
  },
  group: {
    organizationName: "(주)테스트",
    headCount: 2,
    participants: [
      { name: "김철수", email: "kim@example.com" },
      { name: "이영희", email: "lee@example.com" },
    ],
    contactPerson: "010-9999-8888",
  },
};

describe("단체 신청 cross-field 검증 (superRefine)", () => {
  it("모든 조건이 정상이면 통과한다", () => {
    expect(step2Schema.safeParse(validGroup).success).toBe(true);
  });

  it("참가자 수가 headCount보다 적으면 실패한다", () => {
    const result = step2Schema.safeParse({
      ...validGroup,
      group: {
        ...validGroup.group,
        headCount: 3, // 참가자는 2명
      },
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path.includes("participants"));
      expect(issue?.message).toContain("3명");
    }
  });

  it("참가자 수가 headCount보다 많으면 실패한다", () => {
    const result = step2Schema.safeParse({
      ...validGroup,
      group: {
        ...validGroup.group,
        headCount: 1, // headCount가 min(2) 검증에서 걸리므로 headCount=2, 참가자=3으로 테스트
      },
    });
    expect(result.success).toBe(false);
  });

  it("참가자끼리 이메일이 중복되면 실패한다", () => {
    const result = step2Schema.safeParse({
      ...validGroup,
      group: {
        ...validGroup.group,
        participants: [
          { name: "김철수", email: "same@example.com" },
          { name: "이영희", email: "same@example.com" }, // 중복
        ],
      },
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path.includes("participants"));
      expect(issue?.message).toBe("참가자 이메일이 중복됩니다.");
    }
  });

  it("참가자 이메일이 신청자 이메일과 같으면 실패한다", () => {
    const result = step2Schema.safeParse({
      ...validGroup,
      group: {
        ...validGroup.group,
        participants: [
          { name: "김철수", email: "hong@example.com" }, // 신청자(hong@)와 동일
          { name: "이영희", email: "lee@example.com" },
        ],
      },
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path.includes("participants"));
      expect(issue?.message).toBe("신청자 본인의 이메일은 참가자 명단에 포함할 수 없습니다.");
    }
  });

  it("개인 신청은 group 필드 없이 통과한다", () => {
    const result = step2Schema.safeParse({
      enrollmentType: "personal",
      applicant: {
        name: "홍길동",
        email: "hong@example.com",
        phone: "010-1234-5678",
      },
    });
    expect(result.success).toBe(true);
  });
});
