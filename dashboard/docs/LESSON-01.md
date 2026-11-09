# Lesson 1 — from a Figma design to a working React screen

## What we found on GitHub

Repository: https://github.com/simakelvinpeter/CRM

Your collaborator Amin Jimoh (`Minj21`) pushed commit `6355af8`, “Build study abroad landing page”, on 5 November 2026 at 10:32 PM Africa/Nairobi time. At inspection, `main` was the only branch and there were no pull requests. The existing `index.html` and `styles.css` are the public landing page. We kept both unchanged and added the internal CRM in `dashboard/`, on a local feature branch.

## The file map

| File | Responsibility |
| --- | --- |
| `index.html` | Empty HTML shell with the root element and JavaScript entry point. |
| `package.json` | Project dependencies and commands. |
| `vite.config.js` | Small development/build configuration for JSX. |
| `src/main.jsx` | Mount React into the browser page. |
| `src/App.jsx` | Own shared state and choose which page is visible. |
| `src/data.js` | Navigation definitions and fictional starting records. |
| `src/useStoredState.js` | Read and save demonstration records in this browser. |
| `src/styles.css` | Colour tokens, layout, glass sidebar, tables, forms, and responsive rules. |
| `src/components/Sidebar.jsx` | Brand, workspace, navigation groups, and profile. |
| `src/components/Header.jsx` | Search, new-student button, and task shortcut. |
| `src/components/Overview.jsx` | Calculate dashboard metrics and display charts. |
| `src/components/Students.jsx` | Filter and display the student list. |
| `src/components/StudentForm.jsx` | Read form input and create a student record. |
| `src/components/ApplicationTable.jsx` | Reuse the same application table in different screens. |
| `src/components/Shared.jsx` | Shared badges, panels, dialogs, and formatting helpers. |
| `src/components/Tasks.jsx` | Task list and correctly generated monthly calendar. |
| `src/components/DirectoryPage.jsx` | Read-only partner/team/report layouts and next-lesson placeholders. |
| `src/calendar.js` | Pure date calculation, separate from the interface. |
| `tests/calendar.test.js` | Regression checks for month length and weekday alignment. |

## Read main.jsx line by line

Line numbers below refer to the formatted lesson files.

| Line | Explanation |
| --- | --- |
| 1 | A comment explaining what the following import does. Comments are for people. |
| 2 | Import `createRoot`, React's browser renderer. Braces mean a named export. |
| 3 | Blank line to separate ideas. |
| 4 | Comment introducing our own imports. |
| 5 | Import the default export from our `App.jsx` file. `./` means the same folder. |
| 6 | Import the CSS file for its styling effect. We do not need a variable for it. |
| 7 | Blank line. |
| 8 | Comment introducing the mounting operation. |
| 9 | Find the HTML element whose ID is `root`, create a React root there, and render the `App` component. `<App />` is JSX. |

## Read Sidebar.jsx line by line

