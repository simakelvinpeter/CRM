import { useEffect, useRef } from "react";
import { X } from "lucide-react";

// One reusable badge keeps status styling consistent across pages.
export function Badge({ children }) {
  const text = String(children).toLowerCase();
  let tone = "neutral";
  if (/offer|signed|enrolled|verified/.test(text)) tone = "green";
  if (/review|visa|submitted/.test(text)) tone = "blue";
  if (/condition|signature|required/.test(text)) tone = "amber";
  if (/rejected|refused/.test(text)) tone = "red";
  return (
    <span className={`badge ${tone}`}>
      <i />
      {children}
    </span>
  );
}

export function Panel({ title, subtitle, action, children }) {
  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function Modal({ title, onClose, children }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const previousFocus = document.activeElement;
    const dialog = dialogRef.current;
    const focusable = () =>
      [
        ...dialog.querySelectorAll("button, input, select, textarea, a[href]"),
      ].filter((element) => !element.disabled);
    focusable()[0]?.focus();

    function handleKey(event) {
      if (event.key === "Escape") onClose();
      if (event.key !== "Tab") return;
      const controls = focusable();
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    }

    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("keydown", handleKey);
      previousFocus?.focus();
    };
  }, [onClose]);

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        ref={dialogRef}
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
      >
        <header>
          <h2 id="dialog-title">{title}</h2>
          <button
            className="icon-button"
            aria-label="Close dialog"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </header>
        <div className="modal-body">{children}</div>
      </section>
    </div>
  );
}

export function money(amount, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function initials(name) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("");
}

export function formatDate(date) {
  if (!date) return "—";
  return new Date(`${date}T12:00:00`).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
