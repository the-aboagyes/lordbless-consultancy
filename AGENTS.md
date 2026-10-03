# LORDBLESS CONSULTANCY PORTAL

## Project Brief and Development Instructions

This file contains the project-level instructions for Codex working on
the LORDBLESS CONSULTANCY WEBSITE repository.

## 1. Project Identity

Project name: LORDBLESS CONSULTANCY WEBSITE

Brand: LORDBLESS CONSULTANCY

Business positioning: A global mobility and travel consultancy helping
clients with Study, Work, Tourism, Business Travel, and Global
Settlement.

Primary divisions:

- GLOBAL EDUCATION
- GLOBAL CAREERS
- TRAVEL DESK
- BUSINESS DESK
- GLOBAL SETTLEMENT

Brand direction: premium, professional, trustworthy, international.

Primary visual identity:

- Deep navy
- Gold
- Clean white space
- Premium corporate appearance

## 2. Current Architecture

The project contains two connected web applications:

- ADMIN PORTAL
- CLIENT PORTAL

Current architecture is a static/local prototype using:

- HTML
- CSS
- Vanilla JavaScript
- localStorage
- BroadcastChannel
- Browser-based mock/local data bridges

Future production architecture: FRONTEND -\> SUPABASE AUTH -\> SUPABASE
DATABASE -\> SUPABASE STORAGE

Do NOT migrate to Supabase unless explicitly instructed.

## 3. Development Philosophy

DO NOT rewrite working components unnecessarily.

DO NOT replace the current architecture simply because another
architecture may be cleaner.

DO NOT refactor large sections unless specifically requested.

Make SURGICAL changes.

Before modifying a file:

1.  Inspect the actual current file.
2.  Understand its existing structure.
3.  Identify the exact location requiring modification.
4.  Make the smallest safe change.
5.  Preserve existing functionality.
6.  Validate the result.

Never assume that a function, variable, import, selector, component, or
file exists. Search the actual codebase first.

## 4. Source of Truth

The actual files in this repository are the source of truth.

Do not rely on old versions, previous generated code, assumptions,
remembered file structures, or generic templates.

If an integration requires another file, inspect that file first.

If the required file does not exist, report that clearly before
inventing a replacement.

## 5. Admin Portal

The Admin Portal is the operational control centre.

Expected areas include:

- Dashboard
- Clients
- Journeys
- Applications
- Requirements
- Documents
- Document Requests
- Messages
- Finance
- Payment Requests
- Payment Verification
- Receipts
- Payment History
- Financial Reports
- Settings / Administration

The exact current implementation must always be determined from the
actual project files.

## 6. Client Portal

The Client Portal is the client-facing system.

Expected areas include:

- Overview
- My Journeys
- My Documents
- Messages
- Payments / Finance
- My Profile
- Help & Support

The client should only see information belonging to that client.

## 7. Access Control

Current/future operational desks include:

- USA
- Canada
- Germany & Europe
- China

Each team must eventually be restricted to its own clients, journeys,
and operational data.

Do not implement cross-team access unless explicitly requested.

## 8. Journey System

The portal is designed around client journeys.

Example Canada Nursing milestones:

- NNAS
- NMC
- Nursing Training College
- Provincial Nursing Board reassessment
- Upbridging Programme
- IELTS
- NCLEX
- Employment Search
- Interview
- Visa Processing

Other journeys may include Germany healthcare, Germany Ausbildung,
University study, Masters, PhD, Jobs, Tourism, China business, and other
global mobility services.

Journey architecture must remain flexible.

## 9. Document System

The document system includes:

- CLIENT DOCUMENTS
- DOCUMENT REQUESTS
- PERMANENT DOCUMENT LIBRARY

Approved documents can potentially be reused across multiple journeys
instead of being requested repeatedly.

The current document architecture must be inspected before modifying it.

## 10. Finance System

Intended workflow:

ADMIN CREATES PAYMENT REQUEST -\> CLIENT SEES PAYMENT REQUEST -\> CLIENT
PAYS EXTERNALLY -\> ADMIN / FINANCE VERIFIES PAYMENT -\> PAYMENT BECOMES
PAID -\> OFFICIAL RECEIPT IS GENERATED -\> CLIENT CAN VIEW RECEIPT -\>
CLIENT CAN DOWNLOAD RECEIPT

The client portal does NOT process the actual external payment. It
records and manages payment requests and payment verification.

## 11. Payment Currencies

Supported currencies:

- EUR
- USD
- GHS

Do not assume all transactions use EUR. Currency handling must remain
explicit.

## 12. Payment Data Bridge

The current prototype uses LORDBLESS_PAYMENT_BRIDGE for local browser
persistence and Admin/Client communication.

It is temporary and must not be removed while the prototype depends on
it.

Future production architecture will replace it with Supabase.

## 13. Payment Request Data

Payment request records may contain:

