import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

interface LabelProps {
  htmlFor: string;
  required?: boolean;
  children: React.ReactNode;
}

export const Label = ({ htmlFor, required, children }: LabelProps) => {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700">
      {children}
      {required && <span className="ml-0.5 text-red-500">*</span>}
    </label>
  );
}

export const ErrorMessage = ({ message }: { message?: string }) => {
  if (!message) return null;
  return (
    <p role="alert" className="text-xs text-red-500 mt-1">
      {message}
    </p>
  );
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = ({ error, className = "", ...props }: InputProps) => {
  return (
    <input
      {...props}
      className={[
        "w-full rounded-xl border px-3.5 py-2.5 text-sm text-gray-900 outline-none transition-all",
        "placeholder:text-gray-400",
        "focus:ring-2 focus:ring-gray-900 focus:border-transparent",
        error
          ? "border-red-400 bg-red-50 focus:ring-red-400"
          : "border-gray-200 bg-white hover:border-gray-400",
        className,
      ].join(" ")}
    />
  );
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea = ({ error, className = "", ...props }: TextareaProps) => {
  return (
    <textarea
      {...props}
      className={[
        "w-full rounded-xl border px-3.5 py-2.5 text-sm text-gray-900 outline-none transition-all resize-none",
        "placeholder:text-gray-400",
        "focus:ring-2 focus:ring-gray-900 focus:border-transparent",
        error
          ? "border-red-400 bg-red-50 focus:ring-red-400"
          : "border-gray-200 bg-white hover:border-gray-400",
        className,
      ].join(" ")}
    />
  );
}

interface FormFieldProps {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}

export const FormField = ({ id, label, required, error, children }: FormFieldProps) => {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} required={required}>
        {label}
      </Label>
        {children}
      <ErrorMessage message={error} />
    </div>
  );
}