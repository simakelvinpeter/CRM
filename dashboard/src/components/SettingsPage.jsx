import { useState } from "react";
import { useWorkspace } from "../WorkspaceContext.jsx";
import { currencies, stages, validateState } from "../model.js";
import { Heading, Field, RecordForm } from "./Forms.jsx";
import { Panel } from "./Shared.jsx";
import { exportBackup, restoreAttachments } from "../files.js";

export default function SettingsPage() {
  const { data, send, restore, notify, role } = useWorkspace(),
    [tab, setTab] = useState("Agency"),
    [backup, setBackup] = useState(null),
    [confirm, setConfirm] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  async function inspectBackup(file) {
    setError("");
    setBackup(null);
    if (!file) return;
    try {
      if (file.size > 150 * 1024 * 1024) throw Error("Backup exceeds 150 MB.");
      const b = JSON.parse(await file.text());
      if (b.format !== "study-go-backup")
        throw Error("This is not a Study & Go backup.");
      validateState(b.data);
      setBackup(b);
      setConfirm("");
    } catch (e) {
      setError(e.message);
    }
  }
  async function importBackup() {
    setBusy(true);
    setError("");
    try {
      await restoreAttachments(backup);
      restore(backup.data);
      setBackup(null);
      notify("Backup restored, including attachments.");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  if (role !== "Agency owner")
    return (
      <p className="notice">
        Agency settings are available to the owner preview.
      </p>
    );
  return (
    <>
      <Heading
        title="Settings"
        text="Agency preferences, reporting rates and complete backups"
      />
      <div className="tabs">
        {[
          "Agency",
          "Notifications",
          "Journey & permissions",
          "Backups",
          "Design system",
        ].map((t) => (
          <button
            key={t}
            className={tab === t ? "active" : ""}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>
      <Panel title={tab}>
        {tab === "Agency" && (
          <div className="body-copy">
            <RecordForm
              onCancel={() => notify("No changes saved.")}
              onSave={(f) => {
                send("settings.save", {
                  ...data.settings,
                  ...f,
                  rates: Object.fromEntries(
                    currencies.map((c) => [c, Number(f["rate_" + c])]),
                  ),
                });
                notify("Agency settings saved.");
              }}
            >
              <div className="form-grid">
                <Field
                  label="Agency name"
                  name="agency"
                  value={data.settings.agency}
                  required
                />
                <Field
                  label="Administrator display name"
                  name="adminName"
                  value={data.settings.adminName || "Administrator"}
                  required
                />
                <Field
                  label="Contact email"
                  name="email"
                  type="email"
                  value={data.settings.email}
                  required
                />
                <Field
                  label="Reporting currency"
                  name="currency"
                  value={data.settings.currency}
                  options={currencies}
                />
                <Field
                  label="Exchange rate date"
                  name="rateDate"
                  type="date"
                  value={data.settings.rateDate}
                  required
                />
              </div>
              <h3 className="section-gap">
                Manual reporting rates: USD per one currency unit
              </h3>
              <p className="helper">
                These are indicative manual rates, not live financial quotes.
                Original record currencies are preserved.
              </p>
              <div className="form-grid">
                {currencies.map((c) => (
                  <Field
                    key={c}
                    label={c + " to USD"}
                    name={"rate_" + c}
                    type="number"
                    min="0.000001"
                    step="0.000001"
                    value={data.settings.rates[c]}
                    required
                  />
                ))}
              </div>
            </RecordForm>
          </div>
        )}
        {tab === "Notifications" && (
          <div className="body-copy">
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={data.settings.notifications}
                onChange={(e) => {
                  try {
                    send("settings.save", {
                      ...data.settings,
                      notifications: e.target.checked,
                    });
                  } catch (e) {
                    notify(e.message);
                  }
                }}
              />
              Show in-app deadline reminders
            </label>
            <p className="muted">
              The bell opens upcoming tasks and agreement renewals. Email and
              SMS are not connected.
            </p>
          </div>
        )}
        {tab === "Journey & permissions" && (
          <div className="body-copy">
            <p>Stages: {stages.join(" → ")}</p>
            <h3 className="section-gap">Local role preview</h3>
            <p>
              Owner: all workflows. Finance: records and financial operations.
              Counsellor: student, application, task, document and visa work.
              Referral agent: assigned records and course shortlists.
            </p>
            <p className="notice">
              This local role selector demonstrates visibility. It does not
              secure browser storage or replace server authentication. Use
              hosted sign-in and server permissions before sharing real records.
            </p>
          </div>
        )}
        {tab === "Backups" && (
          <div className="body-copy">
            <p>
              Export records and file attachments together. Keep a backup
              outside this browser before clearing site data.
            </p>
            <button
              className="button primary section-gap"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                try {
                  await exportBackup(data);
                  notify("Backup exported with attachments.");
                } catch (e) {
                  notify(e.message);
                } finally {
                  setBusy(false);
                }
              }}
            >
              Export complete backup
            </button>
            <Field
              label="Inspect a backup to restore"
              type="file"
              accept=".json"
              value={undefined}
              onChange={(e) => inspectBackup(e.target.files[0])}
            />
            {error && (
              <p role="alert" className="form-error">
                {error}
              </p>
            )}
            {backup && (
              <div className="notice restore-preview">
                <p>
                  {backup.data.students.length} students ·{" "}
                  {backup.data.applications.length} applications ·{" "}
                  {backup.files?.length || 0} attachments. Restoring replaces
                  current records.
                </p>
                <label>
                  Type RESTORE to confirm
                  <input
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                  />
                </label>
                <button
                  className="button primary"
                  disabled={confirm !== "RESTORE" || busy}
                  onClick={importBackup}
                >
                  {busy ? "Restoring…" : "Restore backup"}
                </button>
              </div>
            )}
          </div>
        )}
        {tab === "Design system" && (
          <div className="body-copy">
            <div className="swatches">
              {[
                ["Midnight navy", "#142338"],
                ["Emerald", "#0B5D4B"],
                ["Warm ivory", "#F6F5F0"],
                ["Champagne", "#B99A62"],
              ].map(([label, color]) => (
                <div key={label}>
                  <span style={{ background: color }} />
                  <strong>{label}</strong>
                  <small>{color}</small>
                </div>
              ))}
            </div>
            <p>
              Glass is limited to the sidebar. Fine borders, restrained accents
              and readable working surfaces follow the Figma direction.
            </p>
          </div>
        )}
      </Panel>
    </>
  );
}
