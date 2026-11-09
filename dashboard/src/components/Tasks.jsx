import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getCalendarDays } from "../calendar.js";
import { Panel, formatDate } from "./Shared.jsx";

export default function Tasks({ tasks, onToggle }) {
  const [view, setView] = useState("List");
  const [month, setMonth] = useState(new Date(2027, 5, 1));
  const year = month.getFullYear();
  const monthIndex = month.getMonth();

  return (
    <>
      <div className="page-heading">
        <div>
          <h1>Tasks & calendar</h1>
          <p>Demo schedule · June 2027. Keep every next step visible.</p>
        </div>
        <div className="segmented">
          {["List", "Calendar"].map((item) => (
            <button
              key={item}
              className={view === item ? "selected" : ""}
              onClick={() => setView(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
      {view === "List" ? (
        <Panel
          title="Agency tasks"
          subtitle={`${tasks.filter((task) => !task.done).length} open tasks`}
        >
          <div className="task-list">
            {tasks.map((task) => (
              <label
                className={`task-row ${task.done ? "completed" : ""}`}
                key={task.id}
              >
                <input
                  type="checkbox"
                  checked={task.done}
                  onChange={() => onToggle(task.id)}
                />
                <span>
                  <strong>{task.title}</strong>
                  <small>
                    {task.owner} · {formatDate(task.date)} · {task.time}
                  </small>
                </span>
              </label>
            ))}
          </div>
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
                className="icon-button"
                aria-label="Previous month"
                onClick={() => setMonth(new Date(year, monthIndex - 1, 1))}
              >
                <ChevronLeft size={18} />
              </button>
              <button
                className="icon-button"
                aria-label="Next month"
                onClick={() => setMonth(new Date(year, monthIndex + 1, 1))}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          }
        >
          <div className="calendar-grid">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
              <strong className="weekday" key={day}>
                {day}
              </strong>
            ))}
            {getCalendarDays(year, monthIndex).map((day, index) => {
              const date = `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              return (
                <div className="calendar-day" key={index}>
                  {day && (
                    <>
                      <span>{day}</span>
                      {tasks
                        .filter((task) => task.date === date)
                        .map((task) => (
                          <button
                            className={task.done ? "completed" : ""}
                            key={task.id}
                            onClick={() => onToggle(task.id)}
                            title="Toggle task completion"
                          >
                            {task.time} {task.title}
                          </button>
                        ))}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </Panel>
      )}
    </>
  );
}
