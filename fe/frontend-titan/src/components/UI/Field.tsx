import { cloneElement, isValidElement, useId, type ReactElement, type ReactNode } from "react";

interface FieldProps {
  label: string;
  required?: boolean;
  children: ReactNode;
  error?: string;
}

function Field({ label, required, children, error }: FieldProps) {
  const generatedId = useId();
  // Si el hijo es un único elemento (input/select/textarea), le asignamos un
  // id y lo asociamos al label con htmlFor, para que lectores de pantalla y
  // getByLabelText lo encuentren. Si no, lo dejamos tal cual (fallback seguro).
  const soloUnHijo = isValidElement(children);
  const childId = soloUnHijo ? (children as ReactElement<{ id?: string }>).props.id || generatedId : undefined;
  const hijo = soloUnHijo ? cloneElement(children as ReactElement<{ id?: string }>, { id: childId }) : children;

  return (
    <div className="mb-gap-sm">
      <label htmlFor={childId} className="block font-label-sm text-label-sm uppercase font-bold text-on-surface mb-1">
        {label}
        {required && <span className="text-primary"> *</span>}
      </label>
      {hijo}
      {error && <p className="text-error font-label-sm text-label-sm mt-1 m-0">{error}</p>}
    </div>
  );
}

export default Field;
