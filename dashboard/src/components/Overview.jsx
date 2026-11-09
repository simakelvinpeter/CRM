import {
  ArrowRight,
  FileText,
  GraduationCap,
  Plane,
  Users,
  Wallet,
  Clock,
} from "lucide-react";
import { partners as initialPartners } from "../data.js";
import { balance } from "../model.js";
import { money } from "./Shared.jsx";
import { Badge, Panel, formatDate } from "./Shared.jsx";
import ApplicationTable from "./ApplicationTable.jsx";

export default function Overview({
  students,
  applications,
  tasks,
  onNavigate,
  onStudent,
  onApplication,
  onToggleTask,
  onAddStudent,
  partnerRecords = initialPartners,
  commissionRecords = null,
  settings,
  readOnly = false,
}) {
  const partners = partnerRecords;
  // filter creates a new array containing only the matching records.
  const pending = applications.filter((item) =>
    ["Submitted", "Under review"].includes(item.status),
  );
  const offers = applications.filter((item) => item.status.includes("offer"));
  const openTasks = tasks.filter((task) => !task.done);
  const destinations = [...new Set(students.map((student) => student.country))];
  const colors = ["#0b5d4b", "#527b96", "#9b7a52", "#89758d", "#9ca9ae"];

  // Each number comes from our demo records, rather than a made-up total.
  const metrics = [
    {
      label: "Active students",
      value: students.filter((s) => s.stage !== "Enrolled").length,
      note: "Across your agency",
      icon: Users,
      page: "Students",
    },
    {
      label: "Awaiting decisions",
      value: pending.length,
      note: "Applications in review",
      icon: FileText,
      page: "Applications",
    },
    {
      label: "Offers received",
      value: offers.length,
      note: "Conditional & unconditional",
      icon: GraduationCap,
      page: "Applications",
    },
    {
      label: "Visa in progress",
      value: students.filter((s) => s.stage === "Visa").length,
      note: "Preparing their next chapter",
      icon: Plane,
      page: "Students",
    },
    {
      label: "Open tasks",
      value: openTasks.length,
      note: "Your team’s next steps",
      icon: Clock,
      page: "Tasks & Calendar",
    },
    {
      label: commissionRecords
        ? "Outstanding commissions"
        : "University partners",
      value: commissionRecords
        ? money(
            commissionRecords
              .filter((c) => c.invoice)
              .reduce(
                (sum, c) =>
                  sum +
                  ((balance(c) / 100) * settings.rates[c.currency]) /
                    settings.rates[settings.currency],
                0,
              ),
            settings.currency,
          )
        : partners.length,
      note: commissionRecords
        ? "Invoiced balance · reporting currency"
        : "In your partner directory",
      icon: Wallet,
      page: commissionRecords ? "Commissions" : "University Partners",
    },
  ];

  // Build the donut from destination counts. The percentages must total 100.
  let position = 0;
  const segments = destinations.map((country, index) => {
    const count = students.filter(
      (student) => student.country === country,
    ).length;
    const start = position;
    position += (count / students.length) * 100;
    return `${colors[index % colors.length]} ${start}% ${position}%`;
  });

  return (
    <>
      <div className="page-heading">
        <div>
          <h1>Overview</h1>
          <p>Here’s what’s happening across your agency today.</p>
        </div>
        <div className="heading-actions">
          <span className="snapshot">All active intakes</span>
          {!readOnly && (
            <button className="button primary" onClick={onAddStudent}>
              + Add student
            </button>
          )}
        </div>
      </div>

      <div className="metrics-grid">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <button
              className="metric-card"
              key={metric.label}
              onClick={() => onNavigate(metric.page)}
            >
              <div>
                <span>{metric.label}</span>
                <Icon size={17} />
              </div>
              <strong>{metric.value}</strong>
              <small>{metric.note}</small>
            </button>
          );
        })}
      </div>

      <Panel
        title="Needs attention"
        subtitle="A timely follow-up can make all the difference."
        action={
          <button
            className="text-button"
            onClick={() => onNavigate("Students")}
          >
            View students <ArrowRight size={15} />
          </button>
        }
      >
        <div className="priority-list">
          {students.slice(0, 3).map((student, index) => (
            <button
              className="priority-row"
              key={student.id}
              onClick={() => onStudent(student)}
            >
              <span className={`priority-icon tone-${index}`}>
                <FileText size={20} />
              </span>
              <div className="priority-copy">
                <Badge>
                  {student.stage === "Visa"
                    ? "Visa preparation"
                    : student.stage === "Offer"
                      ? "Offer received"
                      : "Next action"}
                </Badge>
                <strong>{student.name}</strong>
                <p>{student.nextAction}</p>
              </div>
              <span className="text-button">
                Open profile <ArrowRight size={15} />
              </span>
            </button>
          ))}
        </div>
      </Panel>

      <div className="two-columns">
        <Panel
          title="Student journey"
          subtitle="Distinct students by their current stage"
        >
          <div className="journey-bars">
            {["Counselling", "Applying", "Offer", "Visa", "Pre-departure"].map(
              (stage, index) => {
                const count = students.filter(
                  (student) => student.stage === stage,
                ).length;
                return (
                  <div className="bar-row" key={stage}>
                    <span>{stage}</span>
                    <div className="bar-track">
                      <i
                        style={{
                          width: `${(count / Math.max(students.length, 1)) * 100}%`,
                          background: colors[index],
                        }}
                      />
                    </div>
                    <strong>{count}</strong>
                  </div>
                );
              },
            )}
          </div>
        </Panel>
        <Panel
          title="Students by destination"
          subtitle="Primary preferred study destination"
        >
          <div className="destination-chart">
            <div
              className="donut"
              style={{
                background: segments.length
                  ? `conic-gradient(${segments.join(",")})`
                  : "#e2e6e3",
              }}
              role="img"
              aria-label="Student counts by preferred destination; details in adjacent legend"
            >
              <div>
                <strong>{students.length}</strong>
                <small>students</small>
              </div>
            </div>
            <div className="chart-legend">
              {destinations.map((country, index) => (
                <div key={country}>
                  <i style={{ background: colors[index % colors.length] }} />
                  <span>{country}</span>
                  <strong>
                    {students.filter((s) => s.country === country).length}
                  </strong>
                </div>
              ))}
            </div>
          </div>
        </Panel>
      </div>

      <div className="two-columns">
        <Panel
          title="Students by university"
          subtitle="Distinct students with active applications"
        >
          <div className="university-bars">
            {partners.map((partner, index) => {
              const studentCount = new Set(
                applications
                  .filter(
                    (a) =>
                      a.universityId === partner.id &&
                      !["Rejected", "Withdrawn"].includes(a.status),
                  )
                  .map((a) => a.studentId),
              ).size;
              return (
                <div className="bar-row" key={partner.id}>
                  <span>{partner.name}</span>
                  <div className="bar-track">
                    <i
                      style={{
                        width: `${(studentCount / Math.max(students.length, 1)) * 100}%`,
                        background: colors[index],
                      }}
                    />
                  </div>
                  <strong>{studentCount}</strong>
                </div>
              );
            })}
          </div>
        </Panel>
        <Panel
          title="Upcoming tasks"
          subtitle={`${openTasks.length} open tasks across your team`}
          action={
            <button
              className="text-button"
              onClick={() => onNavigate("Tasks & Calendar")}
            >
              View all <ArrowRight size={15} />
            </button>
          }
        >
          <div className="task-list">
            {openTasks.slice(0, 3).map((task) => (
              <label className="task-row" key={task.id}>
                <input
                  type="checkbox"
                  disabled={readOnly}
                  checked={task.done}
                  onChange={() => onToggleTask(task.id)}
                />
                <span>
                  <strong>{task.title}</strong>
                  <small>
                    {formatDate(task.date)} · {task.time}
                  </small>
                </span>
              </label>
            ))}
          </div>
        </Panel>
      </div>

      <Panel
        title="Recent applications"
        subtitle="Latest movement across your agency"
        action={
          <button
            className="text-button"
            onClick={() => onNavigate("Applications")}
          >
            View all applications <ArrowRight size={15} />
          </button>
        }
      >
        <ApplicationTable
          universities={partners}
          applications={applications.slice(0, 4)}
          students={students}
          onSelect={onApplication}
        />
      </Panel>
    </>
  );
}
