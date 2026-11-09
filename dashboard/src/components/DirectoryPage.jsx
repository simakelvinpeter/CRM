import { Building2, ShieldCheck } from "lucide-react";
import { partners, team, journeyStages } from "../data.js";
import { Badge, Panel, initials } from "./Shared.jsx";

// These read-only screens establish the layout for our next lessons.
export default function DirectoryPage({ page, students, onPartner }) {
  if (page === "University Partners" || page === "Commissions") {
    return (
      <>
        <div className="page-heading">
          <div>
            <h1>{page}</h1>
            <p>
              {page === "Commissions"
                ? "Partner commission terms, before we build invoicing and payments."
                : "Your university relationships, in one place."}
            </p>
          </div>
        </div>
        {page === "Commissions" && (
          <div className="notice">
            <ShieldCheck size={18} />
            This first lesson shows agreement terms. Commission entitlements,
            invoices, and payments come in a later lesson.
          </div>
        )}
        <Panel
          title={
            page === "Commissions"
              ? "Commission agreements"
              : "Partner directory"
          }
          subtitle="Fictional university records for this learning build"
        >
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>University</th>
                  <th>Country</th>
                  <th>Contract</th>
                  <th>Commission terms</th>
                  <th>Agreement expiry</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {partners.map((partner) => (
                  <tr key={partner.id}>
                    <td>
                      <div className="person">
                        <Building2 size={19} />
                        <strong>{partner.name}</strong>
                      </div>
                    </td>
                    <td>{partner.country}</td>
                    <td>
                      <Badge>{partner.contract}</Badge>
                    </td>
                    <td>{partner.commission}</td>
                    <td>{partner.expiry}</td>
                    <td>
                      <button
                        className="text-button"
                        onClick={() => onPartner(partner)}
                      >
                        View agreement
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </>
    );
  }

  if (page === "Team") {
    return (
      <>
        <div className="page-heading">
          <div>
            <h1>Team</h1>
            <p>The people behind every successful student journey.</p>
          </div>
        </div>
        <div className="team-grid">
          {team.map((member) => (
            <section className="panel team-card" key={member.name}>
              <div className="person">
                <span className="avatar">{initials(member.name)}</span>
                <div>
                  <h2>{member.name}</h2>
                  <p>{member.role}</p>
                </div>
              </div>
              <div className="team-stat">
                <span>Assigned students</span>
                <strong>
                  {
                    students.filter(
                      (student) => student.counsellor === member.name,
                    ).length
                  }
                </strong>
              </div>
              <p className="muted">
                Compensation will be added with authenticated owner and finance
                permissions.
              </p>
            </section>
          ))}
        </div>
      </>
    );
  }

  if (page === "Reports") {
    return (
      <>
        <div className="page-heading">
          <div>
            <h1>Reports</h1>
            <p>Current student counts, calculated from your records.</p>
          </div>
        </div>
        <Panel
          title="Current pipeline"
          subtitle="Current stages — this is not a historical conversion funnel"
        >
          <div className="journey-bars">
            {journeyStages.map((stage) => (
              <div className="bar-row" key={stage}>
                <span>{stage}</span>
                <div className="bar-track">
                  <i
                    style={{
                      width: `${(students.filter((student) => student.stage === stage).length / Math.max(students.length, 1)) * 100}%`,
                    }}
                  />
                </div>
                <strong>
                  {students.filter((student) => student.stage === stage).length}
                </strong>
              </div>
            ))}
          </div>
        </Panel>
      </>
    );
  }

  if (page === "Course Search") {
    return (
      <>
        <div className="page-heading">
          <div>
            <h1>Course search</h1>
            <p>Your partner catalogue starts here.</p>
          </div>
        </div>
        <Panel
          title="Catalogue setup"
          subtitle="Next lesson: verified course records, filters, and student shortlists"
        >
          <div className="body-copy">
            <p>
              We will connect courses to university IDs, just as applications
              connect to student IDs.
            </p>
            <p className="muted">
              Each course needs tuition and currency, duration, intake, entry
              requirements, source, and a last-verified date.
            </p>
          </div>
        </Panel>
      </>
    );
  }

  return (
    <>
      <div className="page-heading">
        <div>
          <h1>{page === "Help" ? "About this learning build" : "Settings"}</h1>
          <p>A simple foundation we can understand and extend together.</p>
        </div>
      </div>
      <Panel
        title={page === "Help" ? "What works today" : "Workspace foundations"}
      >
        <div className="body-copy">
          <p>
            Navigate the CRM, search students, add a student, inspect their
            applications, update application statuses, and complete tasks.
          </p>
          <p>
            Records save in this browser. All starting records are fictional.
            Sign-in, database storage, salary access controls, document uploads,
            and invoice processing are not connected yet.
          </p>
          <p className="muted">
            The tutorial in docs/LESSON-01.md explains the files and core
            concepts. Your collaborator’s landing page remains in the repository
            root.
          </p>
        </div>
      </Panel>
    </>
  );
}