- id
- reference
- clientId
- amount
- currency
- status
- verificationStatus
- description
- journey
- dates
- metadata

Existing code has previously used paymentRequest.amount rather than
paymentRequest.total.

When modifying payment logic, inspect the actual current data structure
first.

## 14. Payment Verification

Intended process:

Payment Request -\> Client pays externally -\> Finance verifies funds
-\> Payment status becomes paid -\> Verification status becomes verified
-\> Official receipt becomes available

Do not accidentally mark an unpaid payment as paid.

## 15. Official Receipts

The receipt system is already substantially implemented.

Existing working receipt design should be preserved.

Receipt workflow: Admin verifies payment -\> receipt generated -\>
receipt stored -\> client can view receipt -\> client can download
receipt

The receipt should include LORDBLESS branding, company name, Official
Payment Receipt, receipt number, payment details, amount paid,
description, PAID presentation/status, and electronic receipt notice.

Internal receipt status may remain `issued` while the visual receipt
displays `PAID`. Do not change internal status logic merely because the
receipt visually says PAID.

## 16. Mock Data

The project currently uses mock/local data during development.

Example client:

- Client ID: LBC-CLIENT-0001
- Name: KWAME MENSAH

Example journey:

- Transaction: LBC-2026-00021
- Title: Germany Career Journey

These are development/test records. Do not treat mock data as production
data.

## 17. Data Architecture

Portal mock data handles things such as clients and journeys.

Portal/payment data bridge handles:

- payment requests
- payments
- receipts

Documents have their own architecture.

Do not merge these systems casually.

## 18. Known Project History

This project has experienced problems caused by editing the wrong file
or using an outdated version.

Therefore:

- ALWAYS INSPECT THE CURRENT FILE BEFORE MODIFYING IT.
- Never say "replace the existing function" unless you have confirmed
  that the function exists in the current file.
- Give exact locations.
- Prefer "Find this exact block..." over vague directions.

## 19. Surgical Editing Rule

For every requested change:

1.  Identify the exact file.
2.  Inspect the exact current version.
3.  Identify the exact block.
4.  Explain what is wrong.
5.  Make the smallest possible change.
6.  Preserve everything unrelated.
7.  Run syntax checks.
8.  Run relevant tests if available.
9.  Report exactly which files changed.

If a change can be made in one file, do not modify three files.

## 20. Do Not Do This

Do NOT:

- rewrite entire files unnecessarily
- introduce frameworks without permission
- convert the project to React/Vue/etc.
- migrate to Supabase without instruction
- rename existing working components unnecessarily
- change working UI merely for stylistic reasons
- remove working localStorage/BroadcastChannel systems
- change business logic without explicit instruction
- invent missing files
- assume file paths
- modify unrelated modules
- silently fix unrelated errors

## 21. Validation

After every code modification:

- run JavaScript syntax validation
- check for obvious runtime errors
- verify references
- verify selectors
- verify variable scope
- verify imports/scripts
- verify existing functionality remains intact

If possible, use automated tests.

If browser testing is available, test the affected workflow.

## 22. Error Handling

When an error occurs, do not immediately rewrite the component.

First determine:

1.  Which file generated the error?
2.  Which line?
3.  Which variable/function is missing?
4.  Why is it missing?
5.  Is the problem local or caused by another module?
6.  Is the data shape correct?
7.  Is the script loaded in the correct order?

Then fix the root cause.

## 23. Future Production Plan

Long-term architecture:

CLIENT PORTAL -\> SUPABASE AUTH -\> SUPABASE DATABASE -\> SUPABASE
STORAGE

Future capabilities may include real authentication, role-based access,
team permissions, real client records, journeys, document storage,
document expiry tracking, payment records, payment verification,
official receipts, messaging, notifications, audit logs, financial
reporting, secure file storage, and client activity history.

Do not implement future features prematurely.

The current priority is to make the local prototype stable and
structurally ready for migration.

## 24. Development Priority

Prioritize:

1.  Stability
2.  Data integrity
3.  Existing workflow correctness
4.  Admin/Client synchronization
5.  Finance accuracy
6.  Document workflow
7.  Access control
8.  UI refinement
9.  Production migration preparation

Do not prioritize cosmetic improvements over functional integrity.

## 25. Change Report

After every task, report:

FILES CHANGED:

- filename
- filename

WHAT CHANGED:

- short description

WHY:

- reason for change

VALIDATION:

- syntax check
- test result

POTENTIAL FOLLOW-UP:

- only if genuinely necessary

Do not include unrelated suggestions unless requested.

## 26. Golden Rule

The project is already working in many areas.

PRESERVE WHAT WORKS.

UNDERSTAND BEFORE EDITING.

MAKE SURGICAL CHANGES.

TEST AFTER CHANGES.

DO NOT REBUILD THE SYSTEM JUST TO FIX ONE PROBLEM.
