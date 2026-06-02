import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { step2Schema, type Step2FormValues } from "../../schemas/enrollmentSchema";
import { useEnrollmentStore } from "../../store/enrollmentStore";
import { useCourse } from "../../hooks/useCourses";
import { StepIndicator } from "../../components/ui/StepIndicator";
import { FormField, Input, Textarea } from "../../components/fields/FormField";
import { ParticipantList } from "../../components/fields/ParticipantList";
import { formatPrice, formatDateRange, getRemainingSeats } from "../../lib/utils";
import type { EnrollmentType, Step1Data } from "../../types/enrollment";
import { useBlocker } from "react-router-dom";

interface Step2FormProps {
  currentType: EnrollmentType;
  resolvedStep1: Step1Data;
  remaining: number | null;           // ← 추가
  onSubmit: (data: Step2FormValues) => void;
  onBack: () => void;
  onTypeSwitch: (type: EnrollmentType) => void;
  courseInfo: React.ReactNode;
  showSwitchConfirm: boolean;
  onConfirmSwitch: () => void;
  onCancelSwitch: () => void;
}

function Step2Form({
  currentType,                         // ← 추가
  onSubmit,
  onBack,
  onTypeSwitch,
  courseInfo,
  showSwitchConfirm,
  onConfirmSwitch,
  onCancelSwitch,
}: Step2FormProps) {
  const { step2 } = useEnrollmentStore();

  const getDefaultValues = (): Step2FormValues => {
    if (step2?.enrollmentType === currentType) return step2;
    if (currentType === "group") {
      return {
        enrollmentType: "group",
        applicant: { name: "", email: "", phone: "", motivation: "" },
        group: {
          organizationName: "",
          headCount: 2,
          participants: [{ name: "", email: "" }, { name: "", email: "" }],
          contactPerson: "",
        },
      };
    }
    return {
      enrollmentType: "personal",
      applicant: { name: "", email: "", phone: "", motivation: "" },
    };
  };

  const methods = useForm<Step2FormValues>({
    resolver: zodResolver(step2Schema),
    defaultValues: getDefaultValues(),
    mode: "onBlur",
  });

  const { register, handleSubmit, watch, formState: { errors } } = methods;
  const headCount = watch("group.headCount" as never) as unknown as number | undefined;
  const groupErrors = errors as {
    group?: {
      organizationName?: { message?: string };
      headCount?: { message?: string };
      contactPerson?: { message?: string };
    };
  };

  return (
    <FormProvider {...methods}>
      {courseInfo}

      <div className="mb-6 flex gap-2">
        {(["personal", "group"] as EnrollmentType[]).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => onTypeSwitch(type)}
            className={[
              "flex-1 rounded-xl border py-2.5 text-sm font-medium transition-all",
              currentType === type
                ? "border-gray-900 bg-gray-900 text-white"
                : "border-gray-200 bg-white text-gray-600 hover:border-gray-400",
            ].join(" ")}
          >
            {type === "personal" ? "개인 신청" : "단체 신청"}
          </button>
        ))}
      </div>

      {showSwitchConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl flex flex-col gap-4">
            <h3 className="text-base font-semibold text-gray-900">신청 유형을 변경할까요?</h3>
            <p className="text-sm text-gray-600">
              개인 신청으로 변경하면 단체 정보(단체명, 참가자 명단 등)가 초기화됩니다.
              신청자 공통 정보는 유지됩니다.
            </p>
            <div className="flex gap-2">
              <button
                onClick={onCancelSwitch}
                className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                취소
              </button>
              <button
                onClick={onConfirmSwitch}
                className="flex-1 rounded-xl bg-gray-900 py-2.5 text-sm font-medium text-white hover:bg-gray-700 transition"
              >
                변경
              </button>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
        <section className="rounded-2xl border bg-white p-6 flex flex-col gap-5">
          <h2 className="text-base font-semibold text-gray-900">신청자 정보</h2>

          <FormField id="name" label="이름" required error={errors.applicant?.name?.message}>
            <Input id="name" placeholder="홍길동" error={!!errors.applicant?.name} {...register("applicant.name")} />
          </FormField>

          <FormField id="email" label="이메일" required error={errors.applicant?.email?.message}>
            <Input id="email" type="email" placeholder="email@example.com" error={!!errors.applicant?.email} {...register("applicant.email")} />
          </FormField>

          <FormField id="phone" label="전화번호" required error={errors.applicant?.phone?.message}>
            <Input id="phone" type="tel" placeholder="010-1234-5678" error={!!errors.applicant?.phone} {...register("applicant.phone")} />
          </FormField>

          <FormField id="motivation" label="수강 동기" error={errors.applicant?.motivation?.message}>
            <Textarea id="motivation" placeholder="수강 동기를 자유롭게 작성해주세요. (선택, 최대 300자)" rows={4} maxLength={300} error={!!errors.applicant?.motivation} {...register("applicant.motivation")} />
          </FormField>
        </section>

        {currentType === "group" && (
          <section className="rounded-2xl border bg-white p-6 flex flex-col gap-5">
            <h2 className="text-base font-semibold text-gray-900">단체 정보</h2>

            <FormField id="organizationName" label="단체명" required error={groupErrors.group?.organizationName?.message}>
              <Input id="organizationName" placeholder="(주)회사명" {...register("group.organizationName" as never)} />
            </FormField>

            <FormField
              id="headCount"
              label="신청 인원수"
              required
              error={groupErrors.group?.headCount?.message}
            >
              <Input
                id="headCount"
                type="number"
                min={2}
                max={10}
                placeholder={
                    `2~10명`
                }
                {...register("group.headCount" as never, {
                    setValueAs: (v) => {
                    const parsed = parseInt(v);
                    return isNaN(parsed) ? undefined : parsed;
                    },
                })}
                />
            </FormField>

            {Number.isInteger(headCount) && headCount! >= 2 && headCount! <= 10 && (
              <ParticipantList headCount={headCount!} />
            )}

            <FormField id="contactPerson" label="담당자 연락처" required error={groupErrors.group?.contactPerson?.message}>
              <Input id="contactPerson" type="tel" placeholder="010-1234-5678" {...register("group.contactPerson" as never)} />
            </FormField>
          </section>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
          >
            이전
          </button>
          <button
            type="submit"
            className="flex-1 rounded-xl bg-gray-900 py-3 text-sm font-semibold text-white hover:bg-gray-700 transition"
          >
            다음 — 최종 확인
          </button>
        </div>
      </form>
    </FormProvider>
  );
}

export const Step2Page = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as Step1Data | null;

  const { step1, setStep1, setStep2, goToStep, switchToPersonal } = useEnrollmentStore();

  useEffect(() => {
    if (locationState?.courseId && !step1) {
      setStep1(locationState);
    }
  }, []);

  const resolvedStep1 = step1 ?? locationState;

  useEffect(() => {
    if (!resolvedStep1) navigate("/", { replace: true });
  }, [resolvedStep1, navigate]);

  const { data: course } = useCourse(resolvedStep1?.courseId ?? "");
  const [showSwitchConfirm, setShowSwitchConfirm] = useState(false);
  const [pendingType, setPendingType] = useState<EnrollmentType | null>(null);
  const [currentType, setCurrentType] = useState<EnrollmentType>(
    resolvedStep1?.enrollmentType ?? "personal"
  );

  // ── 이탈 방지 ────────────────────────────────────────────────────────────────
  const hasInput = !!step1; // step1이 있으면 입력 시작한 것으로 간주

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      hasInput && currentLocation.pathname !== nextLocation.pathname
  );

  // 브라우저 닫기 / 새로고침
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasInput) e.preventDefault();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasInput]);
  // ──────────────────────────────────────────────────────────────────────────────

  if (!resolvedStep1) return null;

  const remaining = course ? getRemainingSeats(course.maxCapacity, course.currentEnrollment) : null;

  function requestTypeSwitch(type: EnrollmentType) {
    if (type === currentType) return;
    if (currentType === "group") {
      setPendingType(type);
      setShowSwitchConfirm(true);
    } else {
      applyTypeSwitch(type);
    }
  }

  function applyTypeSwitch(type: EnrollmentType) {
    switchToPersonal();
    setStep1({ ...resolvedStep1!, enrollmentType: type });
    setCurrentType(type);
    setShowSwitchConfirm(false);
    setPendingType(null);
  }

  function handleSubmit(data: Step2FormValues) {
    setStep2(data);
    goToStep(3);
    navigate("/enroll/step3");
  }

  const courseInfo = course ? (
    <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 flex items-center justify-between gap-4">
      <div className="flex flex-col gap-0.5 min-w-0">
        <p className="text-xs text-gray-400">선택된 강의</p>
        <p className="text-sm font-semibold text-gray-900 truncate">{course.title}</p>
        <p className="text-xs text-gray-500">{formatDateRange(course.startDate, course.endDate)}</p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-sm font-bold text-gray-900">{formatPrice(course.price)}</p>
        {remaining !== null && remaining <= 5 && (
          <p className="text-xs text-red-500 mt-0.5">잔여 {remaining}석</p>
        )}
      </div>
    </div>
  ) : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-2xl px-4 py-5">
          <StepIndicator currentStep={2} />
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8">
        {/* 이탈 방지 다이얼로그 */}
        {blocker.state === "blocked" && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl flex flex-col gap-4">
              <h3 className="text-base font-semibold text-gray-900">다음 단계로 진행합니다.</h3>
              <p className="text-sm text-gray-600">
                현재 페이지를 벗어나도 작성한 내용은 임시 저장됩니다.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => blocker.reset()}
                  className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                >
                  계속 작성
                </button>
                <button
                  onClick={() => blocker.proceed()}
                  className="flex-1 rounded-xl bg-gray-900 py-2.5 text-sm font-medium text-white hover:bg-gray-700 transition"
                >
                  나가기
                </button>
              </div>
            </div>
          </div>
        )}

        <Step2Form
          key={currentType}
          currentType={currentType}
          resolvedStep1={resolvedStep1}
          remaining={remaining}
          onSubmit={handleSubmit}
          onBack={() => navigate(-1)}
          onTypeSwitch={requestTypeSwitch}
          courseInfo={courseInfo}
          showSwitchConfirm={showSwitchConfirm}
          onConfirmSwitch={() => pendingType && applyTypeSwitch(pendingType)}
          onCancelSwitch={() => { setShowSwitchConfirm(false); setPendingType(null); }}
        />
      </main>
    </div>
  );
};