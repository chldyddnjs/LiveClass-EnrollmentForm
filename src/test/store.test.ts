import { describe, it, expect, beforeEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useEnrollmentStore } from "../store/enrollmentStore";

const groupStep2 = {
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

describe("switchToPersonal", () => {
  beforeEach(() => {
    const { result } = renderHook(() => useEnrollmentStore());
    act(() => result.current.clearStorage());
  });

  it("enrollmentType이 personal로 바뀐다", () => {
    const { result } = renderHook(() => useEnrollmentStore());
    act(() => result.current.setStep2(groupStep2));
    act(() => result.current.switchToPersonal());

    expect(result.current.step2?.enrollmentType).toBe("personal");
  });

  it("applicant 공통 필드는 그대로 유지된다", () => {
    const { result } = renderHook(() => useEnrollmentStore());
    act(() => result.current.setStep2(groupStep2));
    act(() => result.current.switchToPersonal());

    expect(result.current.step2?.applicant).toEqual(groupStep2.applicant);
  });

  it("group 데이터는 사라진다", () => {
    const { result } = renderHook(() => useEnrollmentStore());
    act(() => result.current.setStep2(groupStep2));
    act(() => result.current.switchToPersonal());

    expect((result.current.step2 as { group?: unknown }).group).toBeUndefined();
  });

  it("step2가 null이면 아무 변화가 없다", () => {
    const { result } = renderHook(() => useEnrollmentStore());
    act(() => result.current.switchToPersonal());

    expect(result.current.step2).toBeNull();
  });
});
