export type CourseCategory = "development" | "design" | "marketing" | "business";

export interface Course {
  id: string;
  title: string;
  description: string;
  category: CourseCategory;
  price: number;
  maxCapacity: number;
  currentEnrollment: number;
  startDate: string; // ISO 8601
  endDate: string;   // ISO 8601
  instructor: string;
  imageUrl?: string;
}

export interface CourseListResponse {
  courses: Course[];
  categories: CourseCategory[];
}

// ────────────────────────────────────────────────────────────────────────────
// Applicant (공통)
// ────────────────────────────────────────────────────────────────────────────

export interface Applicant {
  name: string;
  email: string;
  phone: string;
  motivation?: string;
}

// ────────────────────────────────────────────────────────────────────────────
// Enrollment Request — discriminated union
// ────────────────────────────────────────────────────────────────────────────

export interface Participant {
  name: string;
  email: string;
}

export interface GroupInfo {
  organizationName: string;
  headCount: number;
  participants: Participant[];
  contactPerson: string;
}

export interface PersonalEnrollmentRequest {
  courseId: string;
  type: "personal";
  applicant: Applicant;
  agreedToTerms: boolean;
}

export interface GroupEnrollmentRequest {
  courseId: string;
  type: "group";
  applicant: Applicant;
  group: GroupInfo;
  agreedToTerms: boolean;
}

export type EnrollmentRequest = PersonalEnrollmentRequest | GroupEnrollmentRequest;

// ────────────────────────────────────────────────────────────────────────────
// Enrollment Response
// ────────────────────────────────────────────────────────────────────────────

export interface EnrollmentResponse {
  enrollmentId: string;
  status: "confirmed" | "pending";
  enrolledAt: string;
}

// ────────────────────────────────────────────────────────────────────────────
// Error
// ────────────────────────────────────────────────────────────────────────────

export type EnrollmentErrorCode =
  | "COURSE_FULL"
  | "DUPLICATE_ENROLLMENT"
  | "INVALID_INPUT";

export interface ErrorResponse {
  code: EnrollmentErrorCode;
  message: string;
  details?: Record<string, string>;
}

// ────────────────────────────────────────────────────────────────────────────
// Form State (멀티스텝 통합 상태)
// ────────────────────────────────────────────────────────────────────────────

export type EnrollmentType = "personal" | "group";

export interface Step1Data {
  courseId: string;
  enrollmentType: EnrollmentType;
}

export interface Step2PersonalData {
  enrollmentType: "personal";
  applicant: Applicant;
}

export interface Step2GroupData {
  enrollmentType: "group";
  applicant: Applicant;
  group: GroupInfo;
}

export type Step2Data = Step2PersonalData | Step2GroupData;

export interface FormState {
  step1: Step1Data | null;
  step2: Step2Data | null;
  agreedToTerms: boolean;
}

export const STEPS = [
  { id: 1, label: "강의 선택" },
  { id: 2, label: "신청자 정보" },
  { id: 3, label: "확인 및 제출" },
] as const;

export type StepId = (typeof STEPS)[number]["id"];
