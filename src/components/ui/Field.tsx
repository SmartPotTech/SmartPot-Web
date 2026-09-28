import {type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, useId} from "react";

const CONTROL = `h-11 w-full rounded-xl border bg-white px-3 text-sm text-ink placeholder:text-muted/70
  transition-colors focus:border-leaf-500 focus:outline-none focus:ring-2 focus:ring-leaf-500/25`;

interface FieldProps {
    label: string;
    error?: string;
    hint?: ReactNode;
}

export function TextField({
                              label,
                              error,
                              hint,
                              className = "",
                              ...props
                          }: FieldProps & InputHTMLAttributes<HTMLInputElement>) {
    const id = useId();
    return (
        <div className={className}>
            <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink">{label}</label>
            <input
                id={id}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? `${id}-error` : undefined}
                className={`${CONTROL} ${error ? "border-danger-500" : "border-line"}`}
                {...props}
            />
            {error ? <p id={`${id}-error`} className="mt-1 text-sm text-danger-600">{error}</p>
                : hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
        </div>
    );
}

export function SelectField({label, error, hint, className = "", children, ...props}:
                                FieldProps & SelectHTMLAttributes<HTMLSelectElement>) {
    const id = useId();
    return (
        <div className={className}>
            <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink">{label}</label>
            <select id={id} aria-invalid={Boolean(error)}
                    className={`${CONTROL} ${error ? "border-danger-500" : "border-line"}`}
                    {...props}>
                {children}
            </select>
            {error ? <p className="mt-1 text-sm text-danger-600">{error}</p>
                : hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
        </div>
    );
}