| Line | Explanation |
| --- | --- |
| 1 | Explain this file's purpose in a comment. |
| 2 | Import four icon components. |
| 3 | Import the navigation data from the parent folder. `../` means go up one folder. |
| 4 | Blank line. |
| 5 | Describe the inputs, which React calls props. |
| 6 | Define and export the component. Destructuring extracts `activePage` and `onNavigate` from its props. |
| 7 | Begin returning JSX. Parentheses let the JSX span several lines. |
| 8 | Open the semantic sidebar element. `className` connects it to CSS; `aria-label` names it for assistive technology. |
| 9 | JSX comment: inside JSX, comments use `{/* ... */}`. |
| 10 | Open the brand button. The arrow function runs when clicked and navigates to Overview. |
| 11 | Display the globe icon and give it a CSS class and size. |
| 12 | Open a text wrapper. |
| 13 | Display the brand name and smaller GLOBAL line. |
| 14 | Close the wrapper. |
| 15 | Close the brand button. |
| 16 | Blank line. |
| 17 | Open the workspace information card. It is informational, not a fake dropdown. |
| 18 | Display the SG initials in a styled square. |
| 19 | Open the text wrapper inside the card. |
| 20 | Display the small Workspace label. |
| 21 | Display the workspace name with strong emphasis. |
| 22 | Close the text wrapper. |
| 23 | Display the small arrow decoration. |
| 24 | Close the workspace card. |
| 25 | Blank line. |
| 26 | Open the navigation region; its CSS allows independent scrolling. |
| 27 | Explain why we use map here. |
| 28 | Loop over navigation groups. Curly braces let JSX evaluate JavaScript. |
| 29 | Create a section for one group. A stable `key` identifies it to React. |
| 30 | Display that group's title. |
| 31 | Loop over that group's menu items. This callback uses a block because it calculates values first. |
| 32 | Save the icon component in a capitalized variable so JSX can render it. |
| 33 | Compare the selected page with this item's label. `===` performs strict equality. |
| 34 | Blank line. |
| 35 | Return the JSX for this individual item. |
| 36 | Open the button. Its attributes continue on following lines. |
| 37 | Give this item a stable key. |
| 38 | Use a ternary expression: selected items get both nav-link and active classes. |
| 39 | Tell assistive technology which item represents the current page. Unselected items omit this attribute. |
| 40 | Wait for a click, then call the parent's navigation function with the item's label. |
| 41 | Finish the opening button tag. |
| 42 | Display the item's icon. |
| 43 | Display the item's label. |
| 44 | Close the button. |
| 45 | Finish the return expression for an item. |
| 46 | Close the inner map callback and JSX expression. |
| 47 | Close the group's section. |
| 48 | Close the outer map expression. |
| 49 | Close navigation. |
| 50 | Blank line. |
| 51 | Open the footer below the scrolling navigation. |
| 52 | Open a Settings button wired to the same navigation function. |
| 53 | Display the settings icon. |
| 54 | Display the Settings label. |
| 55 | Close the Settings button. |
| 56 | Open the Help button and its navigation handler. |
| 57 | Display the help icon. |
| 58 | Display the Help label. |
| 59 | Close the Help button. |
| 60 | Open the profile information card. |
| 61 | Display the SP avatar. CSS fixes both width and height so it stays circular. |
| 62 | Open a profile text wrapper. |
| 63 | Display the administrator's name. |
| 64 | Display their role. This is a demonstration identity, not authenticated access. |
| 65 | Close the profile text wrapper. |
| 66 | Close the profile card. |
| 67 | Close the footer. |
| 68 | Close the sidebar. |
| 69 | Finish returning the component's JSX. |
| 70 | Close the component function. |

## Read App.jsx state and actions

Read this section before trying to understand every JSX tag in the whole app.

| Line | Explanation |
| --- | --- |
| 1 | Import React's state hook. A hook is a function for React behavior such as state or effects. |
| 2 | Import the Search icon. |
| 3–9 | Import starting records and application status options. |
| 10 | Import our browser-saving hook. |
| 11–18 | Import our separately named interface components. |
| 19–25 | Import shared components and formatting helpers. |
| 27 | Define App, the parent of our layout and pages. |
| 28 | Comment explaining state. |
| 29 | Start with Overview selected. `setActivePage` is how we change that value. |
| 30–33 | Load saved students if present; otherwise use initialStudents. |
| 34–37 | Do the same independently for university applications. |
| 38 | Load or initialize tasks. |
| 39 | Start with an empty search string. |
| 40 | Start with no student stage filter. |
| 41 | Start with no application status filter. |
| 42 | `null` means there is no open dialog. |
| 43 | `false` means the mobile sidebar is closed. |
| 45 | Define a reusable function for navigation. |
| 46 | Change the selected page. React rerenders the workspace. |
| 47 | Clear the old page's search text. |
| 48 | Close the mobile menu after selecting a page. |
| 49 | Finish navigate. |
| 51 | Define the callback that receives a student from the form. |
| 52 | Explain array spread. |
| 53 | Create a new array containing all current students, followed by the new student. |
| 54 | Close the form dialog. |
| 55 | Navigate to the student list so the new record is visible. |
| 56 | Finish addStudent. |
| 58 | Define task completion toggling. |
| 59 | Explain immutable updates: copy rather than mutate. |
| 60 | Supply a newly calculated tasks array to React. |
| 61 | Visit every existing task. |
| 62 | If its ID matches, copy it and invert done; otherwise keep it as it is. |
| 63–65 | Finish the map, setter, and function. |
| 67 | Define the application form's submit handler. |
| 68 | Prevent the form from navigating away/reloading. |
| 69 | Read inputs from this form and turn them into an object. |
| 70 | Read the ID of the application currently shown in the dialog. |
| 71–72 | Calculate the new applications array. |
| 73 | Return unrelated applications unchanged. |
| 74 | Start the object for the application being updated. |
| 75 | Copy its existing fields. |
| 76 | Replace only its application status. |
| 77 | Save the explanation written into the form. |
| 78–80 | Close the object, map, and state update. |
| 81 | Close the dialog. |
| 82 | Finish the handler. |
| 84–86 | Opening a student stores a dialog type and the selected record. |
| 88–90 | Opening an application stores its own type and selected record. |
| 92–93 | Introduce the function that chooses which page component to show. |
| 94–107 | When Overview is selected, render it with data and callbacks as props. Each prop name explains its purpose. |
| 108–121 | Render Students with the records, filters, selected-record callback, and add callback. |

