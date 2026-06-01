import { useParams, useNavigate } from "react-router-dom";
import { useCourse } from "../../hooks/useCourses";
import { 
  formatPrice, 
  formatDateRange, 
  getRemainingSeats 
} from "../../lib/utils";
import type { EnrollmentType } from "../../types/enrollment";

const LOW_SEAT_THRESHOLD = 5;

export const CourseDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: course, isLoading, isError } = useCourse(id ?? "");

  if (isLoading) return <DetailSkeleton />;

  if (isError || !course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm font-medium text-gray-900">강의를 불러오지 못했습니다.</p>
          <button
            onClick={() => navigate("/")}
            className="mt-4 text-sm text-indigo-600 hover:underline"
          >
            목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  const remaining = getRemainingSeats(course.maxCapacity, course.currentEnrollment);
  const isFull = remaining <= 0;
  const isLow = remaining > 0 && remaining <= LOW_SEAT_THRESHOLD;

  const handleEnroll = (type: EnrollmentType) => {
    navigate(`/courses/${course!.id}/enroll`, {
      state: { enrollmentType: type },
    });
  };


  return (
    <div className="min-h-screen bg-gray-50">
      {/* 뒤로가기 */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            <span>←</span>
            <span>목록으로</span>
          </button>
        </div>
      </div>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
          {/* 좌측: 강의 상세 */}
          <div className="flex-1 flex flex-col gap-6">
            {/* 썸네일 */}
            <div className="overflow-hidden rounded-2xl border bg-white">
              <img
                src={course.imageUrl ?? `https://placehold.co/800x450/e5e7eb/9ca3af?text=${encodeURIComponent(course.title)}`}
                alt={course.title}
                className="w-full object-cover aspect-video"
              />
            </div>

            {/* 강의 설명 */}
            <div className="rounded-2xl border bg-white p-6">
              <span className="text-xs font-medium text-indigo-600 uppercase tracking-wide">
                {course.category}
              </span>
              <h1 className="mt-2 text-xl font-bold text-gray-900 leading-snug">
                {course.title}
              </h1>
              <p className="mt-1 text-sm text-gray-500">{course.instructor} 강사</p>
              <p className="mt-4 text-sm text-gray-700 leading-relaxed">
                {course.description}
              </p>
            </div>
          </div>

          {/* 우측: 신청 사이드바 */}
          <aside className="w-full lg:w-80 lg:sticky lg:top-6">
            <div className="rounded-2xl border bg-white p-6 flex flex-col gap-5 shadow-sm">
              {/* 가격 */}
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {formatPrice(course.price)}
                </p>
              </div>

              {/* 강의 정보 */}
              <dl className="flex flex-col gap-3 text-sm border-t border-gray-100 pt-4">
                <InfoRow label="일정" value={formatDateRange(course.startDate, course.endDate)} />
                <InfoRow label="강사" value={course.instructor} />
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
              </dl>

              {/* 신청 버튼 */}
              {isFull ? (
                <div className="rounded-xl bg-gray-100 py-3 text-center text-sm font-medium text-gray-400">
                  정원이 마감되었습니다
                </div>
              ) : (
                <div className="flex flex-col gap-2 border-t border-gray-100 pt-4">
                  <p className="text-xs font-medium text-gray-500 mb-1">신청 유형 선택</p>
                  <button
                    onClick={() => handleEnroll("personal")}
                    className="w-full rounded-xl bg-gray-900 py-3 text-sm font-semibold text-white hover:bg-gray-700 transition-colors"
                  >
                    개인 신청
                  </button>
                  <button
                    onClick={() => handleEnroll("group")}
                    className="w-full rounded-xl border border-gray-900 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50 transition-colors"
                  >
                    단체 신청
                  </button>
                </div>
              )}

              {isLow && !isFull && (
                <p className="text-center text-xs text-red-500">
                  ⚠ 마감 임박! 서둘러 신청하세요.
                </p>
              )}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

// ── 서브 컴포넌트 ──────────────────────────────────────────────────────────────

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
    <div className="flex justify-between gap-4">
      <dt className="text-gray-500 shrink-0">{label}</dt>
      <dd className={["text-gray-900 text-right", valueClassName].join(" ")}>{value}</dd>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b border-gray-200 bg-white h-14" />
      <div className="mx-auto max-w-5xl px-4 py-8 flex gap-8 animate-pulse">
        <div className="flex-1 flex flex-col gap-6">
          <div className="aspect-video rounded-2xl bg-gray-200" />
          <div className="rounded-2xl bg-white border p-6 flex flex-col gap-3">
            <div className="h-3 w-16 rounded bg-gray-200" />
            <div className="h-6 w-3/4 rounded bg-gray-200" />
            <div className="h-4 w-full rounded bg-gray-200 mt-2" />
            <div className="h-4 w-5/6 rounded bg-gray-200" />
          </div>
        </div>
        <div className="w-80 shrink-0">
          <div className="rounded-2xl bg-white border p-6 flex flex-col gap-4">
            <div className="h-8 w-32 rounded bg-gray-200" />
            <div className="h-px bg-gray-200" />
            <div className="h-4 w-full rounded bg-gray-200" />
            <div className="h-4 w-2/3 rounded bg-gray-200" />
            <div className="h-12 w-full rounded-xl bg-gray-200 mt-2" />
            <div className="h-12 w-full rounded-xl bg-gray-200" />
          </div>
        </div>
      </div>
    </div>
  );
}
