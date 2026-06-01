import { z } from "zod";

// ────────────────────────────────────────────────────────────────────────────
// 공통 필드 스키마
// ────────────────────────────────────────────────────────────────────────────

const phoneRegex = /^(010)-?\d{3,4}-?\d{4}$/;

export const applicantSchema = z.object({
  name: z
    .string()
    .min(2, "이름은 2자 이상이어야 합니다.")
    .max(20, "이름은 20자 이하여야 합니다."),
  email: z
    .email({ message: "올바른 이메일 형식이 아닙니다." }),
  phone: z
    .string()
    .regex(phoneRegex, "올바른 한국 전화번호 형식이 아닙니다. (예: 010-1234-5678)"),
  motivation: z
    .string()
    .max(2000, "수강 동기는 2000자 이하여야 합니다.")
    .optional(),
});

export const participantSchema = z.object({
  name: z.string().min(1, "참가자 이름을 입력해주세요."),
  email: z.email({ message: "올바른 이메일 형식이 아닙니다." }),
});

// ────────────────────────────────────────────────────────────────────────────
// Step 1: 강의 선택
// ────────────────────────────────────────────────────────────────────────────

export const step1Schema = z.object({
  courseId: z.string().min(1, "강의를 선택해주세요."),
  enrollmentType: z.enum(["personal", "group"], {
    error: "신청 유형을 선택해주세요.",
  }),
});

export type Step1FormValues = z.infer<typeof step1Schema>;

// ────────────────────────────────────────────────────────────────────────────
// Step 2: 수강생 정보 — discriminated union
// ────────────────────────────────────────────────────────────────────────────

const personalStep2Schema = z.object({
  enrollmentType: z.literal("personal"),
  applicant: applicantSchema,
});

const groupStep2Schema = z
  .object({
    enrollmentType: z.literal("group"),
    applicant: applicantSchema,
    group: z.object({
      organizationName: z.string().min(1, "단체명을 입력해주세요."),
      headCount: z
        .number({ error: "인원수를 입력해주세요." })
        .int("인원수는 정수여야 합니다.")
        .min(2, "단체 신청은 최소 2명이어야 합니다."),
      participants: z
        .array(participantSchema)
        .min(1, "참가자 명단을 입력해주세요."),
      contactPerson: z
        .string()
        .regex(phoneRegex, "올바른 한국 전화번호 형식이 아닙니다."),
    }),
  })
  .superRefine((data, ctx) => {
    const { applicant, group } = data;

    // 참가자 수와 headCount 일치 검증
    if (group.participants.length !== group.headCount) {
      ctx.addIssue({
        code: "custom",
        message: `참가자 명단은 신청 인원수(${group.headCount}명)와 일치해야 합니다.`,
        path: ["group", "participants"],
      });
    }

    // 참가자 이메일 중복 검증
    const emails = group.participants.map((p) => p.email).filter(Boolean);
    const uniqueEmails = new Set(emails);
    if (uniqueEmails.size !== emails.length) {
      ctx.addIssue({
        code: "custom",
        message: "참가자 이메일이 중복됩니다.",
        path: ["group", "participants"],
      });
    }

    // 신청자 본인 이메일과 참가자 이메일 중복 검증
    if (emails.includes(applicant.email)) {
      ctx.addIssue({
        code: "custom",
        message: "신청자 본인의 이메일은 참가자 명단에 포함할 수 없습니다.",
        path: ["group", "participants"],
      });
    }
  });

export const step2Schema = z.discriminatedUnion("enrollmentType", [
  personalStep2Schema,
  groupStep2Schema,
]);

export type Step2FormValues = z.infer<typeof step2Schema>;
export type PersonalStep2Values = z.infer<typeof personalStep2Schema>;
export type GroupStep2Values = z.infer<typeof groupStep2Schema>;

// ────────────────────────────────────────────────────────────────────────────
// 전체 폼 통합 스키마 (최종 제출 시 사용)
// ────────────────────────────────────────────────────────────────────────────

const personalEnrollmentSchema = z.object({
  courseId: z.string().min(1),
  type: z.literal("personal"),
  applicant: applicantSchema,
  agreedToTerms: z.literal(true),
});

const groupEnrollmentSchema = z.object({
  courseId: z.string().min(1),
  type: z.literal("group"),
  applicant: applicantSchema,
  group: z.object({
    organizationName: z.string().min(1),
    headCount: z
      .number({ error: "인원수를 입력해주세요." })
      .int({ error: "인원수는 정수여야 합니다." })
      .min(2,"인원수는 2명 이상이어야 합니다.")
      .max(10,"인원수는 10명 이하여야 합니다."),
    participants: z.array(participantSchema),
    contactPerson: z.string().regex(phoneRegex),
  }),
  agreedToTerms: z.literal(true),
});

export const enrollmentSchema = z.discriminatedUnion("type", [
  personalEnrollmentSchema,
  groupEnrollmentSchema,
]);

export type EnrollmentFormValues = z.infer<typeof enrollmentSchema>;