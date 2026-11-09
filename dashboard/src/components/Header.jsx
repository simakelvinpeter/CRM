import { Bell, Menu, Plus, Search } from "lucide-react";
import { initials } from "./Shared.jsx";

export default function Header({
  onAddStudent,
  onSearch,
  onMenu,
  onNotifications,
  actorName = "Administrator",
  readOnly = false,
}) {
  return (
    <header className="topbar">
      <button
        className="icon-button mobile-menu"
        aria-label="Open menu"
        onClick={onMenu}
      >
        <Menu size={20} />
      </button>
      <label className="global-search">
        <Search size={18} />
        <input
          aria-label="Search workspace"
          placeholder="Search students, universities, applications…"
          onKeyDown={(event) => {
            if (event.key === "Enter") onSearch(event.currentTarget.value);
          }}
        />
        <kbd>↵</kbd>
      </label>
      <div className="header-actions">
        {!readOnly && (
          <button className="button primary" onClick={onAddStudent}>
            <Plus size={16} />
            New student
          </button>
        )}
        <button
          className="icon-button notification-button"
          aria-label="View tasks"
          onClick={onNotifications}
        >
          <Bell size={20} />
          <i />
        </button>
        <span className="avatar">{initials(actorName)}</span>
        <strong className="header-name">{actorName}</strong>
      </div>
    </header>
  );
}
