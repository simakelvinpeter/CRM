import { ChevronRight } from "lucide-react";
import { partners as initialPartners } from "../data.js";
import { Badge, formatDate, initials } from "./Shared.jsx";

export default function ApplicationTable({
  applications,
  students,
  onSelect,
  universities = initialPartners,
}) {
  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            <th>Student</th>
            <th>University & course</th>
            <th>Status</th>
            <th>Counsellor</th>
            <th>Next deadline</th>
            <th>
              <span className="sr-only">Details</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {applications.map((application) => {
            const student = students.find(
              (item) => item.id === application.studentId,
            );
            const university = universities.find(
              (item) => item.id === application.universityId,
            );
            return (
              <tr key={application.id}>
                <td>
                  <div className="person">
                    <span className="avatar small">
                      {initials(student.name)}
                    </span>
                    <strong>{student.name}</strong>
                  </div>
                </td>
                <td>
                  <strong>{university.name}</strong>
                  <small>{application.course}</small>
                </td>
                <td>
                  <Badge>{application.status}</Badge>
                </td>
                <td>{student.counsellor}</td>
                <td>{formatDate(application.deadline)}</td>
                <td>
                  <button
                    className="icon-button"
                    aria-label={`Open ${student.name} ${application.course}`}
                    onClick={() => onSelect(application)}
                  >
                    <ChevronRight size={17} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {!applications.length && (
        <p className="empty-state">No applications match this search.</p>
      )}
    </div>
  );
}
