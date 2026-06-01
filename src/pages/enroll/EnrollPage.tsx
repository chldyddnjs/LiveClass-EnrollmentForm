import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useCourse } from "../../hooks/useCourses";
import { useEnrollmentStore } from "../../store/enrollmentStore";
import { StepIndicator } from "../../components/ui/StepIndicator";
import { formatPrice, formatDateRange, getRemainingSeats } from "../../lib/utils";
import type { EnrollmentType } from "../../types/enrollment";

const LOW_SEAT_THRESHOLD = 5;

export const EnrollPage = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { setStep1, goToStep } = useEnrollmentStore();

  const { data: course, isLoading, isError } = useCourse(courseId ?? "");

  // CourseDetailPage에서 넘어온 enrollmentType (있으면 바로 선택 표시)
  const locationState = location.state as { enrollmentType?: EnrollmentType } | null;
  const preselectedType = locationState?.enrollmentType;

  function handleSelect(type: EnrollmentType) {
    if (!courseId) return;
    setStep1({ courseId, enrollmentType: type });
    goToStep(2);
    navigate("/enroll/step2");
  }

  if (isLoading) return <EnrollPageSkeleton />;

  if (isError || !course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center flex flex-col gap-3">
          <p className="text-sm font-medium text-gray-900">강의 정보를 불러오지 못했습니다.</p>
          <button
            onClick={() => navigate("/")}
            className="text-sm text-indigo-600 hover:underline"
          >
            목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  const remaining = getRemainingSeats(course.maxCapacity, course.currentEnrollment);
  const isFull = remaining <= 0;
  const isLow = !isFull && remaining <= LOW_SEAT_THRESHOLD;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-2xl px-4 py-5">
          <StepIndicator currentStep={1} />
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8 flex flex-col gap-6">

        {/* 강의 요약 카드 */}
        <div className="rounded-2xl border bg-white overflow-hidden">
          <div className="aspect-video w-full overflow-hidden bg-gray-100">
            <img
              src={course.imageUrl ?? `https://placehold.co/800x450/e5e7eb/9ca3af?text=${encodeURIComponent(course.title)}`}
              alt={course.title}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="p-6 flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-indigo-600 uppercase tracking-wide">
                {course.category}
              </span>
              <h1 className="text-lg font-bold text-gray-900 leading-snug">
                {course.title}
              </h1>
              <p className="text-sm text-gray-500">{course.instructor} 강사</p>
            </div>

            <dl className="flex flex-col gap-2.5 border-t border-gray-100 pt-4">
              <InfoRow label="일정" value={formatDateRange(course.startDate, course.endDate)} />
              <InfoRow
                label="정원"
                value={
                  isFull
                    ? "마감"
                    : isLow
                      ? `잔여 ${remaining}석 / ${course.maxCapacity}명`
                      : `${course.maxCapacity}명`
                }
                valueClassName={isFull ? "text-gray-400" : isLow ? "text-red-500 font-semibold" : ""}
              />
              <InfoRow label="수강료" value={formatPrice(course.price)} valueClassName="font-bold text-gray-900" />
            </dl>
          </div>
        </div>

        {/* 신청 유형 선택 */}
        <div className="rounded-2xl border bg-white p-6 flex flex-col gap-4">
          <div>
            <h2 className="text-base font-semibold text-gray-900">신청 유형 선택</h2>
            <p className="mt-1 text-sm text-gray-500">개인 또는 단체로 신청할 수 있습니다.</p>
          </div>

          {isFull ? (
            <div className="rounded-xl bg-gray-100 py-4 text-center text-sm font-medium text-gray-400">
              정원이 마감되었습니다
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <EnrollTypeButton
                type="personal"
                selected={preselectedType === "personal"}
                title="개인 신청"
                description="혼자 수강하는 경우 선택하세요."
                onClick={() => handleSelect("personal")}
              />
              <EnrollTypeButton
                type="group"
                selected={preselectedType === "group"}
                title="단체 신청"
                description="2~10명이 함께 신청하는 경우 선택하세요."
                onClick={() => handleSelect("group")}
              />
            </div>
          )}

          {isLow && !isFull && (
            <p className="text-center text-xs text-red-500">
              ⚠ 마감 임박! 서둘러 신청하세요.
            </p>
          )}
        </div>

        {/* 뒤로가기 */}
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-gray-500 hover:text-gray-900 transition-colors text-center"
        >
          ← 강의 상세로 돌아가기
        </button>
      </main>
    </div>
  );
}

// ── 서브 컴포넌트 ──────────────────────────────────────────────────────────────

interface EnrollTypeButtonProps {
  type: EnrollmentType;
  selected: boolean;
  title: string;
  description: string;
  onClick: () => void;
}

function EnrollTypeButton({ selected, title, description, onClick }: EnrollTypeButtonProps) {
  return (
    <button
      onClick={onClick}
      className={[
        "w-full flex items-center gap-4 rounded-xl border p-4 text-left transition-all",
        selected
          ? "border-gray-900 bg-gray-50 ring-1 ring-gray-900"
          : "border-gray-200 bg-white hover:border-gray-400",
      ].join(" ")}
    >
      <div className={[
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg",
        selected ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-500",
      ].join(" ")}>
        {title === "개인 신청" ? "👤" : "👥"}
      </div>
      <div className="flex flex-col gap-0.5">
        <p className="text-sm font-semibold text-gray-900">{title}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
      <div className={[
        "ml-auto h-4 w-4 shrink-0 rounded-full border-2 transition-all",
        selected ? "border-gray-900 bg-gray-900" : "border-gray-300",
      ].join(" ")} />
    </button>
  );
}

function InfoRow({
  label,
  value,
  valueClassName = "",
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex justify-between items-center gap-4">
      <dt className="text-xs text-gray-500 shrink-0">{label}</dt>
      <dd className={["text-sm text-right", valueClassName || "text-gray-900"].join(" ")}>{value}</dd>
    </div>
  );
}

function EnrollPageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b border-gray-200 bg-white h-16" />
      <div className="mx-auto max-w-2xl px-4 py-8 flex flex-col gap-6 animate-pulse">
        <div className="rounded-2xl border bg-white overflow-hidden">
          <div className="aspect-video bg-gray-200" />
          <div className="p-6 flex flex-col gap-4">
            <div className="h-4 w-16 rounded bg-gray-200" />
            <div className="h-6 w-3/4 rounded bg-gray-200" />
            <div className="h-4 w-24 rounded bg-gray-200" />
          </div>
        </div>
        <div className="rounded-2xl border bg-white p-6 flex flex-col gap-4">
          <div className="h-5 w-32 rounded bg-gray-200" />
          <div className="h-16 w-full rounded-xl bg-gray-200" />
          <div className="h-16 w-full rounded-xl bg-gray-200" />
        </div>
      </div>
    </div>
  );
}