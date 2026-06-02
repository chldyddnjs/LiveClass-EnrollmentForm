markdown
# 수강 신청 폼 — LiveClass FE 과제

온라인 교육 플랫폼의 수강 신청 흐름을 다단계 폼으로 구현한 프로젝트입니다.  
강의 목록 탐색부터 개인/단체 신청, 최종 제출까지 3단계로 구성되며,  
폼 상태 관리, 유효성 검증, 조건부 필드 처리, 예외 상황 대응에 집중했습니다.

---

## 기술 스택

| 구분 | 선택 | 이유 |
|------|------|------|
| 언어 | TypeScript | 필수 요구사항 |
| 프레임워크 | React + Vite | CRA 유지보수 중단, Vite의 빠른 HMR |
| 라우팅 | React Router v6 | 스텝별 독립 URL, 뒤로가기 자연스러운 처리 |
| 폼 상태 | React Hook Form | uncontrolled 방식으로 동적 필드 리렌더 최소화 |
| 스키마 검증 | Zod | 타입 추론과 검증을 단일 소스로 관리 |
| 전역 상태 | Zustand | 스텝 간 데이터 공유, persist로 임시 저장 |
| 서버 상태 | TanStack Query | 로딩/에러/캐싱 선언적 처리 |
| 스타일 | Tailwind CSS v4 | 설정 없이 vite 플러그인으로 즉시 사용 |
| Mock API | MSW | 실제 네트워크 레이어 인터셉트, 에러 시나리오 시뮬레이션 |
| 테스트 | Vitest | Vite 기반 프로젝트와 동일한 설정 공유 |

---

## 실행 방법

```bash
# 의존성 설치
npm install

# 개발 서버 실행 (MSW 자동 활성화)
npm run dev

# 테스트 실행
npm run test:run

# 빌드
npm run build
```

> 개발 서버 실행 후 브라우저 콘솔에서 `[MSW] Mocking enabled.` 메시지가 확인되면 Mock API가 정상 동작하는 것입니다.

---

## 프로젝트 구조
src/
├── components/
│   ├── fields/          # 재사용 폼 필드 (Input, Textarea, ParticipantList)
│   └── ui/              # 공통 UI (StepIndicator, CourseCard, CategoryFilter)
├── hooks/               # TanStack Query 훅 (useCourses)
├── lib/                 # API 클라이언트, 유틸 함수
├── mocks/               # MSW 핸들러, Mock 데이터
├── pages/
│   ├── course/          # 강의 목록, 강의 상세
│   └── enroll/          # Step1~3, 완료 페이지
├── schemas/             # Zod 스키마 (검증 + 타입 추론 단일 소스)
├── store/               # Zustand 스토어
├── test/                # 테스트 파일
└── types/               # TypeScript 타입 정의


---

## 요구사항 해석 및 가정

### 강의 선택 (Step1)

강의 목록을 카드 그리드로 렌더링하고, 카테고리 필터는 URL 쿼리 파라미터(`?category=development`)로 관리합니다. 브라우저 뒤로가기 시 선택한 카테고리가 유지되고 특정 카테고리 결과를 URL로 공유할 수 있습니다.

페이지 번호는 로컬 상태로 관리합니다. URL에 포함하면 페이지 전환마다 히스토리가 쌓여 목록을 벗어나려면 여러 번 뒤로가기를 눌러야 하기 때문입니다.

신청 유형 선택은 `/courses/:courseId/enroll` 페이지에서 처리합니다. 초기 설계에서 `/enroll/:courseId`를 사용했으나 React Router가 `complete`, `step2` 등 고정 경로를 `courseId` 파라미터로 인식하는 충돌이 발생해 변경했습니다.

### 신청자 정보 (Step2)

개인↔단체 전환 시 공통 필드(이름, 이메일, 전화번호, 수강 동기)는 유지하고 단체 관련 데이터만 초기화합니다. 전환 전 확인 다이얼로그를 표시해 사용자가 데이터 초기화를 인지하도록 합니다.

참가자 명단 이메일은 참가자 간 중복과 신청자 본인 이메일과의 중복을 모두 검증합니다. 신청 인원수 상한은 잔여석 기준으로 동적으로 적용합니다.

