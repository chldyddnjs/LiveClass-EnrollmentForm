### StepIndicator 컴포넌트 구현

### 1. 배경 및 목적

`StepIndicator`는 사용자가 3단계 중 현재 어디에 있는지, 이전 단계가 완료됐는지를 한눈에 파악할 수 있게 합니다. 

기능 컴포넌트 중 가장 먼저 구현한 이유는 이후 모든 스텝 페이지에서 헤더에 공통으로 사용되는 UI이기 때문입니다.

 컴포넌트 하나가 `currentStep` prop 하나만 받아 전체 스텝 상태를 렌더링하므로, 각 페이지는 자신의 스텝 번호만 알면 됩니다.

---

### 2. 상태 설계 — 3가지로 분류한 이유

스텝 상태를 `completed / active / pending` 세 가지로 명시적으로 분리했습니다.

```tsx
const status =
  step.id < currentStep ? "completed"
  : step.id === currentStep ? "active"
  : "pending";
```

`active`와 `completed`를 하나로 합칠 수도 있지만, 두 상태는 렌더링 결과가 다릅니다. 

`completed`는 숫자 대신 체크 아이콘을 표시하고, 

`active`는 `ring-4`로 강조 링을 추가합니다. 

`pending`은 회색으로 비활성화됩니다. 상태를 명시적으로 분리하면 JSX의 조건 분기가 상태 이름으로 읽혀 의도가 명확합니다.

---

### 3. Tailwind CSS를 선택한 이유

스타일링 방식으로 Tailwind CSS를 선택했습니다. 이 프로젝트 전체가 Tailwind 기반으로 통일되어 있어 StepIndicator만 CSS Module이나 별도 스타일 방식을 쓰면 일관성이 깨집니다. 조건부 스타일은 상태별 클래스 배열을 `join(" ")`으로 처리하는 방식으로 가독성을 유지했습니다.

```tsx
className={[
  "flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-all duration-300",
  status === "completed" ? "bg-gray-900 text-white"
  : status === "active"  ? "bg-gray-900 text-white ring-4 ring-gray-200"
  : "bg-gray-100 text-gray-400",
].join(" ")}
```

---

### 4. 연결선 너비를 고정값으로 설정한 이유

연결선은 `w-16 sm:w-24`로 고정했습니다. 스텝 수가 3개로 고정되어 있고, 컨테이너 너비가 `max-w-2xl`로 제한되어 있어 스텝 간격이 일정합니다. JavaScript로 DOM을 측정해 동적으로 계산하면 리사이즈 이벤트 대응이 필요해지고 복잡도가 올라갑니다. 고정 스텝 수에서는 CSS 고정값이 더 단순하고 안정적입니다. 모바일에서는 `sm:` 브레이크포인트로 너비를 줄여 좁은 화면에서도 세 스텝이 잘려 보이지 않도록 했습니다.

---

### 5. 접근성 처리

```tsx
<nav aria-label="신청 진행 단계">
<div aria-current={status === "active" ? "step" : undefined}>
```

`<nav>` 랜드마크로 스크린 리더가 이 영역을 탐색 요소로 인식합니다. 

`aria-current="step"`은 현재 활성 스텝을 스크린 리더에 명시적으로 알립니다. 

연결선 `<div>`는 순수 장식 요소이므로 `aria-hidden="true"`를 붙여 스크린 리더 탐색에서 제외했습니다.