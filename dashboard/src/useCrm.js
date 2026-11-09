import { useRef, useState } from "react";
import { applyAction, createSeed, validateState } from "./model.js";

const KEY = "study-go-crm-complete-v2";
function load() {
  const saved = localStorage.getItem(KEY);
  if (saved) return validateState(JSON.parse(saved));
  const seed = createSeed();
  // Preserve records and status changes from the first learning build.
  const oldStudents = JSON.parse(
    localStorage.getItem("sg-lesson-students-v1") || "null",
  );
  if (Array.isArray(oldStudents))
    seed.students = oldStudents.map((st) => ({
      phone: "",
      nationality: "",
      city: "",
      level: "Master’s degree",
      education: "",
      grades: "",
      english: "",
      guardian: "",
      ...seed.students.find((s) => s.id === st.id),
      ...st,
      currency: st.currency || "USD",
      shortlist: seed.students.find((s) => s.id === st.id)?.shortlist || [],
      archived: false,
    }));
  const oldApps = JSON.parse(
    localStorage.getItem("sg-lesson-applications-v1") || "null",
  );
  if (Array.isArray(oldApps))
    seed.applications = seed.applications.map((a) => {
      const old = oldApps.find((x) => x.id === a.id);
      return old
        ? { ...a, status: old.status, updateNote: old.updateNote || "" }
        : a;
    });
  const oldTasks = JSON.parse(
    localStorage.getItem("sg-lesson-tasks-v1") || "null",
  );
  if (Array.isArray(oldTasks))
    seed.tasks = seed.tasks.map((t) => ({
      ...t,
      done: oldTasks.find((x) => x.id === t.id)?.done ?? t.done,
    }));
  return validateState(seed);
}
export default function useCrm() {
  const [initial] = useState(() => {
    try {
      return { data: load(), error: "" };
    } catch (error) {
      return {
        data: null,
        error: "Existing saved data could not be loaded: " + error.message,
      };
    }
  });
  const [data, setData] = useState(initial.data),
    ref = useRef(data);
  function commit(next) {
    validateState(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      throw Error(
        "Could not save changes. Browser storage is full or blocked. Export a backup and free space before continuing.",
      );
    }
    ref.current = next;
    setData(next);
    return next;
  }
  function dispatch(action, actor) {
    return commit(applyAction(ref.current, action, actor));
  }
  return { data, dispatch, restore: commit, error: initial.error };
}
