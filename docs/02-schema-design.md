### 1. 배경 및 목적

수강 신청 폼의 핵심 복잡도는 개인/단체라는 두 갈래의 데이터 구조가 동일한 폼 안에서 공존한다는 점입니다. 이 분기를 타입 시스템 수준에서 강제하지 않으면 런타임에서야 발견되는 버그가 생깁니다. 이 커밋은 타입 정의와 검증 스키마를 단일 소스로 확립해, 이후 모든 컴포넌트가 이 계약을 따르도록 기반을 만드는 것이 목적입니다.

---

### 2. discriminated union 선택 근거

개인/단체 분기를 표현하는 방법은 두 가지입니다.

**방법 A — 옵셔널 필드로 통합**

```tsx
interface FormData {
  type: "personal" | "group";
  applicant: Applicant;
  group?: GroupInfo; // 단체일 때만 존재
}
```

**방법 B — discriminated union으로 분리**

```tsx
type Step2FormValues =
  | { enrollmentType: "personal"; applicant: Applicant }
  | { enrollmentType: "group";    applicant: Applicant; group: GroupInfo }
```

방법 A는 `type === "group"`임에도 TypeScript가 `group`의 존재를 보장하지 못합니다. `group?.organizationName`처럼 불필요한 옵셔널 체이닝이 코드 전체에 퍼지고, 실수로 `group`에 접근했을 때 컴파일 에러가 발생하지 않습니다.

방법 B는 `enrollmentType === "group"` 분기 안에서 TypeScript가 `group` 필드의 존재를 자동으로 좁혀줍니다(narrowing). 잘못된 접근은 컴파일 타임에 차단됩니다. 이 과제에서 개인/단체는 완전히 다른 API 페이로드로 귀결되므로 방법 B가 명확합니다.

---

### 3. 스키마 계층 구조 설계

스키마를 스텝별로 분리한 이유는 유효성 검증 시점이 다르기 때문입니다.

`step1Schema     → 스텝 1 이동 시점에 검증
 step2Schema     → 스텝 2 이동 시점에 검증  (discriminated union 핵심)
 enrollmentSchema → 최종 제출 직전 전체 검증`

스텝별 스키마와 최종 스키마를 분리한 이유는 최종 스키마는 API 페이로드 형태(`type: "personal" | "group"`)이고, 스텝 스키마는 폼 내부 상태 형태(`enrollmentType`)로 키 이름이 다르기 때문입니다. 이 두 개념을 하나로 합치면 폼 상태와 API 계약이 결합되어 변경에 취약해집니다.

---

### 4. superRefine으로 cross-field 검증

단체 신청에는 단일 필드로 표현할 수 없는 검증 규칙이 있습니다.

- 참가자 수가 `headCount`와 일치해야 한다
- 참가자 이메일이 서로 중복되지 않아야 한다
- 참가자 이메일이 신청자 본인 이메일과 달라야 한다

이 세 규칙은 다른 필드의 값을 참조해야 하므로 단순 `.min()` `.max()` 체이닝으로 표현할 수 없습니다. Zod의 `superRefine`은 전체 객체를 받아 `ctx.addIssue()`로 원하는 경로에 에러를 붙일 수 있어 이 요구사항에 적합합니다.

---

---

### 5. 타입 추론 전략

```tsx
export type Step2FormValues = z.infer<typeof step2Schema>;
```

스키마에서 타입을 추론(`z.infer`)하는 방식을 택했습니다. 반대로 타입을 먼저 선언하고 스키마를 따로 만들면 두 곳을 동기화해야 합니다. 필드가 추가되거나 변경될 때 스키마만 수정하면 타입이 자동으로 따라오는 구조가 유지보수에 유리합니