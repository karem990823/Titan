import type { ReactNode } from "react";

interface FieldProps {
  label: string;
  required?: boolean;
  children: ReactNode;
  error?: string;
}

function Field({ label, required, children, error }: FieldProps) {
  return (
    <div className="mb-gap-sm">
      <label className="block font-label-sm text-label-sm uppercase font-bold text-on-surface mb-1">
        {label}
        {required && <span className="text-primary"> *</span>}
      </label>
      {children}
      {error && <p className="text-error font-label-sm text-label-sm mt-1 m-0">{error}</p>}
    </div>
  );
}

export default Field;
