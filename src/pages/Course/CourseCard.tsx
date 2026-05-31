import { Link } from "react-router-dom";
import type { Course } from "../../types/enrollment";
import { formatPrice, formatDateRange, getRemainingSeats } from "../../lib/utils";

interface CourseCardProps {
  course: Course;
}

const LOW_SEAT_THRESHOLD = 5;

export const CourseCard = ({ 
    course 
}: CourseCardProps) => {
  const remaining = getRemainingSeats(course.maxCapacity, course.currentEnrollment);
  const isFull = remaining <= 0;
  const isLow = remaining > 0 && remaining <= LOW_SEAT_THRESHOLD;

  return (
    <Link
      to={`/courses/${course.id}`}
      className={[
        "group flex flex-col rounded-2xl border bg-white overflow-hidden",
        "transition-all duration-200 hover:shadow-md hover:-translate-y-0.5",
        isFull ? "opacity-60 pointer-events-none" : "",
      ].join(" ")}
      aria-disabled={isFull}
    >
      {/* 썸네일 */}
      <div className="relative aspect-video overflow-hidden bg-gray-100">
        <img
          src={course.imageUrl ?? `https://placehold.co/600x400/e5e7eb/9ca3af?text=${encodeURIComponent(course.title)}`}
          alt={course.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {/* 뱃지 */}
        {isFull && (
          <span className="absolute top-3 left-3 rounded-full bg-gray-900/80 px-2.5 py-1 text-xs font-medium text-white">
            마감
          </span>
        )}
        {isLow && (
          <span className="absolute top-3 left-3 rounded-full bg-red-500 px-2.5 py-1 text-xs font-medium text-white">
            잔여 {remaining}석
          </span>
        )}
      </div>

      {/* 콘텐츠 */}
      <div className="flex flex-1 flex-col gap-3 p-5">
        {/* 카테고리 */}
        <span className="text-xs font-medium text-indigo-600 uppercase tracking-wide">
          {course.category}
        </span>

        {/* 제목 */}
        <h3 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2 group-hover:text-indigo-600 transition-colors">
          {course.title}
        </h3>

        {/* 강사 */}
        <p className="text-xs text-gray-500">{course.instructor}</p>

        <div className="mt-auto flex flex-col gap-1.5 pt-3 border-t border-gray-100">
          {/* 일정 */}
          <p className="text-xs text-gray-500">
            {formatDateRange(course.startDate, course.endDate)}
          </p>
          {/* 가격 */}
          <p className="text-base font-bold text-gray-900">
            {formatPrice(course.price)}
          </p>
        </div>
      </div>
    </Link>
  );
}