# Current MVP readiness

Reviewed 6 November 2026. This is a functional browser-local prototype, suitable for demonstrations with fictional data. It is not ready for independent agencies to share as a hosted service.

## Implemented

- Editable agency branding and administrator identity in Settings.
- Student profiles, multiple independent applications, offers, documents, visa decisions, arrival and enrolment tracking.
- University partners, agreement versions, course search, comparisons and student shortlists.
- Calendar events and tasks, ownership, completion checkboxes, filters and browser persistence.
- Commission entitlement snapshots, milestones, invoices, partial payments and adjustments.
- Team records, reports, CSV export and local backup controls.
- Glass sidebar surfaces with the existing navigation layout.

## Required before shared agency use

1. Real authentication, invitations, password recovery and server-enforced permissions. The role selector is only a UI preview.
2. A shared database with an agency identifier on every owned record and automated cross-agency access tests.
3. Private server-side file storage, controlled downloads and upload validation.
4. Server-side validation of all business rules and a durable audit log.
5. Tested backup restoration, deployment monitoring and operational recovery.
6. Complete browser workflow and accessibility testing across supported devices.

Browser storage is tied to this browser profile and computer. Clearing it can remove records. Do not enter real student passports or confidential salary records in this prototype.
