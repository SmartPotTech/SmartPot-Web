import { X } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";

interface DialogProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  /** Más ancho para guías y vistas previas. */
  wide?: boolean;
}

/** Diálogo nativo (<dialog>): gestiona el foco, Escape y el fondo sin librerías. */
export function Dialog({ open, title, onClose, children, footer, wide = false }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal?.();
    if (!open && dialog.open) dialog.close?.();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      aria-labelledby="dialog-title"
      className={`m-auto ${wide ? "w-[min(94vw,46rem)]" : "w-[min(92vw,34rem)]"} rounded-[var(--radius-card)] border border-line bg-white p-0 text-ink
        shadow-2xl backdrop:bg-leaf-950/50 backdrop:backdrop-blur-sm`}
    >
      {open && (
        <div className="flex max-h-[85vh] flex-col">
          <header className="flex items-center justify-between border-b border-line px-5 py-4">
            <h2 id="dialog-title" className="text-lg font-semibold">{title}</h2>
            <button type="button" onClick={onClose} aria-label="Cerrar"
              className="rounded-lg p-1.5 text-muted hover:bg-surface hover:text-ink">
              <X size={18} />
            </button>
          </header>
          <div className="overflow-y-auto px-5 py-4">{children}</div>
          {footer && <footer className="flex justify-end gap-2 border-t border-line px-5 py-3">{footer}</footer>}
        </div>
      )}
    </dialog>
  );
}
