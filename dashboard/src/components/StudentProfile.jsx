import { useState } from "react";
import { ArrowLeft, FileText, Download, Plus } from "lucide-react";
import { useWorkspace } from "../WorkspaceContext.jsx";
import { Badge, Panel, money, formatDate } from "./Shared.jsx";
import { Empty } from "./Forms.jsx";
import { downloadFile } from "../files.js";
import { stages } from "../model.js";

export default function StudentProfile({ id, onBack }) {
  const { data, open, send, role, notify } = useWorkspace();
  const [tab, setTab] = useState("Overview"),
    [showArchived, setShowArchived] = useState(false);
  const s = data.students.find((s) => s.id === id),
    readOnly = role === "Referral agent";
  const applications = data.applications.filter((a) => a.studentId === id),
    documents = data.documents.filter(
      (d) => d.studentId === id && (showArchived || !d.archived),
    ),
    visas = data.visas.filter((v) => v.studentId === id);
  const university = (id) =>
    data.partners.find((p) => p.id === id)?.name || "Unknown university";
  return (
    <>
      <button className="back-link" onClick={onBack}>
        <ArrowLeft size={16} />
        All students
      </button>
      <section className="panel full-profile">
        <div className="profile-top">
          <div>
            <div className="heading-actions">
              <h1>{s.name}</h1>
              <Badge>{s.archived ? "Archived" : s.stage}</Badge>
            </div>
            <p>
              {s.id} · {s.nationality || "Nationality not recorded"} ·{" "}
              {s.city || "City not recorded"}
            </p>
            <p>
              {s.email} · {s.phone || "No phone recorded"}
            </p>
          </div>
          <div className="heading-actions">
            {!readOnly && (
              <>
                <button
                  className="button"
                  onClick={() => open("student", s.id)}
                >
                  Edit profile
                </button>
                <button
                  className="button primary"
                  onClick={() => open("application", null, { studentId: id })}
                >
                  + Application
                </button>
              </>
            )}
          </div>
        </div>
        <dl className="profile-facts">
          <div>
            <dt>COUNSELLOR</dt>
            <dd>{s.counsellor}</dd>
          </div>
          <div>
            <dt>NEXT ACTION</dt>
            <dd>{s.nextAction || "Not assigned"}</dd>
            <small>{formatDate(s.deadline)}</small>
          </div>
          <div>
            <dt>TARGET INTAKE</dt>
            <dd>{s.intake}</dd>
          </div>
          <div>
            <dt>ANNUAL BUDGET</dt>
            <dd>{money(s.budget, s.currency)}</dd>
          </div>
        </dl>
        <div className="journey-steps">
          {stages.slice(0, 9).map((stage, i) => (
            <div
              key={stage}
              className={i <= stages.indexOf(s.stage) ? "reached" : ""}
            >
              <span>{i + 1}</span>
              <small>{stage}</small>
            </div>
          ))}
        </div>
        <div className="tabs">
          {[
            "Overview",
            "Applications",
            "Documents",
            "Visa & Travel",
            "Activity",
          ].map((t) => (
            <button
              key={t}
              className={tab === t ? "active" : ""}
              onClick={() => setTab(t)}
            >
              {t}
              {t === "Applications"
                ? " · " + applications.length
                : t === "Documents"
                  ? " · " +
                    data.documents.filter(
                      (d) => d.studentId === id && !d.archived,
                    ).length
                  : ""}
            </button>
          ))}
        </div>
      </section>

      {tab === "Overview" && (
        <div className="two-columns">
          <div className="stack">
            <Panel
              title="Study preferences"
              subtitle="Counselling details and academic background"
            >
              <dl className="detail-grid">
                {[
                  ["Destination", s.country],
                  ["Subject", s.subject],
                  ["Qualification", s.level],
                  ["Education", s.education],
                  ["Grades", s.grades],
                  ["English result", s.english],
                  ["Guardian", s.guardian],
                  ["Budget", money(s.budget, s.currency) + " / year"],
                ].map(([k, v]) => (
                  <div key={k}>
                    <dt>{k}</dt>
                    <dd>{v || "Not recorded"}</dd>
                  </div>
                ))}
              </dl>
            </Panel>
            <Panel
              title="Course shortlist"
              subtitle="Selected courses for this student"
            >
              <div className="simple-list">
                {s.shortlist.length ? (
                  s.shortlist.map((courseId) => {
                    const c = data.courses.find((c) => c.id === courseId);
                    return (
                      c && (
                        <div className="list-row" key={c.id}>
                          <div className="grow">
                            <strong>{c.name}</strong>
                            <small>
                              {university(c.universityId)} · {c.intake}
                            </small>
                          </div>
                          <button
                            className="text-button"
                            onClick={() => open("courseDetail", c.id)}
                          >
                            Details
                          </button>
                          <button
                            className="text-button"
                            onClick={() => {
                              try {
                                send("shortlist.toggle", {
                                  studentId: id,
                                  courseId,
                                });
                              } catch (e) {
                                notify(e.message);
                              }
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      )
                    );
                  })
                ) : (
                  <Empty text="No courses shortlisted yet." />
                )}
              </div>
            </Panel>
          </div>
          <div className="stack">
            <Panel
              title="Counsellor notes"
              action={
                !readOnly && (
                  <button
                    className="text-button"
                    onClick={() => open("note", null, { studentId: id })}
                  >
                    Add note
                  </button>
                )
              }
            >
              <div className="notes-list">
                {data.notes
                  .filter((n) => n.studentId === id)
                  .map((n) => (
                    <div key={n.id}>
                      <strong>{n.actor}</strong>
                      <small>{new Date(n.date).toLocaleString()}</small>
                      <p>{n.text}</p>
                    </div>
                  ))}
                {!data.notes.some((n) => n.studentId === id) && (
                  <Empty text="No notes recorded." />
                )}
              </div>
            </Panel>
            <Panel
              title="Student tasks"
              action={
                !readOnly && (
                  <button
                    className="text-button"
                    onClick={() => open("task", null, { studentId: id })}
                  >
                    Create task
                  </button>
                )
              }
            >
              <div className="simple-list">
                {data.tasks
                  .filter((t) => t.studentId === id)
                  .map((t) => (
                    <div className="list-row" key={t.id}>
                      <input
                        type="checkbox"
                        aria-label={"Complete " + t.title}
                        checked={t.done}
                        disabled={readOnly}
                        onChange={() => {
                          try {
                            send("task.toggle", { id: t.id });
                          } catch (e) {
                            notify(e.message);
                          }
                        }}
                      />
                      <div>
                        <strong>{t.title}</strong>
                        <small>
                          {formatDate(t.date)} · {t.owner}
                        </small>
                      </div>
                    </div>
                  ))}
              </div>
            </Panel>
          </div>
        </div>
      )}

      {tab === "Applications" && (
        <Panel
          title="University applications"
          subtitle="Each application has its own decision and conditions"
        >
          <div className="application-cards">
            {applications.map((a) => (
              <section className="application-card" key={a.id}>
                <div className="heading-actions">
                  <div className="grow">
                    <h3>{a.course}</h3>
                    <p>
                      {university(a.universityId)} · {a.intake}
                    </p>
                  </div>
                  <Badge>{a.status}</Badge>
                </div>
                <p>
                  Deadline: {formatDate(a.deadline)} · Deposit:{" "}
                  {money(a.deposit, a.currency)}{" "}
                  {a.depositPaid ? "paid" : "unpaid"}
                </p>
                {a.conditions.map((c) => (
                  <label className="condition" key={c.id}>
                    <input
                      type="checkbox"
                      checked={c.complete}
                      disabled={readOnly}
                      onChange={() => {
                        try {
                          send("condition.toggle", {
                            applicationId: a.id,
                            id: c.id,
                          });
                        } catch (e) {
                          notify(e.message);
                        }
                      }}
                    />
                    {c.name}
                    <Badge>{c.complete ? "Complete" : "Required"}</Badge>
                  </label>
                ))}
                {a.accepted && <Badge>Selected offer</Badge>}
                {!readOnly && (
                  <div className="heading-actions section-gap">
                    <button
                      className="button"
                      onClick={() => open("application", a.id)}
                    >
                      Open application
                    </button>
                  </div>
                )}
              </section>
            ))}
            {!applications.length && <Empty text="No applications yet." />}
          </div>
        </Panel>
      )}

      {tab === "Documents" && (
        <Panel
          title="Student documents"
          subtitle="Files stay in this browser; include them in your backups"
          action={
            <div className="heading-actions">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={showArchived}
                  onChange={(e) => setShowArchived(e.target.checked)}
                />
                Show archived
              </label>
              {!readOnly && (
                <button
                  className="button primary"
                  onClick={() => open("document", null, { studentId: id })}
                >
                  <Plus size={14} />
                  Add document
                </button>
              )}
            </div>
          }
        >
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Document</th>
                  <th>Status</th>
                  <th>Expiry</th>
                  <th>Reviewer</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((d) => (
                  <tr key={d.id}>
                    <td>
                      <strong>{d.name}</strong>
                      <small>{d.feedback}</small>
                      {d.archived && <Badge>Archived</Badge>}
                    </td>
                    <td>
                      <Badge>
                        {d.expiry &&
                        d.expiry < new Date().toISOString().slice(0, 10)
                          ? "Expired"
                          : d.status}
                      </Badge>
                    </td>
                    <td>{formatDate(d.expiry)}</td>
                    <td>{d.reviewer || "—"}</td>
                    <td>
                      <div className="heading-actions">
                        {d.fileId && (
                          <button
                            className="text-button"
                            onClick={() =>
                              downloadFile(d.fileId).catch((e) =>
                                notify(e.message),
                              )
                            }
                          >
                            <Download size={14} />
                            Download
                          </button>
                        )}
                        {!readOnly && (
                          <button
                            className="text-button"
                            onClick={() => open("document", d.id)}
                          >
                            Review
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!documents.length && <Empty text="No documents in this view." />}
        </Panel>
      )}

      {tab === "Visa & Travel" && (
        <Panel
          title="Visa & travel cases"
          subtitle="Approval, arrival and enrolment are separate milestones"
          action={
            !readOnly && (
              <button
                className="button primary"
                onClick={() => open("visa", null, { studentId: id })}
              >
                + New visa case
              </button>
            )
          }
        >
          <div className="application-cards">
            {visas.map((v) => (
              <section className="application-card" key={v.id}>
                <div className="heading-actions">
                  <h3 className="grow">
                    {university(
                      data.applications.find((a) => a.id === v.applicationId)
                        ?.universityId,
                    )}
                  </h3>
                  <Badge>{v.status}</Badge>
                  {!readOnly && (
                    <button
                      className="button"
                      onClick={() => open("visa", v.id)}
                    >
                      Update case
                    </button>
                  )}
                </div>
                <dl className="detail-grid">
                  {[
                    ["Application", v.applicationId],
                    ["Submitted", formatDate(v.submitted)],
                    ["Appointment", formatDate(v.appointment)],
                    ["Decision", formatDate(v.decision)],
                    ["Flight", v.flight || "Not confirmed"],
                    ["Arrived abroad", formatDate(v.arrival)],
                    ["Enrolment confirmed", formatDate(v.enrolment)],
                  ].map(([k, value]) => (
                    <div key={k}>
                      <dt>{k}</dt>
                      <dd>{value}</dd>
                    </div>
                  ))}
                </dl>
                <p>{v.notes}</p>
                <h3 className="section-gap">Case history</h3>
                <div className="timeline">
                  {v.history.map((h, i) => (
                    <div key={i}>
                      <Badge>{h.status}</Badge>
                      <small>{new Date(h.date).toLocaleString()}</small>
                      <p>{h.text}</p>
                    </div>
                  ))}
                  {!v.history.length && (
                    <p className="muted">No changes since the initial case.</p>
                  )}
                </div>
              </section>
            ))}
            {!visas.length && (
              <Empty text="Select and accept a university offer before creating a visa case." />
            )}
          </div>
        </Panel>
      )}

      {tab === "Activity" && (
        <Panel
          title="Activity history"
          subtitle="Changes to this student, their applications and financial records"
        >
          <div className="timeline">
            {data.activity
              .filter((e) => e.studentId === id)
              .map((e) => (
                <div key={e.id}>
                  <small>
                    {new Date(e.date).toLocaleString()} · {e.actor}
                  </small>
                  <p>{e.text}</p>
                </div>
              ))}
            {!data.activity.some((e) => e.studentId === id) && (
              <Empty text="Changes will appear here as you work." />
            )}
          </div>
        </Panel>
      )}
    </>
  );
}