### 확인 및 제출 (Step3)

제출 실패 에러를 유형별로 구분합니다.

| 에러 코드 | 처리 |
|----------|------|
| `COURSE_FULL` | 2.5초 후 강의 목록으로 이동 |
| `DUPLICATE_ENROLLMENT` | 현재 페이지에서 메시지 표시 |
| `INVALID_INPUT` | 현재 페이지에서 메시지 표시 |
| 네트워크 오류 | "잠시 후 다시 시도해주세요" 안내 |

### 잔여석 경고 기준

잔여석 5석 이하를 경고 기준으로 설정했습니다. 요구사항에 명시되지 않은 가정이며, 단체 신청 최소 인원(2명)과 최대 인원(10명)의 중간값 부근으로 결정했습니다.

---

## 설계 결정과 이유

### discriminated union으로 개인/단체 타입 분리

개인과 단체 신청은 완전히 다른 API 페이로드를 가집니다. 옵셔널 필드로 통합하면 `type === "group"`이어도 TypeScript가 `group` 필드 존재를 보장하지 못합니다. `discriminated union`으로 분리하면 타입 분기 안에서 필드 존재가 자동으로 보장됩니다.

### Zod 스키마와 RHF validate 레이어 분리

정적 검증(형식, 최소/최대 길이)은 Zod 스키마가 담당하고, 동적 검증(잔여석 초과 여부)은 RHF의 `validate` 함수가 담당합니다. Zod에 `.max()`를 남겨두면 Zod가 먼저 에러를 내고 `validate`가 실행되지 않아 동적 에러 메시지가 표시되지 않는 문제가 있었습니다.

### key prop으로 폼 강제 리마운트

개인↔단체 전환 시 같은 URL로 navigate해도 React Router가 컴포넌트를 리마운트하지 않습니다. `<Step2Form key={currentType} />`으로 렌더링해 `currentType`이 바뀌면 컴포넌트가 언마운트 후 재마운트됩니다. `useForm`의 `defaultValues`가 새로 적용되어 이전 타입의 입력값이 남지 않습니다.

### navigate 후 clearStorage 호출 순서

`clearStorage()`를 `navigate()` 앞에 호출하면 Zustand 상태가 초기화되면서 리렌더가 트리거되고 `EnrollCompletePage`에 전달한 `location.state`가 소실됩니다. `navigate()`로 라우트 전환을 먼저 시작한 뒤, `EnrollCompletePage` 마운트 시점의 `useEffect`에서 `clearStorage()`를 호출합니다.

---

## 미구현 / 제약사항

### 선택 구현

| 항목 | 상태 |
|------|------|
| 임시 저장 | ✅ Zustand `persist` 미들웨어로 구현. 다음 단계 진행 시 localStorage에 저장 |
| 이탈 방지 | ✅ Step2에서 `useBlocker` + `beforeunload` 이벤트로 구현 |
| 반응형 레이아웃 | ⚠️ Tailwind 기본 브레이크포인트 적용, 모바일 전용 레이아웃 미완성 |

### 기타

- 결제 연동 및 인증/인가는 과제 범위에서 제외했습니다.
- Mock API는 브라우저 새로고침 시 신청 이력과 정원 변경이 초기화됩니다. MSW의 메모리 기반 특성에 따른 한계입니다.

---

## AI 활용 범위

요구사항 분석, 설계 결정, 엣지케이스 정의는 직접 수행했으며
AI는 결정된 내용을 코드로 구현하는 역할을 담당했습니다.

직접 결정한 사항:
- 개인↔단체 전환 시 데이터 처리 방침 (공통 필드 유지, group 초기화)
- 라우팅 구조 (/courses/:courseId/enroll 분리)
- Zustand 선택 및 persist 저장 범위
- key prop을 이용한 폼 강제 리마운트 방식
- navigate → clearStorage 순서 (EnrollCompletePage 마운트 후 호출)
- 잔여석 기준 동적 검증을 Zod가 아닌 RHF validate 레이어에서 처리
- 테스트 대상을 비즈니스 로직으로 한정
