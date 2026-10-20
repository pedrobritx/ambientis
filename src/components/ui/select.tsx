"use client";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { Check, ChevronDown } from "./icons";

type Option = { value: string; label: string };
export function Select({
  value,
  defaultValue,
  onValueChange,
  options,
  name,
  disabled = false,
  ...aria
}: {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  options: readonly Option[];
  name?: string;
  disabled?: boolean;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
}) {
  const [internal, setInternal] = useState(
    defaultValue ?? options[0]?.value ?? "",
  );
  const selected = value ?? internal;
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [position, setPosition] = useState({
    left: 0,
    top: 0,
    width: 0,
    maxHeight: 320,
  });
  const trigger = useRef<HTMLButtonElement>(null);
  const popup = useRef<HTMLDivElement>(null);
  const search = useRef({ text: "", at: 0 });
  const id = useId();
  useEffect(() => {
    if (!open) return;
    const reposition = () => {
      const rect = trigger.current?.getBoundingClientRect();
      if (!rect) return;
      if (rect.bottom < 0 || rect.top > innerHeight) {
        popup.current?.hidePopover();
        setOpen(false);
        return;
      }
      const below = innerHeight - rect.bottom - 16;
      const above = below < 160 && rect.top > below;
      const height = Math.min(
        options.length * 48 + 16,
        320,
        above ? rect.top - 16 : below,
      );
      setPosition({
        left: Math.max(8, Math.min(rect.left, innerWidth - rect.width - 8)),
        top: above ? rect.top - height - 8 : rect.bottom + 8,
        width: rect.width,
        maxHeight: height,
      });
    };
    window.addEventListener("resize", reposition);
    window.addEventListener("scroll", reposition);
    return () => {
      window.removeEventListener("resize", reposition);
      window.removeEventListener("scroll", reposition);
    };
  }, [open, options.length]);
  const index = Math.max(
    0,
    options.findIndex((o) => o.value === selected),
  );
  function close(restore = true) {
    popup.current?.hidePopover();
    setOpen(false);
    if (restore) trigger.current?.focus();
  }
  function focusOption(next: number) {
    setActive(next);
    requestAnimationFrame(() => {
      const items =
        popup.current?.querySelectorAll<HTMLElement>('[role="option"]');
      items?.[next]?.focus({ preventScroll: true });
      items?.[next]?.scrollIntoView({ block: "nearest" });
    });
  }
  function show(next = index) {
    const rect = trigger.current!.getBoundingClientRect();
    const availableBelow = innerHeight - rect.bottom - 16;
    const above = availableBelow < 160 && rect.top > availableBelow;
    const height = Math.min(
      options.length * 48 + 16,
      320,
      above ? rect.top - 16 : availableBelow,
    );
    setPosition({
      left: Math.max(8, Math.min(rect.left, innerWidth - rect.width - 8)),
      top: above ? rect.top - height - 8 : rect.bottom + 8,
      width: rect.width,
      maxHeight: height,
    });
    setOpen(true);
    popup.current?.showPopover();
    focusOption(next);
  }
  function choose(next: number) {
    setInternal(options[next].value);
    onValueChange?.(options[next].value);
    close();
  }
  function keys(e: KeyboardEvent) {
    if (e.key === "Escape" && open) {
      e.preventDefault();
      e.stopPropagation();
      close();
      return;
    }
    if (e.key === "Tab") {
      if (open) close();
      return;
    }
    const arrow = e.key === "ArrowDown" ? 1 : e.key === "ArrowUp" ? -1 : 0;
    if (arrow) {
      e.preventDefault();
      if (!open) show();
      else focusOption((active + arrow + options.length) % options.length);
      return;
    }
    if (e.key === "Home" || e.key === "End") {
      e.preventDefault();
      const next = e.key === "Home" ? 0 : options.length - 1;
      if (open) focusOption(next);
      else show(next);
      return;
    }
    if (open && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      choose(active);
      return;
    }
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && e.key !== " ") {
      e.preventDefault();
      const now = Date.now();
      search.current = {
        text:
          (now - search.current.at < 600 ? search.current.text : "") +
          e.key.toLocaleLowerCase("pt-BR"),
        at: now,
      };
      const next = options.findIndex((o) =>
        o.label.toLocaleLowerCase("pt-BR").startsWith(search.current.text),
      );
      if (next >= 0) {
        if (open) focusOption(next);
        else show(next);
      }
    }
  }
  return (
    <span className="select-control">
      {name && <input type="hidden" name={name} value={selected} />}
      <button
        ref={trigger}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={id}
        disabled={disabled}
        className="select-trigger"
        onClick={() => (open ? close() : show())}
        onKeyDown={keys}
        {...aria}
      >
        <span>{options[index]?.label}</span>
        <ChevronDown size={18} />
      </button>
      <div
        ref={popup}
        id={id}
        popover="auto"
        role="listbox"
        tabIndex={-1}
        aria-label={aria["aria-label"] ?? "Opções disponíveis"}
        className="select-menu"
        style={position}
        onToggle={(e) => {
          if (e.newState === "closed") setOpen(false);
        }}
        onKeyDown={keys}
      >
        {options.map((o, i) => (
          <button
            key={o.value}
            type="button"
            role="option"
            aria-selected={selected === o.value}
            tabIndex={active === i ? 0 : -1}
            className="select-option"
            onClick={() => choose(i)}
            onFocus={() => setActive(i)}
          >
            <span>{o.label}</span>
            {selected === o.value && <Check size={18} />}
          </button>
        ))}
      </div>
    </span>
  );
}