The remaining App JSX follows the same pattern: select a page, pass its inputs, and show dialogs only when dialog state is not null. Read Students.jsx next to see filter in a smaller file.

## Read useStoredState.js line by line

| Line | Explanation |
| --- | --- |
| 1 | Import the effect and state hooks. |
| 3 | State the purpose of this reusable hook. |
| 4 | Receive a storage key and fallback records. |
| 5 | Use a function initializer; React reads saved data when this state is first created. |
| 6 | Begin a protected operation that could fail. |
| 7 | Read a string from localStorage and decode JSON. |
| 8 | Use saved data only if it is an array; otherwise use the initial records. |
| 9–11 | If reading/parsing fails, start with the initial records. |
| 12 | Finish initializing state. |
| 14 | Explain the saving effect. |
| 15 | Start the effect function. |
| 16 | Protect against storage failures. |
| 17 | Convert the records into a string and save under the key. |
| 18 | Handle a failure such as blocked browser storage or quota. |
| 19–21 | Log the limitation rather than crashing the interface. |
| 22 | Close error handling. |
| 23 | Rerun the effect when the key or records changes. |
| 25 | Return the records and setter, matching useState's two-value pattern. |
| 26 | Close the hook. |

## How the glass CSS works

The numbered comments in styles.css mark each lesson section. Find the `.sidebar` selector:

- `position: fixed`: anchor the sidebar to the viewport.
- `inset`: specify its edges instead of four separate top/right/bottom/left declarations.
- `width`: reserve the navigation column.
- `display: flex`: arrange its children with flexbox.
- `flex-direction: column`: stack the brand, workspace, menu, and footer vertically.
- `background`: provide a navy fallback even when blur is unavailable.
- `radial-gradient`: add subtle emerald and champagne light.
- `linear-gradient`: vary the navy surface from top to bottom.
- Alpha values at the end of an eight-digit hex colour make it translucent.
- `border-right`: define a fine light edge.
- `box-shadow`: add subtle depth and an inner highlight.
- `backdrop-filter`: blur the surface behind the sidebar.
- `.navigation { flex: 1; min-height: 0; overflow-y: auto; }`: give the menu the remaining space and allow scrolling without hiding Settings/profile.
- `.nav-link.active`: tint the selected item emerald; add a champagne inset line.
- `@media`: change layout rules at smaller screen widths. Phone layouts turn the sidebar into a drawer.

The sidebar is the only glass surface. White cards and ivory content keep the working area readable.

## Why students and applications are separate

`student.id` identifies the person. `application.studentId` references that person. One student can therefore appear in multiple application records with different decisions. Changing an application to Conditional offer must not rewrite all their other applications or automatically change their overall journey stage.

## Try these exercises

1. In Sidebar.jsx change only the profile display name, save, and watch the browser update.
2. In styles.css change `--champagne`, inspect the sidebar accent, then restore `#b99a62`.
3. Add a fictional student. Refresh the browser and verify the record is still there.
4. Search Amina. Open her profile and compare her separate application decisions.
5. Change one application with an explanatory note. Verify the student's stage remains Applying.
6. Complete a task. Refresh and inspect both the task list and dashboard count.
7. Switch the calendar to February 2028. It should have 29 days; June 2027 should have 30.

## Next lessons

2. Student profile editing, academic details, notes, and required documents.
3. Applications, offer conditions, and intake deadlines.
4. Visa cases, travel, arrival, and confirmed enrolment.
5. Partner agreements and a verified course catalogue.
6. Commission entitlements, invoices, partial payments, and adjustments.
7. Authentication, agency separation, permission enforcement, and database persistence.

These are planned work, not completed production features. We will continue in readable pieces rather than claiming the prototype is a finished business system.
