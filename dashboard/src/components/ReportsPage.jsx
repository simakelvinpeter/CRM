import { useState } from "react";
import { useWorkspace } from "../WorkspaceContext.jsx";
import { stages, balance, financeAllowed, today, csv } from "../model.js";
import { Panel, money } from "./Shared.jsx";
import { Heading } from "./Forms.jsx";
import { downloadBlob } from "../files.js";

export default function ReportsPage() {
  const { data, role } = useWorkspace(),
    [intake, setIntake] = useState("All"),
    [country, setCountry] = useState("All");
  const students = data.students.filter(
    (s) =>
      !s.archived &&
      (intake === "All" || s.intake === intake) &&
      (country === "All" || s.country === country),
  );
  const applications = data.applications.filter(
    (a) =>
      students.some((s) => s.id === a.studentId) &&
      (intake === "All" || a.intake === intake),
  );
  const destinations = [...new Set(students.map((s) => s.country))];
  const rows = destinations.map((c) => [
    c,
    students.filter((s) => s.country === c).length,
    applications.filter(
      (a) => data.partners.find((p) => p.id === a.universityId)?.country === c,
    ).length,
    students.filter((s) => s.country === c && s.stage === "Enrolled").length,
  ]);
  return (
    <>
      <Heading
        title="Reports & analytics"
        text="Consistent definitions, drawn from the same CRM records"
      >
        <button
          className="button"
          onClick={() =>
            downloadBlob(
              new Blob(
                [
                  csv([
                    [
                      "Destination",
                      "Students (preferred)",
                      "Applications (university country)",
                      "Confirmed enrolments",
                    ],
                    ...rows,
                  ]),
                ],
                { type: "text/csv" },
              ),
              "agency-report.csv",
            )
          }
        >
          Export CSV
        </button>
      </Heading>
      <div className="heading-actions section-gap">
        <select
          aria-label="Report intake"
          value={intake}
          onChange={(e) => setIntake(e.target.value)}
        >
          <option value="All">All intakes</option>
          {[...new Set(data.students.map((s) => s.intake))].map((i) => (
            <option key={i}>{i}</option>
          ))}
        </select>
        <select
          aria-label="Report country"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
        >
          <option value="All">All preferred destinations</option>
          {[...new Set(data.students.map((s) => s.country))].map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>
      <div className="two-columns">
        <Panel
          title="Current student pipeline"
          subtitle="Distinct students at their current stage; not a historical conversion funnel"
        >
          <div className="journey-bars">
            {stages.map((stage) => {
              const count = students.filter((s) => s.stage === stage).length;
              return (
                <div className="bar-row" key={stage}>
                  <span>{stage}</span>
                  <div className="bar-track">
                    <i
                      style={{
                        width: `${(count / Math.max(students.length, 1)) * 100}%`,
                      }}
                    />
                  </div>
                  <strong>{count}</strong>
                </div>
              );
            })}
          </div>
        </Panel>
        <Panel
          title="Applications by decision"
          subtitle={`${applications.length} applications across ${students.length} students`}
        >
          <div className="journey-bars">
            {[...new Set(applications.map((a) => a.status))].map((status) => {
              const count = applications.filter(
                (a) => a.status === status,
              ).length;
              return (
                <div className="bar-row" key={status}>
                  <span>{status}</span>
                  <div className="bar-track">
                    <i
                      style={{
                        width: `${(count / Math.max(applications.length, 1)) * 100}%`,
                      }}
                    />
                  </div>
                  <strong>{count}</strong>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>
      <Panel
        title="Destination summary"
        subtitle="Students use preferred destination; applications use the university’s country"
      >
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Destination</th>
                <th>Distinct students</th>
                <th>Applications</th>
                <th>Confirmed enrolments</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row[0]}>
                  {row.map((v, i) => (
                    <td key={i}>{v}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
      {financeAllowed(role) && (
        <div className="section-gap">
          <Panel
            title="Commission ageing"
            subtitle="Invoiced and unpaid · filtered student cohort · manual reporting rates"
          >
            <div className="finance-summary four">
              {[
                ["Not due", 0, Infinity],
                ["1–30 days", -30, -1],
                ["31–60 days", -60, -31],
                ["61+ days", -Infinity, -61],
              ].map(([label, min, max]) => {
                const amount = data.commissions
                  .filter(
                    (c) =>
                      c.invoice && students.some((s) => s.id === c.studentId),
                  )
                  .filter((c) => {
                    const days = Math.round(
                      (Date.parse(c.invoice.due) - Date.parse(today())) /
                        86400000,
                    );
                    return days >= min && days <= max;
                  })
                  .reduce(
                    (sum, c) =>
                      sum +
                      ((balance(c) / 100) * data.settings.rates[c.currency]) /
                        data.settings.rates[data.settings.currency],
                    0,
                  );
                return (
                  <div className="metric-card" key={label}>
                    <div>{label}</div>
                    <strong>{money(amount, data.settings.currency)}</strong>
                  </div>
                );
              })}
            </div>
          </Panel>
        </div>
      )}
    </>
  );
}
