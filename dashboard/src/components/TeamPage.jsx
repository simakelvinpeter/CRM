import { useWorkspace } from "../WorkspaceContext.jsx";
import { Heading } from "./Forms.jsx";
import { money, initials, Badge } from "./Shared.jsx";
import { financeAllowed } from "../model.js";

export default function TeamPage() {
  const { data, role, open } = useWorkspace();
  return (
    <>
      <Heading
        title="Team management"
        text="Assignments, workload and compensation"
      >
        {role === "Agency owner" && (
          <button className="button primary" onClick={() => open("team")}>
            + Add team member
          </button>
        )}
      </Heading>
      <div className="team-grid">
        {data.team.map((t) => (
          <section className="panel team-card" key={t.id}>
            <div className="person">
              <span className="avatar">{initials(t.name)}</span>
              <div>
                <h2>{t.name}</h2>
                <p>{t.role}</p>
              </div>
            </div>
            <div className="section-gap">
              <Badge>{t.active ? "Active" : "Inactive"}</Badge>
            </div>
            <div className="team-stat">
              <span>Assigned students</span>
              <strong>
                {
                  data.students.filter(
                    (s) =>
                      s.counsellor === t.name &&
                      !s.archived &&
                      s.stage !== "Enrolled",
                  ).length
                }
              </strong>
            </div>
            <p className="muted">
              {data.tasks.filter((x) => x.owner === t.name && !x.done).length}{" "}
              open tasks ·{" "}
              {
                data.students.filter(
                  (s) => s.counsellor === t.name && s.stage === "Enrolled",
                ).length
              }{" "}
              enrolled
            </p>
            {financeAllowed(role) && (
              <div className="compensation">
                <small>Base salary · {t.payPeriod}</small>
                <strong>{money(t.salary, t.currency)}</strong>
                <p>{t.incentive || "No incentive recorded"}</p>
              </div>
            )}
            {role === "Agency owner" && (
              <button
                className="button section-gap"
                onClick={() => open("team", t.id)}
              >
                Edit member
              </button>
            )}
          </section>
        ))}
      </div>
    </>
  );
}
