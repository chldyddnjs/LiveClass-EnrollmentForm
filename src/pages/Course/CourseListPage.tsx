import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useCourses } from "../../hooks/useCourses";
import { CourseCard } from "../../components/ui/CourseCard";
import { CategoryFilter } from "../../components/ui/CategoryFilter";
import { isCategoryValid } from "../../lib/utils";

type CategoryOption = "all" | "development" | "design" | "marketing" | "business";

const PAGE_SIZE = 6;

export const CourseListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(1);

  // URL 쿼리에서 카테고리 읽기
  const rawCategory = searchParams.get("category");
  const category: CategoryOption = isCategoryValid(rawCategory) ? rawCategory : "all";

  // 카테고리 변경 시 페이지 초기화
  useEffect(() => {
    setPage(1);
  }, [category]);

  const { data, isLoading, isError } = useCourses(category === "all" ? undefined : category);

  const courses = data?.courses ?? [];
  const totalPages = Math.ceil(courses.length / PAGE_SIZE);
  const paginated = courses.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleCategoryChange(cat: CategoryOption) {
    setSearchParams(cat === "all" ? {} : { category: cat });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-5">
          <h1 className="text-xl font-bold text-gray-900">강의 목록</h1>
          <p className="mt-0.5 text-sm text-gray-500">원하는 강의를 선택하고 수강을 신청하세요.</p>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        {/* 카테고리 필터 */}
        <div className="mb-6">
          <CategoryFilter selected={category} onChange={handleCategoryChange} />
        </div>

        {/* 강의 수 */}
        {!isLoading && !isError && (
          <p className="mb-4 text-sm text-gray-500">
            총 <span className="font-semibold text-gray-900">{courses.length}</span>개의 강의
          </p>
        )}

        {/* 로딩 */}
        {isLoading && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* 에러 */}
        {isError && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white py-20 text-center">
            <p className="text-sm font-medium text-gray-900">강의 목록을 불러오지 못했습니다.</p>
            <p className="mt-1 text-xs text-gray-500">잠시 후 다시 시도해주세요.</p>
          </div>
        )}

        {/* 빈 상태 */}
        {!isLoading && !isError && courses.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white py-20 text-center">
            <p className="text-sm font-medium text-gray-900">해당 카테고리에 강의가 없습니다.</p>
            <p className="mt-1 text-xs text-gray-500">다른 카테고리를 선택해보세요.</p>
          </div>
        )}

        {/* 그리드 */}
        {!isLoading && !isError && paginated.length > 0 && (
          <>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {paginated.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-1">
                <PageButton
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  aria-label="이전 페이지"
                >
                  ‹
                </PageButton>

                {Array.from({ length: totalPages }).map((_, i) => (
                  <PageButton
                    key={i}
                    onClick={() => setPage(i + 1)}
                    active={page === i + 1}
                  >
                    {i + 1}
                  </PageButton>
                ))}

                <PageButton
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  aria-label="다음 페이지"
                >
                  ›
                </PageButton>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

// ── 서브 컴포넌트 ─────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-2xl border bg-white overflow-hidden">
      <div className="aspect-video bg-gray-200" />
      <div className="p-5 flex flex-col gap-3">
        <div className="h-3 w-16 rounded bg-gray-200" />
        <div className="h-4 w-full rounded bg-gray-200" />
        <div className="h-4 w-3/4 rounded bg-gray-200" />
        <div className="mt-auto pt-3 border-t border-gray-100 flex flex-col gap-2">
          <div className="h-3 w-32 rounded bg-gray-200" />
          <div className="h-5 w-20 rounded bg-gray-200" />
        </div>
      </div>
    </div>
  );
}

interface PageButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

function PageButton({ active, children, ...props }: PageButtonProps) {
  return (
    <button
      {...props}
      className={[
        "flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition-all",
        active
          ? "bg-gray-900 text-white"
          : "text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed",
      ].join(" ")}
    >
      {children}
    </button>
  );
}
