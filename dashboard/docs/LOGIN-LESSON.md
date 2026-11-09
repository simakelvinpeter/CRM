# Login lesson

The login follows the glass inspiration with navy #142338, emerald actions, ivory text and champagne accents. Dashboard layout is unchanged.

1. src/components/LoginPage.jsx: useState remembers email, password, visibility, errors and expanded demo accounts. submit prevents navigation and passes the account to App.
2. src/demoAuth.js: public fictional demo accounts map emails to assigned roles. No role selector grants owner access. This module is deliberately a demo, not production authentication.
3. src/App.jsx: the outer App holds an in-memory account. Without one it displays LoginPage; otherwise it mounts Workspace. Sign out removes the account and unmounts the workspace, closing its open dialogs. Refresh signs out. Existing CRM records remain in browser storage.
4. src/login.css: scoped classes keep the dashboard unchanged. Gradients create the navy/emerald backdrop. Transparency, blur, borders and shadows create glass. min-width:0 lets grid children shrink on mobile.
5. tests/demoAuth.test.js: assigned roles, normalization, invalid credentials and fixture isolation.

Use Explore with a demo account to fill the form, then Sign in to workspace. Accounts: owner@demo.agency, finance@demo.agency, counsellor@demo.agency, referral@demo.agency. Public demo password: ExploreCRM!2026.

This screen is a local UX demo. Password lookup and role checks run in frontend code. Browser records are shared by these accounts; there is no secure tenant isolation. Team edits do not create login accounts. Production needs server-backed invitations, verified sessions, password recovery and server-enforced agency permissions. Do not use real credentials here.

Verification: 41 automated tests passed; production build passed. Browser checks covered invalid credentials, all four roles, sign out, refresh sign out, demo autofill, show password and mobile layout.
