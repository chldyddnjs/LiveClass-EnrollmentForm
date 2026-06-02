import { STEPS, type StepId } from "../../types/enrollment";

interface StepIndicatorProps {
  currentStep: StepId;
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <nav aria-label="신청 진행 단계" className="w-full">
      <ol className="flex items-center justify-center gap-0">
        {STEPS.map((step, index) => {
          const status =
            step.id < currentStep
              ? "completed"
              : step.id === currentStep
                ? "active"
                : "pending";

          const isLast = index === STEPS.length - 1;

          return (
            <li key={step.id} className="flex items-center">
              <div className="flex flex-col items-center gap-2">
                <div
                  className={[
                    "flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-all duration-300",
                    status === "completed"
                      ? "bg-gray-900 text-white"
                      : status === "active"
                        ? "bg-gray-900 text-white ring-4 ring-gray-200"
                        : "bg-gray-100 text-gray-400",
                  ].join(" ")}
                  aria-current={status === "active" ? "step" : undefined}
                >
                  {status === "completed" ? <CheckIcon /> : <span>{step.id}</span>}
                </div>

                <span
                  className={[
                    "text-xs font-medium whitespace-nowrap",
                    status === "active"
                      ? "text-gray-900"
                      : status === "completed"
                        ? "text-gray-500"
                        : "text-gray-400",
                  ].join(" ")}
                >
                  {step.label}
                </span>
              </div>

              {!isLast && (
                <div
                  className={[
                    "mx-3 mb-5 h-px w-16 transition-all duration-300 sm:w-24",
                    step.id < currentStep ? "bg-gray-900" : "bg-gray-200",
                  ].join(" ")}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function CheckIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-4 w-4"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}
