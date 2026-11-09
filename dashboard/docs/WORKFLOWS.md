# Learning map

Start the local app with npm run dev in the dashboard folder.

- src/App.jsx connects pages and dialogs.
- src/components/Sidebar.jsx displays the agency name from Settings.
- src/components/TasksPage.jsx displays task lists and the calendar. useState remembers the month, filter selects records, sort orders them, and toggle sends completion changes to the store.
- src/calendar.js calculates the month grid.
- src/components/CrmDialogs.jsx contains editable forms.
- src/useCrm.js loads and saves records in browser storage.
- src/model.js validates changes and applies business rules.
- src/files.js stores attachment bytes in IndexedDB.
- src/workflows.css adds the glass sidebar appearance. Transparent colors, backdrop-filter, borders and shadows create the effect.

For calendar practice: open Tasks & Calendar, choose Calendar, use a date's plus button, save an appointment, tick it complete, refresh and check it remains saved.

For branding: open Settings, change the agency and administrator name, save, then inspect the sidebar and header.

The original LESSON-01.md records the earlier lesson; filenames and line numbers have evolved. Read MVP-READINESS.md before planning a shared agency launch and TEST-REPORT.md for verification limits.

