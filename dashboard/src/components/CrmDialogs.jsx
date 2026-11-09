import { useWorkspace } from "../WorkspaceContext.jsx";
import { Field, RecordForm } from "./Forms.jsx";
import {
  currencies,
  stages,
  statuses,
  roles,
  uid,
  today,
  balance,
  entitlementTotal,
  paidTotal,
  financeAllowed,
} from "../model.js";
import { Badge, formatDate, money } from "./Shared.jsx";
import { saveFile, removeFile, downloadFile } from "../files.js";

export default function CrmDialogs({ dialog, onClose }) {
  const { data, send, role, notify } = useWorkspace();
  const { type, id, studentId, partnerId, applicationId } = dialog;
  const student = data.students.find((s) => s.id === studentId || s.id === id);
  const options = (records, label = "name") =>
    records.map((r) => ({ value: r.id, label: r[label] }));
  const save = (action, payload) => {
    send(action, payload);
    onClose();
  };
  async function attach(form, oldId) {
    const file = form.querySelector('[name="attachment"]')?.files[0];
    return file ? await saveFile(file) : oldId || "";
  }

  if (type === "student") {
    const s = data.students.find((s) => s.id === id) || {
      id: uid("SG"),
      stage: "Enquiry",
      country: "United Kingdom",
      intake: "Sep 2027",
      budget: 0,
      currency: "USD",
      counsellor: data.team.find((t) => t.active)?.name || "",
      shortlist: [],
      archived: false,
    };
    return (
      <RecordForm
        onCancel={onClose}
        onSave={(f) =>
          save("student.save", {
            ...s,
            ...f,
            budget: Number(f.budget),
            archived: f.archived === "yes",
          })
        }
      >
        <div className="form-grid">
          <Field label="Full name" name="name" value={s.name} required />
          <Field
            label="Email"
            name="email"
            type="email"
            value={s.email}
            required
          />
          <Field label="Phone" name="phone" value={s.phone} />
          <Field label="Nationality" name="nationality" value={s.nationality} />
          <Field label="City" name="city" value={s.city} />
          <Field
            label="Preferred destination"
            name="country"
            value={s.country}
            required
          />
          <Field label="Subject" name="subject" value={s.subject} required />
          <Field
            label="Qualification"
            name="level"
            value={s.level || "Master’s degree"}
            options={["Master’s degree", "Bachelor’s degree", "Diploma", "PhD"]}
          />
          <Field label="Intake" name="intake" value={s.intake} required />
          <Field
            label="Annual tuition budget"
            name="budget"
            type="number"
            min="0"
            step="0.01"
            value={s.budget}
            required
          />
          <Field
            label="Budget currency"
            name="currency"
            value={s.currency}
            options={currencies}
          />
          <Field
            label="Counsellor"
            name="counsellor"
            value={s.counsellor}
            options={data.team
              .filter((t) => t.active || t.name === s.counsellor)
              .map((t) => t.name)}
          />
          <Field
            label="Journey stage"
            name="stage"
            value={s.stage}
            options={stages}
          />
          <Field label="Next action" name="nextAction" value={s.nextAction} />
          <Field
            label="Next action date"
            name="deadline"
            type="date"
            value={s.deadline}
          />
          <Field
            label="Record visibility"
            name="archived"
            value={s.archived ? "yes" : "no"}
            options={[
              { value: "no", label: "Active" },
              { value: "yes", label: "Archived (can be restored)" },
            ]}
          />
          <Field label="Education" name="education" value={s.education} />
          <Field label="Grades" name="grades" value={s.grades} />
          <Field
            label="English test / result"
            name="english"
            value={s.english}
          />
          <Field label="Guardian contact" name="guardian" value={s.guardian} />
        </div>
      </RecordForm>
    );
  }

  if (type === "application") {
    const a = data.applications.find((a) => a.id === id) || {
      id: uid("APP"),
      studentId: studentId || data.students[0]?.id,
      courseId: data.courses.find((c) => !c.archived)?.id,
      status: "Draft",
      deposit: 0,
      depositPaid: false,
      accepted: false,
      conditions: [],
      history: [],
    };
    return (
      <RecordForm
        onCancel={onClose}
        onSave={(f) => {
          const conditions = f.conditionText
            .split("\n")
            .map((x) => x.trim())
            .filter(Boolean)
            .map(
              (name, i) =>
                a.conditions.find((c) => c.name === name) || {
                  id: uid("COND"),
                  name,
                  complete: false,
                },
            );
          save("application.save", {
            ...a,
            ...f,
            deposit: Number(f.deposit),
            accepted: f.accepted === "yes",
            depositPaid: f.depositPaid === "yes",
            conditions,
          });
        }}
      >
        <div className="form-grid">
          <Field
            label="Student"
            name="studentId"
            value={a.studentId}
            options={options(
              data.students.filter((s) => !s.archived || s.id === a.studentId),
            )}
          />
          <Field
            label="Course / university"
            name="courseId"
            value={a.courseId}
            options={data.courses
              .filter((c) => !c.archived || c.id === a.courseId)
              .map((c) => ({
                value: c.id,
                label:
                  c.name +
                  " · " +
                  data.partners.find((p) => p.id === c.universityId)?.name,
              }))}
          />
          <Field
            label="Intake"
            name="intake"
            value={a.intake || "Sep 2027"}
            required
          />
          <Field
            label="Application status"
            name="status"
            value={a.status}
            options={statuses}
          />
          <Field
            label="Submitted"
            name="submitted"
            type="date"
            value={a.submitted}
          />
          <Field
            label="Deadline"
            name="deadline"
            type="date"
            value={a.deadline}
          />
          <Field
            label="Deposit (course currency)"
            name="deposit"
            type="number"
            min="0"
            step="0.01"
            value={a.deposit}
          />
          <Field
            label="Deposit paid"
            name="depositPaid"
            value={a.depositPaid ? "yes" : "no"}
            options={[
              { value: "no", label: "Not paid" },
              { value: "yes", label: "Paid" },
            ]}
          />
          <Field
            label="Offer selected by student"
            name="accepted"
            value={a.accepted ? "yes" : "no"}
            options={[
              { value: "no", label: "Not selected" },
              { value: "yes", label: "Accepted / selected" },
            ]}
          />
        </div>
        <Field
          label="Offer conditions (one per line)"
          name="conditionText"
          type="textarea"
          value={a.conditions.map((c) => c.name).join("\n")}
        />
        <Field label="Update note" name="updateNote" type="textarea" required />
        {!!a.history.length && (
          <>
            <h3 className="section-gap">Status history</h3>
            <div className="timeline">
              {a.history.map((h, i) => (
                <div key={i}>
                  <small>
                    {formatDate(h.date.slice(0, 10))} ·{" "}
                    {h.actor || "Demo record"}
                  </small>
                  <strong>{h.status}</strong>
                  <p>{h.note}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </RecordForm>
    );
  }

  if (type === "partner") {
    const p = data.partners.find((p) => p.id === id) || {
      id: uid("UNI"),
      type: "Direct partner",
    };
    return (
      <RecordForm
        onCancel={onClose}
        onSave={(f) => save("partner.save", { ...p, ...f })}
      >
        <div className="form-grid">
          <Field label="University name" name="name" value={p.name} required />
          <Field label="Country" name="country" value={p.country} required />
          <Field label="City / campus" name="city" value={p.city} />
          <Field
            label="Partnership type"
            name="type"
            value={p.type}
            options={["Direct partner", "Through aggregator", "Prospect"]}
          />
          <Field label="Contact person" name="contact" value={p.contact} />
          <Field
            label="Admissions email"
            name="email"
            value={p.email}
            type="email"
            required
          />
        </div>
        <Field
          label="Relationship notes"
          name="notes"
          value={p.notes}
          type="textarea"
        />
      </RecordForm>
    );
  }

  if (type === "agreement") {
    const g = data.agreements.find((g) => g.id === id) || {
      id: uid("AGR"),
      universityId: partnerId || data.partners[0]?.id,
      status: "Draft",
      kind: "Percentage",
      rate: 0,
      currency: "GBP",
      paymentDays: 30,
      milestone: "Confirmed enrolment",
      start: today(),
      end: "2027-12-31",
      courseIds: [],
      intakes: [],
    };
    return (
      <RecordForm
        onCancel={onClose}
        onSave={async (f, form) => {
          const fileId = await attach(form, g.fileId);
          try {
            save("agreement.save", {
              ...g,
              ...f,
              rate: Number(f.rate),
              paymentDays: Number(f.paymentDays),
              courseIds: f.courseIds
                ? f.courseIds
                    .split(",")
                    .map((x) => x.trim())
                    .filter(Boolean)
                : [],
              intakes: f.intakes
                ? f.intakes
                    .split(",")
                    .map((x) => x.trim())
                    .filter(Boolean)
                : [],
              fileId,
              fileName:
                form.querySelector('[name="attachment"]').files[0]?.name ||
                g.fileName ||
                "",
            });
          } catch (error) {
            if (fileId && fileId !== g.fileId) await removeFile(fileId);
            throw error;
          }
        }}
      >
        <div className="form-grid">
          <Field
            label="University"
            name="universityId"
            value={g.universityId}
            options={options(data.partners)}
          />
          <Field
            label="Agreement version name"
            name="name"
            value={g.name}
            required
          />
          <Field
            label="Contract status"
            name="status"
            value={g.status}
            options={[
              "Draft",
              "Awaiting signature",
              "Signed",
              "Expired",
              "Not applicable",
            ]}
          />
          <Field
            label="Effective from"
            name="start"
            type="date"
            value={g.start}
            required
          />
          <Field
            label="Effective until"
            name="end"
            type="date"
            value={g.end}
            required
          />
          <Field
            label="Renewal reminder"
            name="renewal"
            type="date"
            value={g.renewal}
          />
          <Field
            label="Commission kind"
            name="kind"
            value={g.kind}
            options={["Percentage", "Fixed"]}
          />
          <Field
            label="Rate (%) or fixed amount"
            name="rate"
            type="number"
            min="0"
            step="0.01"
            value={g.rate}
            required
          />
          <Field
            label="Currency"
            name="currency"
            value={g.currency}
            options={currencies}
          />
          <Field
            label="Calculation basis"
            name="basis"
            value={g.basis || "First-year tuition"}
            required
          />
          <Field
            label="Eligibility milestone"
            name="milestone"
            value={g.milestone}
            options={["Visa approved", "Confirmed enrolment", "Deposit paid"]}
          />
          <Field
            label="Payment terms (days)"
            name="paymentDays"
            type="number"
            min="0"
            step="1"
            value={g.paymentDays}
          />
        </div>
        <Field
          label="Applicable course IDs (comma separated; blank = all)"
          name="courseIds"
          value={g.courseIds.join(", ")}
        />
        <p className="helper">
          Course IDs:{" "}
          {data.courses
            .filter((c) => c.universityId === g.universityId)
            .map((c) => c.id + " " + c.name)
            .join(" · ")}
        </p>
        <Field
          label="Applicable intakes (comma separated; blank = all)"
          name="intakes"
          value={g.intakes.join(", ")}
        />
        <Field
          label="Payment, refund and clawback terms"
          name="terms"
          value={g.terms}
          type="textarea"
        />
        <Field
          label="Signed contract attachment"
          name="attachment"
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.docx,.txt"
          value={undefined}
        />
        {g.fileId && (
          <button
            type="button"
            className="text-button"
            onClick={() =>
              downloadFile(g.fileId).catch((e) => notify(e.message))
            }
          >
            Download existing contract
          </button>
        )}
        <p className="helper">
          Existing commission records retain their saved agreement terms.
        </p>
      </RecordForm>
    );
  }

  if (type === "course") {
    const c = data.courses.find((c) => c.id === id) || {
      id: uid("CRS"),
      universityId: partnerId || data.partners[0]?.id,
      level: "Master’s degree",
      tuition: 0,
      currency: "GBP",
      intake: "Sep 2027",
      archived: false,
    };
    return (
      <RecordForm
        onCancel={onClose}
        onSave={(f) =>
          save("course.save", {
            ...c,
            ...f,
            tuition: Number(f.tuition),
            archived: f.archived === "yes",
          })
        }
      >
        <div className="form-grid">
          <Field label="Course name" name="name" value={c.name} required />
          <Field
            label="University"
            name="universityId"
            value={c.universityId}
            options={options(data.partners)}
          />
          <Field label="Subject" name="subject" value={c.subject} required />
          <Field
            label="Qualification"
            name="level"
            value={c.level}
            options={["Master’s degree", "Bachelor’s degree", "Diploma", "PhD"]}
          />
          <Field label="Duration" name="duration" value={c.duration} required />
          <Field
            label="Annual tuition"
            name="tuition"
            type="number"
            step="0.01"
            min="0"
            value={c.tuition}
            required
          />
          <Field
            label="Currency"
            name="currency"
            value={c.currency}
            options={currencies}
          />
          <Field label="Intake" name="intake" value={c.intake} required />
          <Field
            label="Application deadline"
            name="deadline"
            type="date"
            value={c.deadline}
          />
          <Field label="English requirement" name="english" value={c.english} />
          <Field label="Scholarship" name="scholarship" value={c.scholarship} />
          <Field
            label="Last verified"
            name="verified"
            type="date"
            value={c.verified}
          />
          <Field label="Source" name="source" value={c.source} required />
          <Field
            label="Catalogue visibility"
            name="archived"
            value={c.archived ? "yes" : "no"}
            options={[
              { value: "no", label: "Active" },
              { value: "yes", label: "Archived" },
            ]}
          />
        </div>
        <Field
          label="Entry requirements"
          name="requirements"
          type="textarea"
          value={c.requirements}
        />
      </RecordForm>
    );
  }

  if (type === "courseDetail") {
    const c = data.courses.find((c) => c.id === id),
      p = data.partners.find((p) => p.id === c.universityId);
    return (
      <>
        <h3>{c.name}</h3>
        <p>
          {p.name} · {p.country}
        </p>
        <dl className="detail-grid">
          {[
            ["Tuition / year", money(c.tuition, c.currency)],
            ["Intake", c.intake],
            ["Duration", c.duration],
            ["Deadline", formatDate(c.deadline)],
            ["English", c.english],
            ["Last verified", formatDate(c.verified)],
          ].map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value || "Not confirmed"}</dd>
            </div>
          ))}
        </dl>
        <h3>Entry requirements</h3>
        <p>{c.requirements}</p>
        <h3 className="section-gap">Scholarship</h3>
        <p>{c.scholarship || "Not confirmed"}</p>
        <p className="helper">
          Source: {c.source}. Verify current availability with the university.
        </p>
      </>
    );
  }

  if (type === "note")
    return (
      <RecordForm
        onCancel={onClose}
        onSave={(f) =>
          save("note.add", { id: uid("NOTE"), studentId, text: f.text })
        }
      >
        <Field label="Counsellor note" name="text" type="textarea" required />
      </RecordForm>
    );

  if (type === "document") {
    const d = data.documents.find((d) => d.id === id) || {
      id: uid("DOC"),
      studentId,
      status: "Required",
      fileId: "",
      fileName: "",
    };
    return (
      <RecordForm
        onCancel={onClose}
        onSave={async (f, form) => {
          const fileId = await attach(form, d.fileId);
          try {
            save("document.save", {
              ...d,
              ...f,
              fileId,
              fileName:
                form.querySelector('[name="attachment"]').files[0]?.name ||
                d.fileName,
              archived: f.archived === "yes",
            });
          } catch (error) {
            if (fileId && fileId !== d.fileId) await removeFile(fileId);
            throw error;
          }
        }}
      >
        <Field label="Document name" name="name" value={d.name} required />
        <div className="form-grid">
          <Field
            label="Review status"
            name="status"
            value={d.status}
            options={[
              "Required",
              "Uploaded",
              "Under review",
              "Verified",
              "Rejected",
              "Expired",
            ]}
          />
          <Field
            label="Expiry date"
            name="expiry"
            type="date"
            value={d.expiry}
          />
          <Field
            label="Visibility"
            name="archived"
            value={d.archived ? "yes" : "no"}
            options={[
              { value: "no", label: "Active" },
              { value: "yes", label: "Archived (recoverable)" },
            ]}
          />
        </div>
        <Field
          label="Review feedback"
          name="feedback"
          type="textarea"
          value={d.feedback}
        />
        <Field
          label="Attach / replace file (up to 10 MB)"
          name="attachment"
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.webp,.docx,.xlsx,.txt,.csv"
          value={undefined}
        />
        {d.fileId && (
          <button
            type="button"
            className="text-button"
            onClick={() =>
              downloadFile(d.fileId).catch((e) => notify(e.message))
            }
          >
            Download {d.fileName}
          </button>
        )}
        <p className="helper">
          Files are stored on this browser. Include attachments in your backups.
        </p>
      </RecordForm>
    );
  }

  if (type === "visa") {
    const v = data.visas.find((v) => v.id === id) || {
      id: uid("VISA"),
      studentId,
      status: "Preparing",
      history: [],
    };
    const offers = data.applications.filter(
      (a) =>
        a.studentId === v.studentId && a.accepted && a.status.includes("offer"),
    );
    return (
      <RecordForm
        onCancel={onClose}
        onSave={(f) => save("visa.save", { ...v, ...f })}
      >
        <Field
          label="Accepted university offer"
          name="applicationId"
          value={v.applicationId}
          options={[
            { value: "", label: "Select an accepted offer" },
            ...offers.map((a) => ({
              value: a.id,
              label:
                a.course +
                " · " +
                data.partners.find((p) => p.id === a.universityId)?.name,
            })),
          ]}
          required
        />
        <p className="helper">
          Accept/select an offer in Applications before creating a visa case.
        </p>
        <div className="form-grid">
          <Field
            label="Visa status"
            name="status"
            value={v.status}
            options={[
              "Preparing",
              "Submitted",
              "Approved",
              "Refused",
              "Reapplying",
            ]}
          />
          <Field
            label="Submitted"
            name="submitted"
            type="date"
            value={v.submitted}
          />
          <Field
            label="Appointment"
            name="appointment"
            type="date"
            value={v.appointment}
          />
          <Field
            label="Decision date"
            name="decision"
            type="date"
            value={v.decision}
          />
          <Field
            label="Arrival abroad"
            name="arrival"
            type="date"
            value={v.arrival}
          />
          <Field
            label="Enrolment confirmed"
            name="enrolment"
            type="date"
            value={v.enrolment}
          />
        </div>
        <Field label="Flight / travel details" name="flight" value={v.flight} />
        <Field
          label="Case notes / refusal explanation"
          name="notes"
          type="textarea"
          value={v.notes}
        />
        <p className="helper">
          Changes append to case history. Arrival and enrolment update the
          student journey independently.
        </p>
      </RecordForm>
    );
  }

  if (type === "task") {
    const t = data.tasks.find((t) => t.id === id) || {
      id: uid("TASK"),
      studentId: studentId || "",
      date: dialog.date || today(),
      time: "10:00",
      priority: "Normal",
      type: dialog.taskType || "Follow-up",
      done: false,
      ownerId: data.team.find((t) => t.active)?.id,
    };
    return (
      <RecordForm
        onCancel={onClose}
        onSave={(f) => save("task.save", { ...t, ...f })}
      >
        <Field
          label="Task / appointment title"
          name="title"
          value={t.title}
          required
        />
        <div className="form-grid">
          <Field
            label="Linked student"
            name="studentId"
            value={t.studentId}
            options={[
              { value: "", label: "Agency task" },
              ...options(data.students),
            ]}
          />
          <Field
            label="Owner"
            name="ownerId"
            value={t.ownerId || data.team.find((m) => m.name === t.owner)?.id}
            options={options(data.team.filter((t) => t.active))}
          />
          <Field label="Date" name="date" type="date" value={t.date} required />
          <Field label="Time" name="time" type="time" value={t.time} required />
          <Field
            label="Type"
            name="type"
            value={t.type}
            options={[
              "Follow-up",
              "Appointment",
              "Documents",
              "Visa",
              "Partnership",
              "Commission",
            ]}
          />
          <Field
            label="Priority"
            name="priority"
            value={t.priority}
            options={["Normal", "High"]}
          />
        </div>
      </RecordForm>
    );
  }

  if (type === "team") {
    const m = data.team.find((m) => m.id === id) || {
      id: uid("USR"),
      role: "Counsellor",
      salary: 0,
      currency: "USD",
      payPeriod: "Monthly",
      active: true,
    };
    return (
      <RecordForm
        onCancel={onClose}
        onSave={(f) =>
          save("team.save", {
            ...m,
            ...f,
            salary: Number(f.salary),
            active: f.active === "yes",
          })
        }
      >
        <div className="form-grid">
          <Field label="Full name" name="name" value={m.name} required />
          <Field label="Role" name="role" value={m.role} options={roles} />
          <Field
            label="Base salary"
            name="salary"
            type="number"
            min="0"
            step="0.01"
            value={m.salary}
          />
          <Field
            label="Currency"
            name="currency"
            value={m.currency}
            options={currencies}
          />
          <Field
            label="Pay period"
            name="payPeriod"
            value={m.payPeriod}
            options={["Monthly", "Weekly", "Yearly"]}
          />
          <Field
            label="Team status"
            name="active"
            value={m.active ? "yes" : "no"}
            options={[
              { value: "yes", label: "Active" },
              { value: "no", label: "Inactive" },
            ]}
          />
        </div>
        <Field
          label="Incentive arrangement"
          name="incentive"
          value={m.incentive}
        />
      </RecordForm>
    );
  }

  if (type === "commissionCreate")
    return (
      <RecordForm
        onCancel={onClose}
        onSave={(f) => save("commission.create", { ...f, id: uid("COM") })}
      >
        <Field
          label="Application"
          name="applicationId"
          value={applicationId}
          options={data.applications
            .filter(
              (a) => !data.commissions.some((c) => c.applicationId === a.id),
            )
            .map((a) => ({
              value: a.id,
              label:
                data.students.find((s) => s.id === a.studentId)?.name +
                " · " +
                a.course,
            }))}
        />
        <Field
          label="Applicable signed agreement"
          name="agreementId"
          options={data.agreements
            .filter((g) => g.status === "Signed")
            .map((g) => ({
              value: g.id,
              label:
                g.name +
                " · " +
                data.partners.find((p) => p.id === g.universityId)?.name,
            }))}
        />
        <p className="helper">
          Course, intake, currency and effective dates are validated before a
          snapshot is saved.
        </p>
      </RecordForm>
    );
  if (type === "eligible")
    return (
      <RecordForm
        onCancel={onClose}
        onSave={(f) =>
          save("commission.eligible", { id, evidence: f.evidence })
        }
      >
        <Field
          label="Milestone evidence / reference"
          name="evidence"
          type="textarea"
          required
        />
        <p className="helper">
          The matching deposit, visa or enrolment milestone must also exist in
          the student record.
        </p>
      </RecordForm>
    );
  if (type === "invoice")
    return (
      <RecordForm
        onCancel={onClose}
        onSave={(f) => save("commission.invoice", { id, ...f })}
      >
        <Field label="Invoice reference" name="reference" required />
        <div className="form-grid">
          <Field
            label="Issued date"
            name="issued"
            type="date"
            value={today()}
            required
          />
          <Field label="Due date" name="due" type="date" required />
        </div>
      </RecordForm>
    );
  if (type === "payment") {
    const c = data.commissions.find((c) => c.id === id);
    return (
      <RecordForm
        onCancel={onClose}
        onSave={(f) => save("commission.payment", { id, ...f })}
      >
        <p>
          Outstanding: <strong>{money(balance(c) / 100, c.currency)}</strong>
        </p>
        <Field
          label={`Amount (${c.currency})`}
          name="amount"
          type="number"
          min="0.01"
          step="0.01"
          max={balance(c) / 100}
          required
        />
        <Field
          label="Payment date"
          name="date"
          type="date"
          value={today()}
          required
        />
        <Field label="Bank / payment reference" name="reference" required />
      </RecordForm>
    );
  }
  if (type === "adjustment")
    return (
      <RecordForm
        onCancel={onClose}
        onSave={(f) => save("commission.adjust", { id, ...f })}
      >
        <Field
          label="Adjustment direction"
          name="direction"
          options={["Decrease", "Increase"]}
        />
        <Field
          label="Amount (record currency)"
          name="amount"
          type="number"
          min="0.01"
          step="0.01"
          required
        />
        <Field
          label="Reason / clawback explanation"
          name="reason"
          type="textarea"
          required
        />
      </RecordForm>
    );
  return <p>This record is unavailable.</p>;
}
