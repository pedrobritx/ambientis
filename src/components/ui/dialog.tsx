"use client";
import {
  cloneElement,
  useEffect,
  useId,
  useRef,
  type ReactElement,
  type ReactNode,
} from "react";
import { X } from "./icons";
export function Dialog({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const closing = useRef(false);
  function dismiss() {
    if (closing.current) return;
    closing.current = true;
    const dialog = ref.current;
    if (!dialog || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      onClose();
      return;
    }
    const animation = dialog.animate(
      [
        { opacity: 1, transform: "scale(1)" },
        { opacity: 0, transform: "scale(.96)" },
      ],
      { duration: 220, easing: "cubic-bezier(.4,0,1,1)", fill: "forwards" },
    );
    animation.onfinish = onClose;
  }
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const dialog = ref.current;
    const source = previous?.getBoundingClientRect();
    dialog?.showModal();
    if (
      dialog &&
      source &&
      !matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      const rect = dialog.getBoundingClientRect();
      const dx = source.x + source.width / 2 - rect.x - rect.width / 2;
      const dy = source.y + source.height / 2 - rect.y - rect.height / 2;
      dialog.animate(
        [
          {
            opacity: 0,
            transform: `translate(${dx * 0.35}px,${dy * 0.35}px) scale(.82,.72)`,
            borderRadius: "48px",
          },
          {
            opacity: 1,
            transform: "translate(0,0) scale(1)",
            borderRadius: "28px",
          },
        ],
        { duration: 320, easing: "cubic-bezier(.16,1,.3,1)" },
      );
    }
    return () => {
      // Remove the modal's inert boundary before restoring its opener, including Strict Mode cleanup.
      dialog?.close();
      previous?.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onCancel={(e) => {
        e.preventDefault();
        dismiss();
      }}
      onClickCapture={(e) => {
        if ((e.target as HTMLElement).closest("[data-dialog-close]")) {
          e.preventDefault();
          e.stopPropagation();
          dismiss();
        }
      }}
    >
      <div className="dialog-header">
        <h2 id={titleId}>{title}</h2>
        <button
          className="icon-button"
          onClick={dismiss}
          aria-label="Fechar janela"
        >
          <X size={20} />
        </button>
      </div>
      {children}
    </dialog>
  );
}
export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactElement<{
    "aria-labelledby"?: string;
    "aria-describedby"?: string;
  }>;
  hint?: string;
}) {
  const id = useId();
  return (
    <label className="field">
      <span id={id}>{label}</span>
      {cloneElement(children, {
        "aria-labelledby": id,
        "aria-describedby": hint ? `${id}-hint` : undefined,
      })}
      {hint && <small id={`${id}-hint`}>{hint}</small>}
    </label>
  );
}
export function Empty({
  title,
  children,
}: {
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="empty">
      <h3>{title}</h3>
      {children && <p>{children}</p>}
    </div>
  );
}
