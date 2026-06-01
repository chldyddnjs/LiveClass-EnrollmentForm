import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";
import type { Step1Data, Step2Data } from "../types/enrollment";

const STORAGE_KEY = "enrollment-form";

interface EnrollmentState {
  currentStep: 1 | 2 | 3;
  step1: Step1Data | null;
  step2: Step2Data | null;
  agreedToTerms: boolean;

  setStep1: (data: Step1Data) => void;
  setStep2: (data: Step2Data) => void;
  setAgreedToTerms: (agreed: boolean) => void;
  goToStep: (step: 1 | 2 | 3) => void;
  // 이탈 후 복귀 시 임시 저장 유지 — 상태만 초기화
  resetForm: () => void;
  // 제출 완료 시 — 상태 초기화 + localStorage 키 완전 제거
  clearStorage: () => void;
  switchToPersonal: () => void;
}

const initialState = {
  currentStep: 1 as const,
  step1: null,
  step2: null,
  agreedToTerms: false,
};

export const useEnrollmentStore = create<EnrollmentState>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,

        setStep1: (data) =>
          set({ step1: data }, false, "setStep1"),

        setStep2: (data) =>
          set({ step2: data }, false, "setStep2"),

        setAgreedToTerms: (agreed) =>
          set({ agreedToTerms: agreed }, false, "setAgreedToTerms"),

        goToStep: (step) =>
          set({ currentStep: step }, false, `goToStep/${step}`),

        switchToPersonal: () =>
          set((state) => {
            if (!state.step2) return {};
            return {
              step2: {
                enrollmentType: "personal",
                applicant: state.step2.applicant,
              },
            };
          }, false, "switchToPersonal"),

        resetForm: () =>
          set(initialState, false, "resetForm"),

        // 상태 초기화 후 localStorage 키도 완전 제거
        clearStorage: () => {
          set(initialState, false, "clearStorage");
          localStorage.removeItem(STORAGE_KEY);
        },
      }),
      {
        name: STORAGE_KEY,
        partialize: (state) => ({
          step1: state.step1,
          step2: state.step2,
        }),
      }
    ),
    { name: "EnrollmentStore" }
  )
);

export const useCurrentStep = () => useEnrollmentStore((s) => s.currentStep);
export const useStep1Data = () => useEnrollmentStore((s) => s.step1);
export const useStep2Data = () => useEnrollmentStore((s) => s.step2);