import { useState } from "react";
import { useWorkspace } from "../WorkspaceContext.jsx";
import { Heading, SearchBox, Empty } from "./Forms.jsx";
import { Panel, Badge, formatDate } from "./Shared.jsx";
import { downloadFile } from "../files.js";

export default function PartnersPage({ initialId = null }) {
  const { data, open, role, notify } = useWorkspace(),
    [query, setQuery] = useState(""),
    [country, setCountry] = useState("All"),
    [selected, setSelected] = useState(initialId);
  const records = data.partners.filter(
    (p) =>
      (p.name + " " + p.country).toLowerCase().includes(query.toLowerCase()) &&
      (country === "All" || p.country === country),
  );
  const p = data.partners.find((p) => p.id === selected);
  if (p)
    return (
      <>
        <button className="back-link" onClick={() => setSelected(null)}>
          ← University partners
        </button>
        <Heading title={p.name} text={`${p.country} · ${p.city} · ${p.type}`}>
          {role === "Agency owner" && (
            <button className="button" onClick={() => open("partner", p.id)}>
              Edit university
            </button>
          )}
        </Heading>
        <div className="two-columns">
          <Panel title="Admissions contact">
            <dl className="detail-grid">
              <div>
                <dt>Contact</dt>
                <dd>{p.contact || "Not recorded"}</dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>{p.email}</dd>
              </div>
            </dl>
            <p className="body-copy">{p.notes}</p>
          </Panel>
          <Panel title="Partner activity">
            <div className="body-copy">
              <p>
                {
                  data.applications.filter((a) => a.universityId === p.id)
                    .length
                }{" "}
                applications ·{" "}
                {
                  new Set(
                    data.applications
                      .filter((a) => a.universityId === p.id)
                      .map((a) => a.studentId),
                  ).size
                }{" "}
                distinct students
              </p>
              <p>
                {
                  data.courses.filter(
                    (c) => c.universityId === p.id && !c.archived,
                  ).length
                }{" "}
                active courses
              </p>
            </div>
          </Panel>
        </div>
        <Panel
          title="Agreement versions"
          subtitle="Signed contracts, renewal dates and commission terms"
          action={
            role === "Agency owner" && (
              <button
                className="button primary"
                onClick={() => open("agreement", null, { partnerId: p.id })}
              >
                + New agreement version
              </button>
            )
          }
        >
          <div className="application-cards">
            {data.agreements
              .filter((g) => g.universityId === p.id)
              .map((g) => (
                <section className="application-card" key={g.id}>
                  <div className="heading-actions">
                    <h3 className="grow">{g.name}</h3>
                    <Badge>{g.status}</Badge>
                    {role === "Agency owner" && (
                      <button
                        className="button"
                        onClick={() => open("agreement", g.id)}
                      >
                        Edit version
                      </button>
                    )}
                  </div>
                  <dl className="detail-grid">
                    {[
                      [
                        "Effective dates",
                        formatDate(g.start) + " – " + formatDate(g.end),
                      ],
                      [
                        "Commission",
                        g.kind === "Percentage"
                          ? g.rate + "% of " + g.basis
                          : g.currency + " " + g.rate + " fixed",
                      ],
                      ["Eligibility", g.milestone],
                      ["Payment terms", g.paymentDays + " days"],
                      ["Renewal reminder", formatDate(g.renewal)],
                      [
                        "Scope",
                        g.intakes.length ? g.intakes.join(", ") : "All intakes",
                      ],
                    ].map(([k, v]) => (
                      <div key={k}>
                        <dt>{k}</dt>
                        <dd>{v}</dd>
                      </div>
                    ))}
                  </dl>
                  <p>{g.terms}</p>
                  {g.fileId && (
                    <button
                      className="text-button section-gap"
                      onClick={() =>
                        downloadFile(g.fileId).catch((e) => notify(e.message))
                      }
                    >
                      Download {g.fileName || "signed agreement"}
                    </button>
                  )}
                </section>
              ))}
            {!data.agreements.some((g) => g.universityId === p.id) && (
              <Empty text="No agreement versions recorded." />
            )}
          </div>
        </Panel>
      </>
    );
  return (
    <>
      <Heading
        title="University partners"
        text="Relationships, contracts, and commission terms in one place"
      >
        {role === "Agency owner" && (
          <button className="button primary" onClick={() => open("partner")}>
            + Add university
          </button>
        )}
      </Heading>
      <Panel
        title="Partner directory"
        action={
          <div className="heading-actions">
            <SearchBox
              label="Search university partners"
              value={query}
              onChange={setQuery}
            />
            <select
              aria-label="Partner country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            >
              <option>All</option>
              {[...new Set(data.partners.map((p) => p.country))].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
        }
      >
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>University</th>
                <th>Country</th>
                <th>Partnership</th>
                <th>Latest contract</th>
                <th>Applications</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {records.map((p) => {
                const g = data.agreements
                  .filter((g) => g.universityId === p.id)
                  .sort((a, b) => b.start.localeCompare(a.start))[0];
                return (
                  <tr key={p.id}>
                    <td>
                      <strong>{p.name}</strong>
                    </td>
                    <td>{p.country}</td>
                    <td>{p.type}</td>
                    <td>
                      <Badge>{g?.status || "No contract"}</Badge>
                    </td>
                    <td>
                      {
                        data.applications.filter((a) => a.universityId === p.id)
                          .length
                      }
                    </td>
                    <td>
                      <button
                        className="text-button"
                        onClick={() => setSelected(p.id)}
                      >
                        Open partner
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {!records.length && <Empty />}
      </Panel>
    </>
  );
}
