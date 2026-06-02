# 수강 신청 폼 — LiveClass FE 과제

다단계 수강 신청 폼 구현 과제입니다.
강의 목록 탐색 → 신청 유형 선택 → 신청자 정보 입력 → 확인 및 제출의 3단계 흐름으로 구성됩니다.

## 실행 방법

\```bash
npm install
npm run dev
\```

브라우저 콘솔에서 `[MSW] Mocking enabled.` 확인 후 사용하세요.

## 테스트

\```bash
npm run test:run
\```

## 기술 스택

React · TypeScript · Vite · React Hook Form · Zod · Zustand · TanStack Query · Tailwind CSS · MSW · Vitest

## 주요 구현

- 3단계 멀티스텝 폼 (강의 선택 → 신청자 정보 → 확인 및 제출)
- 개인/단체 신청 유형 전환 및 데이터 정합성 처리
- Zod discriminated union 기반 타입 안전 검증
- 참가자 이메일 중복 / 잔여석 초과 실시간 검증
- 임시 저장 (새로고침 후 입력 데이터 복원)
- 이탈 방지 다이얼로그
- MSW 기반 Mock API (COURSE_FULL, DUPLICATE_ENROLLMENT 시나리오 포함)