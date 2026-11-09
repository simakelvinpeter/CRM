import { useState } from "react";
import { useWorkspace } from "../WorkspaceContext.jsx";
import { Heading, SearchBox, Empty } from "./Forms.jsx";
import { Panel, Badge, formatDate } from "./Shared.jsx";
import { getCalendarDays } from "../calendar.js";
import { today } from "../model.js";

export default function TasksPage() {
  const { data, send, open, role, notify } = useWorkspace(),
    [view, setView] = useState("List"),
    [owner, setOwner] = useState("All"),
    [query, setQuery] = useState(""),
    [overdue, setOverdue] = useState(false),
    [month, setMonth] = useState(() => new Date(today() + "T12:00:00"));
  const y = month.getFullYear(),
    m = month.getMonth();
  const records = data.tasks
    .filter(
      (t) =>
        (t.title + " " + t.owner).toLowerCase().includes(query.toLowerCase()) &&
        (owner === "All" || t.owner === owner) &&
        (!overdue || (!t.done && t.date < today())),
    )
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  // Send the checkbox change to the shared store so it survives a refresh.
const toggle = (id) => {
    try {
      send("task.toggle", { id });
    } catch (e) {
      notify(e.message);
    }
  };
  return (
    <>
      <Heading
        title="Tasks & calendar"
        text="Appointments, deadlines and follow-ups with clear ownership"
      >
        {role !== "Referral agent" && (
          <button className="button primary" onClick={() => open("task")}>
            + Add task / event
          </button>
        )}
      </Heading>
      <div className="table-toolbar panel">
        <SearchBox label="Search tasks" value={query} onChange={setQuery} />
        <select
          aria-label="Task owner"
          value={owner}
          onChange={(e) => setOwner(e.target.value)}
        >
          <option value="All">All owners</option>
          {data.team.map((t) => (
            <option key={t.id}>{t.name}</option>
          ))}
        </select>
        <label className="toggle-label">
          <input
            type="checkbox"
            checked={overdue}
            onChange={(e) => setOverdue(e.target.checked)}
          />
          Overdue only
        </label>
        <div className="segmented">
          {["List", "Calendar"].map((v) => (
            <button
              key={v}
              className={v === view ? "selected" : ""}
              onClick={() => setView(v)}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
      <div className="section-gap">
        {view === "List" ? (
          <Panel
            title="Agency tasks"
            subtitle={`${records.filter((t) => !t.done).length} open · ${records.filter((t) => t.done).length} completed`}
          >
            <div className="simple-list">
              {records.map((t) => (
                <div className="list-row" key={t.id}>
                  <input
                    type="checkbox"
                    aria-label={"Complete " + t.title}
                    checked={t.done}
                    disabled={role === "Referral agent"}
                    onChange={() => toggle(t.id)}
                  />
                  <div className={"grow " + (t.done ? "completed" : "")}>
                    <strong>{t.title}</strong>
                    <small>
                      {formatDate(t.date)} · {t.time} · {t.owner} · {t.type}
                    </small>
                  </div>
                  <Badge>
                    {!t.done && t.date < today() ? "Overdue" : t.priority}
                  </Badge>
                  {role !== "Referral agent" && (
                    <button
                      className="text-button"
                      onClick={() => open("task", t.id)}
                    >
                      Edit
                    </button>
                  )}
                </div>
              ))}
            </div>
            {!records.length && <Empty text="No tasks match your filters." />}
          </Panel>
        ) : (
          <Panel
            title={month.toLocaleDateString("en-GB", {
              month: "long",
              year: "numeric",
            })}
            action={
              <div className="heading-actions">
                <button
                  className="button"
                  aria-label="Previous month"
                  onClick={() => setMonth(new Date(y, m - 1, 1))}
                >
                  ←
                </button>
                <button
                  className="button"
                  onClick={() =>
                    setMonth(
                      new Date(
                        new Date().getFullYear(),
                        new Date().getMonth(),
                        1,
                      ),
                    )
                  }
                >
                  Today
                </button>
                <button
                  className="button"
                  aria-label="Next month"
                  onClick={() => setMonth(new Date(y, m + 1, 1))}
                >
                  →
                </button>
              </div>
            }
          >
            <div className="calendar-grid">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                <strong className="weekday" key={d}>
                  {d}
                </strong>
              ))}
              {getCalendarDays(y, m).map((day, i) => {
                const date = `${y}-${String(m + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                return (
                  <div className="calendar-day" key={i}>
                    {day && (
                      <>
                        <div className="calendar-day-heading">
                          <span>{day}</span>
                          {role !== "Referral agent" && (
                            <button
                              className="calendar-add"
                              aria-label={"Add event on " + date}
                              onClick={() =>
                                open("task", null, {
                                  date,
                                  taskType: "Appointment",
                                })
                              }
                            >
                              +
                            </button>
                          )}
                        </div>
                        {records
                          .filter((t) => t.date === date)
                          .map((t) => (
                            <div className="calendar-event" key={t.id}>
                              <input
                                type="checkbox"
                                aria-label={"Complete " + t.title}
                                checked={t.done}
                                disabled={role === "Referral agent"}
                                onChange={() => toggle(t.id)}
                              />
                              <button
                                className={t.done ? "completed" : ""}
                                onClick={() =>
                                  role !== "Referral agent" &&
                                  open("task", t.id)
                                }
                              >
                                {t.time} {t.title}
                              </button>
                            </div>
                          ))}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </Panel>
        )}
      </div>
    </>
  );
}
