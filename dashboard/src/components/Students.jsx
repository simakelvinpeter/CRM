import { Search, ChevronRight } from "lucide-react";
import { stages as journeyStages } from "../model.js";
import { Badge, initials } from "./Shared.jsx";

export default function Students({
  students,
  applications,
  query,
  onQueryChange,
  stage,
  onStageChange,
  onSelect,
  onAdd,
  readOnly = false,
}) {
  const filteredStudents = students.filter((student) => {
    const matchesSearch = `${student.name} ${student.email} ${student.id}`
      .toLowerCase()
      .includes(query.toLowerCase());
    const matchesStage = stage === "All stages" || student.stage === stage;
    return matchesSearch && matchesStage;
  });

  return (
    <>
      <div className="page-heading">
        <div>
          <h1>Students</h1>
          <p>Manage every student from first enquiry through enrolment.</p>
        </div>
        {!readOnly && (
          <button className="button primary" onClick={onAdd}>
            + Add student
          </button>
        )}
      </div>
      <div className="panel">
        <div className="table-toolbar">
          <label className="search-field">
            <Search size={17} />
            <input
              aria-label="Filter students"
              placeholder="Search name, email or student ID"
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
            />
          </label>
          <select
            aria-label="Journey stage"
            value={stage}
            onChange={(event) => onStageChange(event.target.value)}
          >
            <option>All stages</option>
            {journeyStages.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Journey stage</th>
                <th>Destination</th>
                <th>Intake</th>
                <th>Counsellor</th>
                <th>Applications</th>
                <th>Next action</th>
                <th>
                  <span className="sr-only">Details</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student.id}>
                  <td>
                    <div className="person">
                      <span className="avatar small">
                        {initials(student.name)}
                      </span>
                      <div>
                        <strong>{student.name}</strong>
                        <small>{student.id}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <Badge>{student.stage}</Badge>
                  </td>
                  <td>{student.country}</td>
                  <td>{student.intake}</td>
                  <td>{student.counsellor}</td>
                  <td>
                    {
                      applications.filter(
                        (a) =>
                          a.studentId === student.id &&
                          !["Rejected", "Withdrawn"].includes(a.status),
                      ).length
                    }
                  </td>
                  <td>{student.nextAction}</td>
                  <td>
                    <button
                      className="icon-button"
                      aria-label={`Open ${student.name}`}
                      onClick={() => onSelect(student)}
                    >
                      <ChevronRight size={17} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!filteredStudents.length && (
          <p className="empty-state">No students match these filters.</p>
        )}
        <div className="table-footer">
          Showing {filteredStudents.length} of {students.length} students
          <span>All records loaded</span>
        </div>
      </div>
    </>
  );
}
