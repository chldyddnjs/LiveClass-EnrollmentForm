### 1. 에러 코드별 처리 분기

제출 실패 시 에러 유형에 따라 다르게 처리합니다.

| 에러 코드 | 처리 방식 |
| --- | --- |
| `COURSE_FULL` | 에러 메시지 표시 후 2.5초 뒤 Step1으로 이동 |
| `DUPLICATE_ENROLLMENT` | 현재 페이지에서 메시지만 표시 |
| `INVALID_INPUT` | 현재 페이지에서 메시지만 표시 |
| 네트워크 오류 | "잠시 후 다시 시도해주세요" 메시지 |

네트워크 오류와 비즈니스 에러를 구분하는 이유는 사용자가 취해야 할 행동이 다르기 때문입니다. 

네트워크 오류는 재시도로 해결되지만, `COURSE_FULL`은 다른 강의를 선택해야 합니다.

---

### 2. navigate → clearStorage 순서

`clearStorage()`를 `navigate()` 앞에 호출하면 Zustand 상태가 초기화되면서 리렌더가 트리거되고, `EnrollCompletePage`가 마운트되기 전에 상태가 소실됩니다. 

`navigate()`를 먼저 호출해 라우트 전환을 시작한 뒤, `EnrollCompletePage`의 `useEffect`에서 마운트 완료 후 `clearStorage()`를 호출합니다.

---

### 3. TanStack Query 캐시 무효화

신청 완료 후 `queryClient.invalidateQueries({ queryKey: courseKeys.all })`를 호출합니다. 

MSW 핸들러가 `currentEnrollment`를 메모리에서 누적하지만, TanStack Query가 캐시된 이전 데이터를 그대로 들고 있어 화면에 반영되지 않는 문제가 있었습니다. 

invalidate 후 다음 목록/상세 진입 시 새 데이터를 fetch합니다. 

순서는 `postEnrollment` 완료 → `invalidateQueries` → `navigate`입니다