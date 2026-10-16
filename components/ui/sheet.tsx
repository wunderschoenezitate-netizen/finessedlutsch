"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Right-hand slide-over built on the native <dialog> element:
 * focus trapping, Esc to close and inert background come from the platform.
 */
export function Sheet({
  open,
  onClose,
  title,
  description,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
    // Close when the route is hidden by Activity so the modal never blocks another page.
    return () => {
      if (dialog.open) dialog.close();
    };
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      aria-labelledby="sheet-title"
      className={cn(
        "sheet fixed inset-y-0 right-0 left-auto m-0 h-dvh max-h-dvh w-full max-w-3xl border-l border-line bg-surface p-0 text-ink",
        "backdrop:bg-black/60",
        className,
      )}
    >
      <div className="flex h-full flex-col">
        <header className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
          <div className="min-w-0">
            <h2 id="sheet-title" className="text-base font-semibold">
              {title}
            </h2>
            {description ? <p className="mt-0.5 text-xs text-ink-3">{description}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-ink-3 hover:bg-surface-3 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60"
            aria-label="Close panel"
          >
            <X className="size-4" />
          </button>
        </header>
        <div className="scroll-thin flex-1 overflow-y-auto px-5 py-5">{children}</div>
      </div>
    </dialog>
  );
}
