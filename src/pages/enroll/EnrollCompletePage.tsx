import { useEffect, useRef } from "react";
import { useLocation, useNavigate, Navigate } from "react-router-dom";
import { useEnrollmentStore } from "../../store/enrollmentStore";
import type { EnrollmentResponse, EnrollmentType } from "../../types/enrollment";

interface CompleteLocationState {
  response: EnrollmentResponse;
  courseName: string;
  enrollmentType: EnrollmentType;
}

const CONFETTI_COLORS = [
  "#7F77DD", "#1D9E75", "#D4537E",
  "#EF9F27", "#378ADD", "#D85A30",
];

export function EnrollCompletePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const confettiRef = useRef<HTMLDivElement>(null);
  const { clearStorage } = useEnrollmentStore();

  // 모든 훅을 조건부 return 전에 호출
  const state = location.state as CompleteLocationState | null;

  useEffect(() => {
    if (!state?.response) return;

    clearStorage();

    const container = confettiRef.current;
    if (!container) return;
    const pieces = Array.from({ length: 42 }).map(() => {
      const el = document.createElement("div");
      const size = 6 + Math.random() * 7;
      const color = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
      const delay = Math.random() * 0.9;
      const duration = 1.4 + Math.random() * 1.2;

      el.style.cssText = `
        position: absolute;
        left: ${Math.random() * 100}%;
        top: -12px;
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border-radius: ${Math.random() > 0.5 ? "50%" : "2px"};
        animation: confetti-fall ${duration}s ${delay}s linear forwards;
        pointer-events: none;
      `;
      container.appendChild(el);
      return el;
    });

    return () => pieces.forEach((el) => el.remove());
  }, [state?.response]);

  // 훅 호출 이후에 조건부 렌더링
  if (!state?.response) {
    return <Navigate to="/" replace />;
  }

  const { response, courseName, enrollmentType } = state;

  function formatDate(iso: string) {
    return new Date(iso).toLocaleString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function handleGoHome() {
    navigate("/");
  }

  return (
    <>
      <style>{`
        @keyframes confetti-fall {
          0%   { transform: translateY(-10px) rotate(0deg);   opacity: 1; }
          100% { transform: translateY(380px) rotate(720deg); opacity: 0; }
        }
        @keyframes pop-in {
          0%   { transform: scale(0.7); opacity: 0; }
          70%  { transform: scale(1.08); }
          100% { transform: scale(1);   opacity: 1; }
        }
        @keyframes fade-up {
          0%   { transform: translateY(16px); opacity: 0; }
          100% { transform: translateY(0);    opacity: 1; }
        }
        @keyframes check-draw {
          0%   { stroke-dashoffset: 60; }
          100% { stroke-dashoffset: 0;  }
        }
        .complete-pop    { animation: pop-in  0.5s cubic-bezier(0.34,1.56,0.64,1) forwards; }
        .complete-fade-1 { animation: fade-up 0.4s ease 0.30s forwards; opacity: 0; }
        .complete-fade-2 { animation: fade-up 0.4s ease 0.45s forwards; opacity: 0; }
        .complete-fade-3 { animation: fade-up 0.4s ease 0.60s forwards; opacity: 0; }
        .complete-fade-4 { animation: fade-up 0.4s ease 0.75s forwards; opacity: 0; }
        .check-path {
          stroke-dasharray: 60;
          stroke-dashoffset: 60;
          animation: check-draw 0.4s ease 0.15s forwards;
        }
      `}</style>

      <div className="relative min-h-screen bg-gray-50 flex items-center justify-center overflow-hidden px-4 py-12">
        <div ref={confettiRef} className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true" />

        <div className="relative z-10 w-full max-w-md bg-white border border-gray-200 rounded-2xl p-10 flex flex-col items-center text-center shadow-sm">

          <div className="complete-pop flex items-center justify-center rounded-full bg-green-50 mb-6" style={{ width: 72, height: 72 }}>
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
              <path className="check-path" d="M8 18 L15 25 L28 11" stroke="#3B6D11" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <h1 className="complete-fade-1 text-xl font-semibold text-gray-900 mb-2">
            수강 신청이 완료되었습니다
          </h1>
          <p className="complete-fade-2 text-sm text-gray-500 leading-relaxed mb-8">
            신청 확인 메일이 발송되었습니다.<br />
            아래에서 신청 내역을 확인하세요.
          </p>

          <div className="complete-fade-3 w-full bg-gray-50 rounded-xl p-5 mb-6 text-left flex flex-col gap-3">
            <InfoRow label="신청 번호">
              <span className="font-mono text-sm font-medium text-gray-900">{response.enrollmentId}</span>
            </InfoRow>
            <div className="h-px bg-gray-200" />
            <InfoRow label="강의">
              <span className="text-sm font-medium text-gray-900 text-right">{courseName}</span>
            </InfoRow>
            <InfoRow label="신청 유형">
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-green-100 text-green-800">
                {enrollmentType === "personal" ? "개인 신청" : "단체 신청"}
              </span>
            </InfoRow>
            <InfoRow label="신청일시">
              <span className="text-sm text-gray-900">{formatDate(response.enrolledAt)}</span>
            </InfoRow>
            <InfoRow label="상태">
              <span className={[
                "text-xs font-medium px-2.5 py-1 rounded-full",
                response.status === "confirmed" ? "bg-blue-50 text-blue-700" : "bg-amber-50 text-amber-700",
              ].join(" ")}>
                {response.status === "confirmed" ? "확정" : "대기 중"}
              </span>
            </InfoRow>
          </div>

          <div className="complete-fade-4 w-full flex flex-col gap-2">
            <button
              onClick={handleGoHome}
              className="w-full py-3 rounded-xl bg-gray-900 text-sm font-semibold text-white hover:bg-gray-700 transition-colors"
            >
              다른 강의 둘러보기
            </button>
            <button
              onClick={() => window.print()}
              className="w-full py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              신청 내역 인쇄
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-xs text-gray-500 shrink-0">{label}</span>
      <div className="text-right">{children}</div>
    </div>
  );
}