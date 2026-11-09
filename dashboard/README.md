# Study & Go Global — Agency CRM

This is the internal agency dashboard, added alongside the collaborator's public landing page. The landing page remains in the repository root. This React application lives in `dashboard/`.

## Start locally

From the repository root:

```powershell
cd dashboard
npm install
npm run dev
```

Open the local address printed by Vite. The current lesson uses port 5173. `npm run build` checks and builds the app; `npm test` checks calendar dates.

## Current MVP

- Navy, emerald, ivory, and champagne design, with glass styling on the sidebar.
- Working navigation, mobile menu, and overview charts from the same demo records.
- Student search, stage filters, add-student form, and student details.
- Independent application records, status changes, and required update notes.
- Task completion, monthly calendar, and browser-local saving.
- Partner agreements, team management, course catalogue and shortlists, documents,
  visa tracking, commissions and current-pipeline reporting.
- A glass login screen with four fictional, role-assigned demo accounts. It is a
  local UX demonstration, not production authentication.

The browser demonstration adds a fictional `Lesson Demo Student` and updates one fictional application to demonstrate persistence.

## Before production use

Production authentication, server-enforced permissions, agency-level tenant isolation,
shared database storage, private file storage, invitations and operational backups.

All seed records and login accounts are fictional. Browser storage is temporary
demonstration storage; do not enter real student identity documents or salary records.

## Learn the code

Read `docs/WORKFLOWS.md` and `docs/LOGIN-LESSON.md`. Start with `src/main.jsx`,
then `src/App.jsx`, then `src/components/LoginPage.jsx`. Each component has a
focused responsibility. We use regular JavaScript and CSS so the basic React
concepts remain visible.

## Live preview

GitHub Actions builds `dashboard/` and deploys it to GitHub Pages whenever the
default branch changes. The Pages workflow must be enabled once in the repository
settings by an administrator.
