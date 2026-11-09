import { useCallback, useState } from "react";
import useCrm from "./useCrm.js";
import { WorkspaceContext } from "./WorkspaceContext.jsx";
import {
  financeAllowed,
  statuses,
  csv,
  today,
  validateState,
} from "./model.js";
import { downloadBlob, restoreAttachments } from "./files.js";
import Sidebar from "./components/Sidebar.jsx";
import Header from "./components/Header.jsx";
import Overview from "./components/Overview.jsx";
import Students from "./components/Students.jsx";
import ApplicationTable from "./components/ApplicationTable.jsx";
import StudentProfile from "./components/StudentProfile.jsx";
import PartnersPage from "./components/PartnersPage.jsx";
import CoursesPage from "./components/CoursesPage.jsx";
import FinancePage from "./components/FinancePage.jsx";
import TeamPage from "./components/TeamPage.jsx";
import ReportsPage from "./components/ReportsPage.jsx";
import SettingsPage from "./components/SettingsPage.jsx";
import CrmDialogs from "./components/CrmDialogs.jsx";
import TasksPage from "./components/TasksPage.jsx";
import { Modal, Panel, Badge, formatDate } from "./components/Shared.jsx";
import { Heading, SearchBox, Empty } from "./components/Forms.jsx";

import LoginPage from "./components/LoginPage.jsx";

// The demo session lives only in React memory. Refreshing signs out.
export default function App() {
  const [account, setAccount] = useState(null);
  if (!account) return <LoginPage onSignIn={setAccount} />;
  return (
    <Workspace
      key={account.email}
      account={account}
      onSignOut={() => setAccount(null)}
    />
  );
}

