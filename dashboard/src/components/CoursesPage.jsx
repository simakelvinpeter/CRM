import { useState } from "react";
import { useWorkspace } from "../WorkspaceContext.jsx";
import { Heading, SearchBox, Empty } from "./Forms.jsx";
import { Badge, Panel, money, formatDate } from "./Shared.jsx";

export default function CoursesPage() {
  const { data, open, send, role, notify } = useWorkspace(),
    [query, setQuery] = useState(""),
    [country, setCountry] = useState("All"),
    [qualification, setQualification] = useState("All"),
    [intake, setIntake] = useState("All"),
    [studentId, setStudent] = useState(
      data.students.find((s) => !s.archived)?.id || "",
    ),
    [compare, setCompare] = useState([]),
    [showComparison, setShowComparison] = useState(false),
    [maxTuition, setMax] = useState(""),
    [tuitionCurrency, setCurrency] = useState("GBP"),
    [archived, setArchived] = useState(false);
  const university = (id) => data.partners.find((p) => p.id === id);
  const records = data.courses.filter(
    (c) =>
      (archived || !c.archived) &&
      (c.name + " " + c.subject + " " + university(c.universityId)?.name)
        .toLowerCase()
        .includes(query.toLowerCase()) &&
      (country === "All" || university(c.universityId)?.country === country) &&
      (qualification === "All" || c.level === qualification) &&
      (intake === "All" || c.intake === intake) &&
      (!maxTuition ||
        (c.currency === tuitionCurrency && c.tuition <= Number(maxTuition))),
  );
  const s = data.students.find((s) => s.id === studentId);
  return (
    <>
      <Heading
        title="Course search"
        text="Verified partner courses, considered shortlists, clear comparisons"
      >
        {role === "Agency owner" && (
          <button className="button" onClick={() => open("course")}>
            + Add course
          </button>
        )}
        <select
          aria-label="Shortlist student"
          value={studentId}
          onChange={(e) => setStudent(e.target.value)}
        >
          {data.students
            .filter((s) => !s.archived)
            .map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
        </select>
        <button
          className="button primary"
          disabled={compare.length < 2}
          onClick={() => setShowComparison(!showComparison)}
        >
          {showComparison ? "Hide comparison" : `Compare (${compare.length}/3)`}
        </button>
      </Heading>
      <div className="panel course-filters">
        <SearchBox
          label="Search courses"
          value={query}
          onChange={setQuery}
          placeholder="Search subject, course or university…"
        />
        <div className="filter-grid">
          <select
            aria-label="Course country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          >
            <option value="All">All countries</option>
            {[...new Set(data.partners.map((p) => p.country))].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <select
            aria-label="Qualification"
            value={qualification}
            onChange={(e) => setQualification(e.target.value)}
          >
            <option value="All">All qualifications</option>
            {[...new Set(data.courses.map((c) => c.level))].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <select
            aria-label="Course intake"
            value={intake}
            onChange={(e) => setIntake(e.target.value)}
          >
            <option value="All">All intakes</option>
            {[...new Set(data.courses.map((c) => c.intake))].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <input
            aria-label="Maximum tuition"
            type="number"
            min="0"
            placeholder="Maximum annual tuition"
            value={maxTuition}
            onChange={(e) => setMax(e.target.value)}
          />
          <select
            aria-label="Tuition currency"
            value={tuitionCurrency}
            onChange={(e) => setCurrency(e.target.value)}
          >
            {["GBP", "USD", "EUR", "CAD", "AUD", "KES"].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={archived}
              onChange={(e) => setArchived(e.target.checked)}
            />
            Include archived courses
          </label>
        </div>
      </div>
      {showComparison && (
        <Panel
          title="Course comparison"
          subtitle="Each tuition remains in its original currency"
        >
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Detail</th>
                  {compare.map((id) => (
                    <th key={id}>
                      {data.courses.find((c) => c.id === id)?.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  "University",
                  "Country",
                  "Tuition / year",
                  "Duration",
                  "Intake",
                  "English",
                  "Scholarship",
                ].map((label, i) => (
                  <tr key={label}>
                    <th>{label}</th>
                    {compare.map((id) => {
                      const c = data.courses.find((c) => c.id === id),
                        p = university(c.universityId);
                      return (
                        <td key={id}>
                          {
                            [
                              p.name,
                              p.country,
                              money(c.tuition, c.currency),
                              c.duration,
                              c.intake,
                              c.english,
                              c.scholarship || "Not confirmed",
                            ][i]
                          }
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}
      <p className="results-label">
        {records.length} courses in this view · {s?.name || "Choose a student"}
        ’s shortlist
      </p>
      <div className="course-grid">
        {records.map((c) => {
          const p = university(c.universityId),
            saved = s?.shortlist.includes(c.id);
          return (
            <section className="panel course-card" key={c.id}>
              <div className="course-title">
                <div>
                  <h2>{c.name}</h2>
                  <p>
                    {p.name} · {p.city}, {p.country}
                  </p>
                  <Badge>
                    {c.archived
                      ? "Archived"
                      : c.verified
                        ? "Verified"
                        : "Needs verification"}
                  </Badge>
                </div>
                <label className="toggle-label">
                  <input
                    type="checkbox"
                    checked={compare.includes(c.id)}
                    onChange={() => {
                      if (compare.includes(c.id))
                        setCompare(compare.filter((x) => x !== c.id));
                      else if (compare.length < 3)
                        setCompare([...compare, c.id]);
                      else notify("Compare up to three courses.");
                    }}
                  />
                  Compare
                </label>
              </div>
              <dl className="course-facts">
                {[
                  ["Duration", c.duration],
                  ["Annual tuition", money(c.tuition, c.currency)],
                  ["Intake", c.intake],
                  ["Deadline", formatDate(c.deadline)],
                  ["English", c.english],
                  ["Scholarship", c.scholarship || "Not confirmed"],
                ].map(([k, v]) => (
                  <div key={k}>
                    <dt>{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
              <div className="course-actions">
                <small>
                  {c.source} ·{" "}
                  {c.verified
                    ? "Verified " + formatDate(c.verified)
                    : "Verification needed"}
                </small>
                <div className="heading-actions">
                  <button
                    className="button"
                    onClick={() => open("courseDetail", c.id)}
                  >
                    Details
                  </button>
                  {role === "Agency owner" && (
                    <button
                      className="button"
                      onClick={() => open("course", c.id)}
                    >
                      Edit
                    </button>
                  )}
                  <button
                    className={"button " + (!saved ? "primary" : "")}
                    disabled={!s}
                    onClick={() => {
                      try {
                        send("shortlist.toggle", { studentId, courseId: c.id });
                      } catch (e) {
                        notify(e.message);
                      }
                    }}
                  >
                    {saved ? "Remove from shortlist" : "+ Shortlist"}
                  </button>
                </div>
              </div>
            </section>
          );
        })}
      </div>
      {!records.length && <Empty text="No courses match these filters." />}
    </>
  );
}
