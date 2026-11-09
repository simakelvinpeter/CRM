// This component draws the navigation panel.
import { Globe2, ChevronRight, Settings, HelpCircle } from "lucide-react";
import { navigationGroups } from "../data.js";
import { initials } from "./Shared.jsx";
import { financeAllowed } from "../model.js";

// Props are inputs supplied by the parent component, App.
export default function Sidebar({
  activePage,
  onNavigate,
  agency = "Your agency",
  actorName = "Administrator",
  role = "Agency owner",
}) {
  return (
    <aside className="sidebar" aria-label="Agency navigation">
      {/* The brand is a button so it can return us to Overview. */}
      <button className="brand" onClick={() => onNavigate("Overview")}>
        <Globe2 className="brand-icon" size={30} />
        <span>
          {agency}
          <small>AGENCY WORKSPACE</small>
        </span>
      </button>

      <div className="workspace-card">
        <span className="workspace-avatar">{initials(agency)}</span>
        <span>
          <small>Workspace</small>
          <strong>{agency}</strong>
        </span>
        <ChevronRight size={15} />
      </div>

      <nav className="navigation">
        {/* map turns each data item into a piece of the interface. */}
        {navigationGroups.map((group) => (
          <section className="nav-group" key={group.title}>
            <h2>{group.title}</h2>
            {group.items
              .filter(
                (item) => item.label !== "Commissions" || financeAllowed(role),
              )
              .map((item) => {
                const Icon = item.icon;
                const isActive = activePage === item.label;

                return (
                  <button
                    key={item.label}
                    className={isActive ? "nav-link active" : "nav-link"}
                    aria-current={isActive ? "page" : undefined}
                    onClick={() => onNavigate(item.label)}
                  >
                    <Icon size={19} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
          </section>
        ))}
      </nav>

      <div className="sidebar-footer">
        {role === "Agency owner" && (
          <button className="nav-link" onClick={() => onNavigate("Settings")}>
            <Settings size={19} />
            <span>Settings</span>
          </button>
        )}
        <button className="nav-link" onClick={() => onNavigate("Help")}>
          <HelpCircle size={19} />
          <span>Help & support</span>
        </button>
        <div className="profile-card">
          <span className="avatar">{initials(actorName)}</span>
          <span>
            <strong>{actorName}</strong>
            <small>{role}</small>
          </span>
        </div>
      </div>
    </aside>
  );
}
