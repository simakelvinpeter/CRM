# Verification report

6 November 2026, Desktop dashboard checkout.

- npm test: 37 passed, 0 failed.
- npm run build: passed (Vite 6.4.5).
- Model tests cover calendar dates, completion, linked records, independent applications, visa progression, financial reconciliation, agreement snapshots, preview permissions and backup record validation.
- Browser checks completed: appointment creation, completion and refresh persistence; agency/admin rename and refresh; role-preview visibility; task navigation.
- Visible teaching demonstration: opened TasksPage.jsx in VS Code, explained month state/filter/sort/completion through Windows speech, added a teaching comment, saved and reran tests/build. Calendar now opens on the current month.

Limits: document upload/download and full backup restoration have not received end-to-end browser verification. Automated financial tests do not replace a complete finance UI acceptance test. No production authentication, tenant isolation or security certification is claimed.

Login update: 41 tests passed and build passed. Browser verified all four assigned demo roles, invalid credentials, sign out, refresh sign out, password visibility, demo autofill and corrected 390px mobile layout. See LOGIN-LESSON.md for the local-only authentication boundary.