function Workspace({ account, onSignOut }) {
  const store = useCrm(),
    { data } = store;
  const [page, setPage] = useState("Overview"),
    [studentId, setStudentId] = useState(null),
    [role] = useState(account.role),
    [dialog, setDialog] = useState(null),
    [menuOpen, setMenuOpen] = useState(false),
    [query, setQuery] = useState(""),
    [stage, setStage] = useState("All stages"),
    [status, setStatus] = useState("All statuses"),
    [showArchived, setArchived] = useState(false),
    [toast, setToast] = useState(""),
    [appView, setAppView] = useState("Table"),
    [partnerSelection, setPartnerSelection] = useState(null);
  const closeDialog = useCallback(() => setDialog(null), []);
  const actorName =
    role === "Agency owner"
      ? data?.settings.adminName || "Administrator"
      : account.name;
  function notify(text) {
    setToast(text);
  }
  function send(type, payload) {
    return store.dispatch({ type, payload }, { role, name: actorName });
  }
  function open(type, id = null, extra = {}) {
    setDialog({ type, id, ...extra });
  }
  function navigate(next) {
    if (next === "Commissions" && !financeAllowed(role)) {
      notify("Finance access is hidden for this role preview.");
      return;
    }
    if (next === "Settings" && role !== "Agency owner") {
      notify("Settings are available to the owner preview.");
      return;
    }
    setPage(next);
    setStudentId(null);
    setPartnerSelection(null);
    setQuery("");
    setStage("All stages");
    setStatus("All statuses");
    setMenuOpen(false);
    setArchived(false);
  }
  function openStudent(s) {
    setPage("Students");
    setStudentId(s.id);
    setDialog(null);
    setMenuOpen(false);
  }
  function toggleTask(id) {
    try {
      send("task.toggle", { id });
    } catch (error) {
      notify(error.message);
    }
  }
  if (!data)
    return (
      <div className="recovery-screen">
        <h1>Saved workspace needs attention</h1>
        <p>{store.error}</p>
        <p>
          Your existing browser data has not been changed. Restore a complete
          backup below.
        </p>
        <input
          aria-label="Restore backup"
          type="file"
          accept=".json"
          onChange={async (e) => {
            try {
              const b = JSON.parse(await e.target.files[0].text());
              if (b.format !== "study-go-backup")
                throw Error("Invalid backup format.");
              validateState(b.data);
              await restoreAttachments(b);
              store.restore(b.data);
            } catch (error) {
              notify(error.message);
            }
          }}
        />
        {toast && <p role="alert">{toast}</p>}
      </div>
    );

  const visibleStudents = data.students.filter(
    (s) => role !== "Referral agent" || s.counsellor === actorName,
  );
  const activeStudents = visibleStudents.filter((s) => !s.archived);
  const visibleApplications = data.applications.filter((a) =>
    visibleStudents.some((s) => s.id === a.studentId),
  );
  const visibleTasks = data.tasks.filter(
    (t) =>
      role !== "Referral agent" ||
      visibleStudents.some((s) => s.id === t.studentId),
  );
  const snapshot = {
    ...data,
    students: visibleStudents,
    applications: visibleApplications,
    tasks: visibleTasks,
  };
  function exportStudents() {
    downloadBlob(
      new Blob(
        [
          csv([
            ["ID", "Name", "Email", "Country", "Intake", "Stage", "Counsellor"],
            ...visibleStudents.map((s) => [
              s.id,
              s.name,
              s.email,
              s.country,
              s.intake,
              s.stage,
              s.counsellor,
            ]),
          ]),
        ],
        { type: "text/csv;charset=utf-8" },
      ),
      "students.csv",
    );
  }
  const appRows = visibleApplications.filter((a) => {
    const s = data.students.find((s) => s.id === a.studentId),
      p = data.partners.find((p) => p.id === a.universityId);
    return (
      (s.name + " " + a.course + " " + p?.name + " " + a.id)
        .toLowerCase()
        .includes(query.toLowerCase()) &&
      (status === "All statuses" || a.status === status)
    );
  });
  function renderPage() {
    if (page === "Overview")
      return (
        <Overview
          students={activeStudents}
          applications={visibleApplications.filter((a) =>
            activeStudents.some((s) => s.id === a.studentId),
          )}
          tasks={visibleTasks}
          partnerRecords={data.partners}
          commissionRecords={financeAllowed(role) ? data.commissions : null}
          settings={data.settings}
          onNavigate={navigate}
          onStudent={openStudent}
          onApplication={(a) => open("application", a.id)}
          onToggleTask={toggleTask}
          readOnly={role === "Referral agent"}
          onAddStudent={() => open("student")}
        />
      );
    if (page === "Students")
      return studentId ? (
        <StudentProfile
          key={studentId}
          id={studentId}
          onBack={() => setStudentId(null)}
        />
      ) : (
        <>
          <div className="list-actions">
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={showArchived}
                onChange={(e) => setArchived(e.target.checked)}
              />
              Include archived students
            </label>
            <button className="button" onClick={exportStudents}>
              Export CSV
            </button>
          </div>
          <Students
            students={visibleStudents.filter(
              (s) => showArchived || !s.archived,
            )}
            applications={visibleApplications}
            query={query}
            onQueryChange={setQuery}
            stage={stage}
            onStageChange={setStage}
            onSelect={openStudent}
            onAdd={() => open("student")}
            readOnly={role === "Referral agent"}
          />
        </>
      );
    if (page === "Applications")
      return (
        <>
          <Heading
            title="Applications"
            text="Track each university decision independently"
          >
            {role !== "Referral agent" && (
              <button
                className="button primary"
                onClick={() => open("application")}
              >
                + Add application
              </button>
            )}
          </Heading>
          <div className="panel">
            <div className="table-toolbar">
              <SearchBox
                label="Filter applications"
                value={query}
                onChange={setQuery}
                placeholder="Search student, university, course or reference"
              />
              <select
                aria-label="Application status filter"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option>All statuses</option>
                {statuses.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
              <div className="segmented">
                {["Table", "Board"].map((v) => (
                  <button
                    key={v}
                    className={appView === v ? "selected" : ""}
                    onClick={() => setAppView(v)}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
            {appView === "Table" ? (
              <ApplicationTable
                students={visibleStudents}
                applications={appRows}
                universities={data.partners}
                onSelect={(a) => open("application", a.id)}
              />
            ) : (
              <div className="kanban">
                {statuses.map((status) => (
                  <section key={status}>
                    <h3>
                      {status}{" "}
                      <small>
                        {appRows.filter((a) => a.status === status).length}
                      </small>
                    </h3>
                    {appRows
                      .filter((a) => a.status === status)
                      .map((a) => (
                        <button
                          className="kanban-card"
                          key={a.id}
                          onClick={() => open("application", a.id)}
                        >
                          <strong>
                            {
                              data.students.find((s) => s.id === a.studentId)
                                ?.name
                            }
                          </strong>
                          <p>{a.course}</p>
                          <small>
                            {
                              data.partners.find((p) => p.id === a.universityId)
                                ?.name
                            }
                          </small>
                        </button>
                      ))}
                  </section>
                ))}
              </div>
            )}
          </div>
        </>
      );
    if (page === "University Partners")
      return (
        <PartnersPage
          initialId={partnerSelection}
          key={partnerSelection || "partners"}
        />
      );
    if (page === "Course Search") return <CoursesPage />;
    if (page === "Commissions")
      return financeAllowed(role) ? (
        <FinancePage />
      ) : (
        <Empty text="Finance access is hidden." />
      );
    if (page === "Team") return <TeamPage />;
    if (page === "Reports") return <ReportsPage />;
    if (page === "Tasks & Calendar") return <TasksPage />;
    if (page === "Settings") return <SettingsPage />;
    return (
      <>
        <Heading
          title="Your agency workspace"
          text="Students, partnerships and commissions, connected"
        />
        <Panel title="About this local CRM">
          <div className="body-copy">
            <p>
              Manage students through enquiry, applications, visas, travel,
              arrival and enrolment. Maintain partner agreements, course
              shortlists, tasks, salaries and commission payments.
            </p>
            <p>
              Records and attachments are saved on this browser and computer.
              Export complete backups from Settings. Demo sign-in demonstrates
              visibility; production multi-user authentication, server
              permissions, shared database storage and email delivery are not
              connected.
            </p>
            <p>
              The original lesson remains in docs/LESSON-01.md. The workflow
              guide and testing report describe the current implementation.
            </p>
          </div>
        </Panel>
      </>
    );
  }
  const dialogTitles = {
    student: "Student profile",
    application: "University application",
    partner: "University partner",
    agreement: "Agreement version",
    course: "Course catalogue record",
    courseDetail: "Course details",
    note: "Add counsellor note",
    document: "Document review",
    visa: "Visa & travel case",
    task: "Task / appointment",
    team: "Team member",
    commissionCreate: "Create expected commission",
    eligible: "Verify commission eligibility",
    invoice: "Record invoice",
    payment: "Record payment",
    adjustment: "Commission adjustment",
    search: "Search workspace",
    notifications: "Notifications",
  };
  return (
    <WorkspaceContext.Provider
      value={{
        data: snapshot,
        role,
        actor: { role, name: actorName },
        send,
        open,
        notify,
        restore: store.restore,
      }}
    >
      <div className={`app-shell ${menuOpen ? "menu-open" : ""}`}>
        {menuOpen && (
          <button
            className="menu-scrim"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
          />
        )}
        <Sidebar
          activePage={page}
          onNavigate={navigate}
          role={role}
          actorName={actorName}
          agency={data.settings.agency}
        />
        <div className="workspace">
          <Header
            onAddStudent={() => open("student")}
            onMenu={() => setMenuOpen(!menuOpen)}
            onNotifications={() => open("notifications")}
            onSearch={(value) => open("search", null, { search: value })}
            readOnly={role === "Referral agent"}
            actorName={actorName}
          />
          <div className="preview-banner">
            <span>LOCAL WORKSPACE · data stays in this browser</span>
            <div className="session-controls">
              <span>{role}</span>
              <button type="button" className="button" onClick={onSignOut}>
                Sign out
              </button>
            </div>
          </div>
          <main>
            {renderPage()}
            <footer className="workspace-footer">
              <span>{data.settings.agency.toUpperCase()}</span>
              <span>Local records & attachments · export complete backups</span>
            </footer>
          </main>
        </div>
        {dialog && (
          <Modal
            title={dialogTitles[dialog.type] || "Record details"}
            onClose={closeDialog}
          >
            {dialog.type === "search" ? (
              <WorkspaceSearch
                initial={dialog.search || ""}
                onStudent={openStudent}
                onApplication={(id) => open("application", id)}
                onPartner={(id) => {
                  closeDialog();
                  navigate("University Partners");
                  setPartnerSelection(id);
                }}
              />
            ) : dialog.type === "notifications" ? (
              <div className="simple-list">
                {!data.settings.notifications ? (
                  <p className="body-copy">
                    Reminders are disabled in Settings.
                  </p>
                ) : (
                  <>
                    {visibleTasks
                      .filter((t) => !t.done)
                      .sort((a, b) => a.date.localeCompare(b.date))
                      .map((t) => (
                        <button
                          className="list-row"
                          key={t.id}
                          onClick={() => {
                            closeDialog();
                            navigate("Tasks & Calendar");
                          }}
                        >
                          <div>
                            <strong>{t.title}</strong>
                            <small>
                              {formatDate(t.date)} · {t.owner}
                            </small>
                          </div>
                        </button>
                      ))}
                    {data.agreements
                      .filter((g) => g.renewal && g.renewal <= today())
                      .map((g) => (
                        <button
                          className="list-row"
                          key={g.id}
                          onClick={() => {
                            closeDialog();
                            navigate("University Partners");
                          }}
                        >
                          Agreement renewal: {g.name} · {formatDate(g.renewal)}
                        </button>
                      ))}
                    {!visibleTasks.some((t) => !t.done) && (
                      <Empty text="No open reminders." />
                    )}
                  </>
                )}
              </div>
            ) : role === "Referral agent" && dialog.type === "application" ? (
              <div>
                <p>
                  {data.applications.find((a) => a.id === dialog.id)?.course}
                </p>
                <Badge>
                  {data.applications.find((a) => a.id === dialog.id)?.status}
                </Badge>
                <p className="helper">
                  Application updates are read-only in this preview.
                </p>
              </div>
            ) : (
              <CrmDialogs
                key={dialog.type + dialog.id}
                dialog={dialog}
                onClose={closeDialog}
              />
            )}
          </Modal>
        )}
        {toast && (
          <div role="status" className="toast">
            {toast}
            <button aria-label="Dismiss message" onClick={() => setToast("")}>
              ×
            </button>
          </div>
        )}
      </div>
    </WorkspaceContext.Provider>
  );
}

function WorkspaceSearch({ initial, onStudent, onApplication, onPartner }) {
  const { data } = useWorkspace(),
    [query, setQuery] = useState(initial);
  const match = (text) =>
    query && text.toLowerCase().includes(query.toLowerCase());
  const students = data.students.filter((s) =>
      match(s.name + " " + s.id + " " + s.email),
    ),
    apps = data.applications.filter((a) =>
      match(
        a.course +
          " " +
          a.id +
          " " +
          data.students.find((s) => s.id === a.studentId)?.name,
      ),
    ),
    partners = data.partners.filter((p) => match(p.name + " " + p.country));
  return (
    <>
      <SearchBox label="Global search" value={query} onChange={setQuery} />
      <div className="simple-list">
        {students.map((s) => (
          <button className="list-row" key={s.id} onClick={() => onStudent(s)}>
            <Badge>Student</Badge>
            <strong>{s.name}</strong>
            <small>{s.id}</small>
          </button>
        ))}
        {apps.map((a) => (
          <button
            className="list-row"
            key={a.id}
            onClick={() => onApplication(a.id)}
          >
            <Badge>Application</Badge>
            <strong>{a.course}</strong>
          </button>
        ))}
        {partners.map((p) => (
          <button
            className="list-row"
            key={p.id}
            onClick={() => onPartner(p.id)}
          >
            <Badge>University</Badge>
            <strong>{p.name}</strong>
            <span>{p.country}</span>
          </button>
        ))}
        {query && !students.length && !apps.length && !partners.length && (
          <Empty text="No matching records." />
        )}
        {!query && (
          <p className="body-copy">
            Search student names, university names, courses, email addresses or
            references.
          </p>
        )}
      </div>
    </>
  );
}
