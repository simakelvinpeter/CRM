import { useState } from "react";

export function Field({
  label,
  name,
  value = "",
  type = "text",
  options,
  required = false,
  children,
  ...props
}) {
  return (
    <label className="form-field">
      {label}
      {required ? " *" : ""}
      {children ||
        (options ? (
          <select
            name={name}
            defaultValue={value}
            required={required}
            {...props}
          >
            {options.map((o) => (
              <option
                key={typeof o === "string" ? o : o.value}
                value={typeof o === "string" ? o : o.value}
              >
                {typeof o === "string" ? o : o.label}
              </option>
            ))}
          </select>
        ) : type === "textarea" ? (
          <textarea
            name={name}
            defaultValue={value}
            required={required}
            {...props}
          />
        ) : (
          <input
            name={name}
            type={type}
            defaultValue={value}
            required={required}
            {...props}
          />
        ))}
    </label>
  );
}
export function RecordForm({
  onSave,
  onCancel,
  children,
  submitLabel = "Save changes",
}) {
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  async function submit(event) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      await onSave(
        Object.fromEntries(new FormData(event.currentTarget)),
        event.currentTarget,
      );
    } catch (error) {
      setError(error.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <form onSubmit={submit}>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      {children}
      <div className="dialog-actions">
        <button type="button" className="button" onClick={onCancel}>
          Cancel
        </button>
        <button className="button primary" type="submit" disabled={busy}>
          {busy ? "Saving…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
export function Heading({ title, text, children }) {
  return (
    <div className="page-heading">
      <div>
        <h1>{title}</h1>
        <p>{text}</p>
      </div>
      <div className="heading-actions">{children}</div>
    </div>
  );
}
export function SearchBox({
  value,
  onChange,
  label = "Search",
  placeholder = "Search records…",
}) {
  return (
    <input
      className="standalone-search"
      aria-label={label}
      placeholder={placeholder}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}
export function Empty({ text = "No records yet." }) {
  return <p className="empty-state">{text}</p>;
}
