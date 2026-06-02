import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useEnrollmentStore } from "../../store/enrollmentStore";
import { useCourse } from "../../hooks/useCourses";
import { api } from "../../lib/api";
import { StepIndicator } from "../../components/ui/StepIndicator";
import { formatPrice, formatDateRange } from "../../lib/utils";
import type { EnrollmentRequest, ErrorResponse } from "../../types/enrollment";
import { useQueryClient } from "@tanstack/react-query";
import { courseKeys } from "../../hooks/useCourses";



export function Step3Page() {
  const navigate = useNavigate();
  const { step1, step2, agreedToTerms, setAgreedToTerms, goToStep } =
    useEnrollmentStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { data: course } = useCourse(step1?.courseId ?? "");
  const nextStep = "/enroll/step2";

  // 컴포넌트 안에 추가
  const queryClient = useQueryClient();
  // 렌더 중 navigate 직접 호출 금지 → useEffect로 처리
  useEffect(() => {
    if (!step1 || !step2) {
      navigate("/", { replace: true });
    }
  }, [step1, step2, navigate]);

  async function handleSubmit() {
    if (!agreedToTerms || !step1 || !step2 || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const body: EnrollmentRequest =
        step2.enrollmentType === "group"
          ? {
              courseId: step1.courseId,
              type: "group",
              applicant: step2.applicant,
              group: step2.group,
              agreedToTerms: true,
            }
          : {
              courseId: step1.courseId,
              type: "personal",
              applicant: step2.applicant,
              agreedToTerms: true,
            };

            
      const response = await api.postEnrollment(body);
      // 캐시 무효화 → 목록/상세 페이지 재조회
      await queryClient.invalidateQueries({ queryKey: courseKeys.all });

      navigate("/enroll/complete", {
        state: {
          response,
          courseName: course?.title ?? "",
          enrollmentType: step1.enrollmentType,
        },
        replace: true,
      });
    } catch (err) {
      const error = err as ErrorResponse;
      const messages: Record<string, string> = {
        COURSE_FULL: "정원이 초과되었습니다. 다른 강의를 선택해주세요.",
        DUPLICATE_ENROLLMENT: "이미 신청한 강의입니다.",
        INVALID_INPUT: "입력 정보를 다시 확인해주세요.",
      };
      setSubmitError(
        messages[error.code] ?? "일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
      );

      if (error.code === "COURSE_FULL") {
        setTimeout(() => {
          goToStep(1);
          navigate("/");
        }, 2500);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  // useEffect가 navigate를 처리하는 동안 빈 화면 방지
  if (!step1 || !step2) return null;

  const isGroup = step2.enrollmentType === "group";

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-2xl px-4 py-5">
          <StepIndicator currentStep={3} />
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8 flex flex-col gap-5">

        {/* 강의 정보 */}
        <Section title="강의 정보" onEdit={() => { goToStep(1); navigate("/"); }}>
          {course ? (
            <div className="flex flex-col gap-2">
              <p className="text-sm font-semibold text-gray-900">{course.title}</p>
              <p className="text-xs text-gray-500">{course.instructor} 강사</p>
              <p className="text-xs text-gray-500">{formatDateRange(course.startDate, course.endDate)}</p>
              <p className="text-sm font-bold text-gray-900 mt-1">{formatPrice(course.price)}</p>
              <div className="mt-1">
                <span className={[
                  "text-xs font-medium px-2.5 py-1 rounded-full",
                  isGroup ? "bg-blue-50 text-blue-700" : "bg-green-50 text-green-800",
                ].join(" ")}>
                  {isGroup ? "단체 신청" : "개인 신청"}
                </span>
              </div>
            </div>
          ) : (
            <SkeletonLine />
          )}
        </Section>

        {/* 신청자 정보 */}
        <Section title="신청자 정보" onEdit={() => { 
            goToStep(2); 
            navigate(nextStep, { state: step1 }); 
        }}>
          <dl className="flex flex-col gap-2.5">
            <SummaryRow label="이름" value={step2.applicant.name} />
            <SummaryRow label="이메일" value={step2.applicant.email} />
            <SummaryRow label="전화번호" value={step2.applicant.phone} />
            {step2.applicant.motivation && (
              <SummaryRow label="수강 동기" value={step2.applicant.motivation} multiline />
            )}
          </dl>
        </Section>

        {/* 단체 정보 */}
        {isGroup && (
          <Section title="단체 정보" onEdit={() => { 
            goToStep(2);
            navigate(nextStep, { state: step1 });
        }}>
            <dl className="flex flex-col gap-2.5">
              <SummaryRow label="단체명" value={step2.group.organizationName} />
              <SummaryRow label="신청 인원" value={`${step2.group.headCount}명`} />
              <SummaryRow label="담당자 연락처" value={step2.group.contactPerson} />
            </dl>

            <div className="mt-4 flex flex-col gap-2">
              <p className="text-xs font-medium text-gray-500">참가자 명단</p>
              { step2.group.participants.map((p, i) => (
                <div key={i} className="flex justify-between items-center text-sm py-2 border-b border-gray-100 last:border-0">
                  <span className="text-gray-900">{p.name}</span>
                  <span className="text-gray-500 text-xs">{p.email}</span>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* 이용약관 */}
        <div className="rounded-2xl border bg-white p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-2 text-sm text-gray-600 bg-gray-50 rounded-xl p-4 leading-relaxed max-h-32 overflow-y-auto">
            <p className="font-medium text-gray-900">이용약관</p>
            <p>본 수강 신청은 확정 후 취소 시 환불 규정에 따라 처리됩니다. 강의 시작 7일 전까지 전액 환불, 3일 전까지 50% 환불, 이후 환불 불가합니다. 수집된 개인정보는 수강 운영 목적으로만 사용되며 제3자에게 제공되지 않습니다.</p>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-gray-900 accent-gray-900"
            />
            <span className="text-sm text-gray-700">
              이용약관에 동의합니다 <span className="text-red-500">*</span>
            </span>
          </label>
        </div>

        {/* 에러 메시지 */}
        {submitError && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600" role="alert">
            {submitError}
          </div>
        )}

        {/* 버튼 */}
        <div className="flex gap-3 pb-8">
          <button
            onClick={() => { goToStep(2); navigate(nextStep, { state: step1 }); }}
            className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            이전
          </button>
          <button
            onClick={handleSubmit}
            disabled={!agreedToTerms || isSubmitting}
            className={[
              "flex-1 rounded-xl py-3 text-sm font-semibold transition-all",
              agreedToTerms && !isSubmitting
                ? "bg-gray-900 text-white hover:bg-gray-700"
                : "bg-gray-200 text-gray-400 cursor-not-allowed",
            ].join(" ")}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <SpinnerIcon />
                제출 중...
              </span>
            ) : (
              "신청 완료"
            )}
          </button>
        </div>
      </main>
    </div>
  );
}

// ── 서브 컴포넌트 ──────────────────────────────────────────────────────────────

function Section({
  title,
  onEdit,
  children,
}: {
  title: string;
  onEdit: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border bg-white p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
        <button
          onClick={onEdit}
          className="text-xs text-indigo-600 hover:text-indigo-800 transition-colors font-medium"
        >
          수정
        </button>
      </div>
      {children}
    </div>
  );
}

function SummaryRow({ label, value, multiline = false }: { label: string; value: string; multiline?: boolean }) {
  return (
    <div className={["flex gap-4", multiline ? "flex-col" : "justify-between items-center"].join(" ")}>
      <dt className="text-xs text-gray-500 shrink-0">{label}</dt>
      <dd className={["text-sm text-gray-900", multiline ? "" : "text-right"].join(" ")}>{value}</dd>
    </div>
  );
}

function SkeletonLine() {
  return <div className="h-4 w-48 rounded bg-gray-100 animate-pulse" />;
}

function SpinnerIcon() {
  return (
    <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}