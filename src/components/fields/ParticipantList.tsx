import { useEffect, useRef } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { FormField, Input } from "./FormField";
import type { GroupStep2Values } from "../../schemas/enrollmentSchema";

interface ParticipantListProps {
  headCount: number;
}

export const ParticipantList = ({ headCount }: ParticipantListProps) => {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<GroupStep2Values>();

  const { fields, replace } = useFieldArray({
    control,
    name: "group.participants",
  });

  // fields.length를 ref로 관리 → 의존성 배열에서 제거해 루프 차단
  const fieldsLengthRef = useRef(fields.length);
  fieldsLengthRef.current = fields.length;

  useEffect(() => {
    const currentFields = fields.map((f) => ({ name: f.name, email: f.email }));

    // headCount 크기에 맞게 배열을 새로 만들어서 한번에 replace
    const next = Array.from({ length: headCount }, (_, i) => ({
      name: currentFields[i]?.name ?? "",   // 기존 입력 보존
      email: currentFields[i]?.email ?? "", // 기존 입력 보존
    }));

    replace(next);
  }, [headCount]); // headCount만 의존

  const participantErrors = errors.group?.participants;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        { }
        <h4 className="text-sm font-semibold text-gray-900">참가자 명단</h4>
        {/* fields.length 대신 headCount로 표시 → 항상 정확 */}
        <span className="text-xs text-gray-400">총 {headCount}명</span>
      </div>

      {typeof participantErrors?.message === "string" && (
        <p role="alert" className="text-xs text-red-500">
          {participantErrors.message}
        </p>
      )}

      <div className="flex flex-col gap-3">
        { fields.map((field, index) => (
          <div
            key={field.id}
            className="rounded-xl border border-gray-100 bg-gray-50 p-4 flex flex-col gap-3"
          >
            <p className="text-xs font-medium text-gray-500">참가자 {index + 1}</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <FormField
                id={`participant-name-${index}`}
                label="이름"
                required
                error={participantErrors?.[index]?.name?.message}
              >
                <Input
                  id={`participant-name-${index}`}
                  placeholder="이름"
                  error={!!participantErrors?.[index]?.name}
                  {...register(`group.participants.${index}.name`)}
                />
              </FormField>

              <FormField
                id={`participant-email-${index}`}
                label="이메일"
                required
                error={participantErrors?.[index]?.email?.message}
              >
                <Input
                  id={`participant-email-${index}`}
                  type="email"
                  placeholder="email@example.com"
                  error={!!participantErrors?.[index]?.email}
                  {...register(`group.participants.${index}.email`)}
                />
              </FormField>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}