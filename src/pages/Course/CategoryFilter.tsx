import { CATEGORY_LABELS } from "../../lib/utils";

const CATEGORIES = ["all", "development", "design", "marketing", "business"] as const;
type CategoryOption = (typeof CATEGORIES)[number];

interface CategoryFilterProps {
  selected: CategoryOption;
  onChange: (category: CategoryOption) => void;
}

export function CategoryFilter({ selected, onChange }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2" role="tablist" aria-label="강의 카테고리">
      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          role="tab"
          aria-selected={selected === cat}
          onClick={() => onChange(cat)}
          className={[
            "rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-150",
            selected === cat
              ? "bg-gray-900 text-white shadow-sm"
              : "bg-white text-gray-600 border border-gray-200 hover:border-gray-400",
          ].join(" ")}
        >
          {CATEGORY_LABELS[cat]}
        </button>
      ))}
    </div>
  );
}