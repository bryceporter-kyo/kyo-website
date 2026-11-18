# KYO Grants Management App: Build Spec

**Author:** Bryce Porter (Board Chair, KYO) · **Status:** Draft v2 · **Date:** November 17, 2026

## 1. Purpose and Principles

A standalone grants platform at grants.thekyo.ca that tracks every funder and grant for KYO and KCMC from first prospect through award, reporting and renewal. It stores the funder research, creates and organizes the Drive folders and documents, publishes application answers to the public case-for-support pages, and drives a shared Google Calendar so nothing is missed.

**Principles**

- **The Google Doc is the writing surface.** Answers are written in a Google Doc and pulled into the app. A pull overwrites the stored answers. There is no answer version history.
- **The app is a grant tracking tool, not a financial tool.** It records amounts for reporting but keeps no ledgers, balances or paid-versus-owed totals.
- **Structured fields wherever possible.** Anything that can be a standard field is one, so the data stays clean and filterable. Notes are only for what does not fit a field.
- **Documents are not stored in the app.** Uploads pass through to the grant's Drive folder. The app keeps the link.
- **Calendar only for notifications.** The app sends no email of its own. Reminders live on the shared calendar.
- **Deterministic logic.** Duplicate detection and urgency are calculated by rules, not by AI.

**Out of scope:** answer version history, in-app answer editing, submission to funders, accounting or payment reconciliation, and email notifications. Email-to-add quick-add is a future phase (section 13).

## 2. Users and Access

The KYO admin panel already holds per-user permission flags: Admin Panel and KYO Internal. This project adds a third flag, **Grants Portal**. Anyone with it has full access to every part of the grants app. There are no separate roles.

- Sign-in uses the existing KYO account system, and the grants app reads the Grants Portal flag.
- The assigned-owner dropdown on each grant lists only users with the Grants Portal flag.
- The app sits on its own subdomain and is not indexed by search engines.
- Public grant pages need no sign-in (section 12).

## 3. Funders and Programs

A funder is its own record, shared across every grant from that funder. A funder is an umbrella over one or more **programs**. A funder with no programs acts as its own single program until a second is added. At that point the app asks you to name the original one, for example "General Fund", and existing grants stay attached to it. Behind the scenes every grant points at a program, so reports and filters work the same either way.

**Funder fields**

- **Name**, stored in sort form (see below)
- **Classification:** type (private foundation, government, corporate, community foundation), geographic scope (local, provincial, national), focus areas (multi-select: youth, music, arts education, others you add)
- **Location:** city, province, country
- **Links and contacts:** website and other links; contacts with name, role, email and phone, plus a calculated flag for whether contact information is on file
- **Funding history, calculated from linked grants:** funded before (yes or no), total won to date, first and most recent year funded, counts of applications submitted, won and lost. For funders that predate the app, funded-before and total-won can be entered by hand until grants exist.
- **Eligibility notes**
- **Triage status:** Unreviewed, Prospect, or Rejected

**Program fields**, each program carries its own: name, application cycle (months open and close, recurring or not), typical award range (minimum and maximum), eligibility notes, link, and key dates. A grant inherits from its program, and the funder's values are the fallback.

**Contacts and links** can be attached to the funder, to a program, or to a specific grant. All three are acceptable.

**Quick-add:** needs only a name. A website is optional. Everything else is filled in later.

**Name sorting:** leading articles move to the end so funders file under the right letter, for example "The Jackman Foundation" becomes "Jackman Foundation (The)" and sorts under J. The default word list is The, A, An, Le, La, Les and L'. It is editable in admin settings.

**Duplicate detection:** runs on every new funder from quick-add, manual entry or CSV import. It is a deterministic algorithm on the normalized name (articles removed, case and punctuation ignored, and close spelling matches by edit distance), plus an exact website domain match. A likely match shows the existing record and offers **Merge** or **Continue adding**. It also checks rejected funders, and if one matches it shows the rejection reason and offers to restore it or leave it rejected.

**Triage:** funders arriving by CSV or quick-add start as Unreviewed in a queue on the Funders screen. Someone sorts each one manually into **Reject** or **Make Prospect**. Make Prospect creates a grant at the Prospect stage. Reject requires a reason (not eligible, wrong focus, too small, other). Rejected funders stay in the database, hidden from the main lists but searchable.

## 4. Grants and Stages

A grant is one application to one funder program. Stages are configurable and ordered from an admin screen, and every screen shows them in that order. The default list is below. Some stages require a field before a grant can be saved there.

| # | Stage | Required on entry | Files created |
| --- | --- | --- | --- |
| 1 | Prospect | none | none |
| 2 | Researching | none | none |
| 3 | Qualified: Timing Not Right | Return To date | none |
| 4 | Qualified: To Apply | none | none |
| 5 | Writing LOI | none | Folder, LOI Letter, optional LOI Questions doc |
| 6 | LOI Submitted | Submitted On date | Folder if missing |
| 7 | Drafting | questions for the Q&A doc | Folder if missing, Q&A doc |
| 8 | In Review (internal) | none | Folder if missing |
| 9 | Submitted: Pending Decision | submission date | none |
| 10 | Closed: Won: Multi-Year | number of years, Renewal Date | none |
| 11 | Closed: Won: Single-Year: Reapply | Renewal Date, optional Exclusion Period | none |
| 12 | Closed: Lost: Not Qualified | none | none |
| 13 | Closed: Lost: Reapply | Return To date | none |
| 14 | Cancelled: Not Qualified | none | none |
| 15 | Cancelled: Poor Fit | none | none |
| 16 | Archived | none | none |

**File creation rule:** moving a grant to Writing LOI, LOI Submitted, Drafting or In Review automatically creates its Drive files if they do not exist (section 6). Moving to a later stage (Submitted onward) never creates files. It only updates files that already exist. A **Create Grant** button also lets someone create the files by hand at any earlier stage.

**Date-driven behavior**

- **Qualified: Timing Not Right:** the Return To date creates a calendar reminder. A grant with a future Return To date sits at the bottom of the home table. On the date, the app moves it to Qualified: To Apply, logs the change, and moves it to the top of the table.
- **Closed: Lost: Reapply:** on the Return To date, the app creates a new grant from the old one, as the New Grant button does (below). It starts at Qualified: To Apply, creates no Drive files, and goes to the top of the home table. The old grant stays Closed: Lost: Reapply as history, and its Return To date is marked used so it cannot trigger a second clone.
- **Closed: Won: Single-Year: Reapply:** the Renewal Date works the same way, creating a new grant from the won one. An optional **Exclusion Period** blocks earlier renewal (section 5).
- **Closed: Won: Multi-Year:** requires the number of years. The Renewal Date defaults to the end of the final year and can be changed.
- **Cancelled stages and Archived:** these stop all activity on the grant. The app deletes every calendar event tied to it (Return To, Renewal, payment and reporting reminders). The grant, its audit log and its Drive files stay. If the grant's public page is published, it is unpublished automatically. Cancelled stages record why we stopped. Archived is a plain set-aside. A cancelled or archived grant can be moved back to an active stage by hand, which recreates the reminders from the dates still on the record.

**New Grant \[Current Year\]:** a button on any past grant. It starts a new application from the old one, carrying over the funder, program, contacts and question list. A checkbox at clone time chooses whether previous answers prefill the new doc or it starts blank. The new grant gets its own folder in the current year, and the old grant is untouched. Both audit logs record the link.

## 5. Grant Record Fields

Everything below is a standard, preconfigured field so the data stays clean. Custom notes are only for what does not fit.

**Core**

- Funder and funder program
- Stage, and the date it was entered
- **Assigned owner**, chosen from users with the Grants Portal flag. The owner is invited to every calendar event for the grant.
- **KYO programs supported:** a multi-select dropdown seeded with The Orchestras, Upbeat!, Chamber Music and Lessons, plus an Other option. Anything typed under Other is added to the list for everyone. A custom entry disappears automatically once no grant uses it. The four starting programs are permanent.
- Dates: started, application deadline, LOI submitted on, submitted, decision, date awarded, period covered (start and end). The application deadline drives a calendar event and the home table's ordering.
- Links to the Drive folder and documents (set automatically, or pasted for grants entered by hand)
- Public page slug and published status

**Money**

- **Amount requested**
- **Amount awarded**, entered in one of two modes chosen per grant. In **Total value** mode you enter the total and each year defaults to the total divided by the number of years, with optional overrides. In **Per-year value** mode you enter each year's amount and the total is their sum.
- **Program split:** awarded money is split equally across the KYO programs supported by default, and you can override it (for example 60/40). The split must add up to the awarded amount, and the app warns if it does not. Changing the program list re-splits equally unless custom amounts were set.
- **Fiscal-year allocation:** year one is the fiscal year containing the period start date, and later years follow in sequence. The program split applies within each year.
- Restrictions on the funds (standard field plus optional detail)

**Payments:** a repeatable record, not an accounting ledger. Each payment has an expected date, which drives its calendar reminder, an optional expected amount, a status of Expected or Received, a received date and amount, a method (cheque, transfer or other), a reference number (cheque or transfer number) and an optional note. The app keeps no balances or paid-versus-owed totals.

**Reporting obligations:** a repeatable record with a due date and a type from a managed list (Interim Report, Final Report, Financial Report, Site Visit, Other). Each creates a calendar event with the owner invited. Ticking one as completed records the completion date, lets you link the uploaded report, and removes its reminder, so the home table shows only what is outstanding.

**Renewal and exclusion**

- **Return To date** and **Renewal Date** (see section 4)
- **Exclusion Period** on Won: Single-Year: Reapply, for funders that limit awards to once every few years. Set it either by choosing a starting point (award date, start of the grant period, or end of the grant period) plus a number of years, or by entering the expiry date directly. The grant shows one **Ineligible until** date. A calculated date updates if its starting date changes, and an entered date stays as set. The Renewal Date cannot be earlier than Ineligible until and defaults to it. Starting a new grant for that funder program inside the window shows a warning, and the person can continue anyway.

## 6. Google Drive Structure and Naming

**Authorization:** OAuth with a KYO Google Workspace account, or a service account with delegated access, holding only the scopes needed for Drive, Docs and Calendar. Credentials stay server-side.

**Folder structure**

- The root is the existing **Grant Applications** folder.
- Inside it is **one folder per year**. The year is the calendar year in which the application was **started**, meaning the day its files were first created. It is not the year the funder is funding. Year folders are named YYYY, for example 2026. Every other date uses MMDDYYYY.
- Inside each year folder is **one folder per grant**, with no subfolders beneath it.

**Grant folder name:** `[Funder]: [Date Submitted]: [Status]`

- The date is written as MMDDYYYY and is blank until the grant is submitted. The status is blank until it is submitted, then updated to Closed: Won, Closed: Lost: Not Qualified, Closed: Lost: Reapply, or a Cancelled stage. Both Won outcomes show as Closed: Won.
- The app **renames the folder automatically** whenever the submission date or status changes. If a grant has no folder, only the stage changes.
- Funder names in folder names use the plain form, not the sort form with the article moved.

**Document names (flat in the grant folder):** `[Funder]: [Document Name]: [Upload Date MMDDYYYY]`. The document name is picked from a managed list in section 14 and the date is filled in automatically. Custom-named types ask for a name when the file is added. Supporting Document uses that name in place of the type, as \[Funder\]: \[Custom Name\]: \[Date\]. Quote, Receipt and Estimate put the name after the type, as \[Funder\]: Quote: \[Custom Name\]: \[Date\].

**When files are created**

- Moving to Writing LOI, LOI Submitted, Drafting or In Review creates the grant folder if it does not exist, plus the documents that belong to that stage.
- Clicking **Create Grant** creates the folder and the Q&A doc at any earlier stage, in the year folder for the day of the click.
- **Uploading any document** to a grant with no folder creates the folder first, named for the funder with date and status blank, in the year folder for the day of the upload. Uploads are a universal way to store files and keep everything organized automatically.
- Moving to Submitted: Pending Decision or any later stage never creates files. Existing folders are only renamed.
- If the year folder does not exist, the app creates it first.
- Clones created by Return To or Renewal dates create no Drive files until one of the rules above fires.

**Existing grants:** applications from before the app are entered by hand. When creating the record, paste the link to the existing Drive folder and doc and the app links to them instead of creating new ones. There is no automatic import of existing folders. A CSV import by Drive ID is available (section 13).

## 7. Documents, Q&A and Formatting Sync

Each grant can have up to three generated Google Docs, all flat in the grant folder under the naming schema.

| Document | When created | Content |
| --- | --- | --- |
| LOI Letter | Moving to Writing LOI | Copy of the KYO Letter Head Template, blank |
| LOI Questions | Only if the funder has LOI questions. The app asks on entering Writing LOI. | Two-column table: question, then empty answer |
| Application Q&A | Drafting, or Create Grant. The app first asks for the questions, pasted in or loaded from CSV. | Header line (funder, program, year, deadline), then a two-column table |

The letterhead template is a Google Doc whose ID is set in admin settings (section 14). The Q&A doc may also use a template ID, so its look can change later.

**Questions:** each question keeps its order and may carry an optional length limit, shown in parentheses after the question text. A grant cloned from an earlier one starts with the same question list.

**Pull from Doc:** the app reads the table in the Q&A or LOI Questions doc. Column one is the question and column two is the answer. Rows match stored questions by position and by question text. If rows were added, removed or reordered, the app shows a preview of the mismatch before it overwrites. **Each pull overwrites the stored answers.** There is no version history. The doc is the source of truth and can be re-pulled at any time.

**Formatting:** answers keep the styling written in the doc and are stored as sanitized rich text.

- **Preserved:** bold, italics, underline, strikethrough, bulleted and numbered lists, hyperlinks, line and paragraph breaks.
- **Stripped:** fonts, sizes, colors, comments, images and embedded objects. Pending suggestions are ignored, and only accepted text is imported.

The public page renders answers in the KYO site's own typography, so the styling stays consistent.

## 8. Shared Calendar and Reminders

The app maintains one shared Google Calendar named **KYO Grants** that anyone at KYO can subscribe to. The portal does not embed the calendar. It shows a list of upcoming events, sorted by soonest date, so the live view of what is coming sits inside the app.

**Events the app creates**

- Return To dates
- Renewal dates
- Payment expected dates
- Reporting due dates (all types)
- Submission deadlines

**Rules**

- Each event is created with the assigned owner invited, and with a reminder on the day of. The calendar is the only notification channel. The app sends no email of its own.
- Changing or removing a date on a grant updates or deletes its event. Completing a reporting item removes its event.
- Moving a grant to a Cancelled stage or Archived deletes all of its events. Moving it back to an active stage recreates them from the dates on the record.
- Changing the assigned owner updates the invitee on every open event for the grant.
- Every event carries a link back to the grant in the portal.

## 9. Notes, Uploads and Audit Log

**Notes:** a dated contact log on each grant and funder. Each note records the date, who at the funder was spoken to, who from KYO spoke to them, and what was said. Notes are for what does not fit a standard field.

**Uploads:** documents can be uploaded at any stage of a grant, including the grant agreement. They pass through to the grant's Drive folder under the document naming schema, and the app stores only the link. If the grant has no folder, one is created on upload (section 6). The grant agreement is not kept in the app. After it is attached, the structured fields in section 5 are entered from it, and any custom obligations go in notes.

**Audit log:** every grant has its own read-only log. Each entry records who made the change, when, and what changed from the old value to the new one. It covers stage changes, field edits, publishing and unpublishing, document uploads, doc pulls, calendar changes, and clones. Nobody can edit or delete entries. Funder changes (rejection, merge, edited programs) are logged on the funder record, and the ones that affect a grant also appear in that grant's log. The audit log is separate from answers, which stay overwrite-only.

## 10. Home Screen, Search and Filters

**Home screen:** opening grants.thekyo.ca shows one table of all grants. Cancelled and Archived grants are hidden by default and shown through the stage filter. Reports can include them with a toggle.

- **Sort order:** grants with a date due today or overdue first, then by the nearest upcoming date. A grant with a future Return To date sits at the bottom so it does not crowd active work. On the date it moves to the top.
- **Columns:** funder and program, stage, assignee, next date and what it is for, amount requested and awarded, and an urgency indicator.
- **Urgency** is calculated from days remaining to the grant's next date, with overdue first. It is not set by hand.
- **Notifications** are date-triggered. A note to return on June 30 stays quiet until June 30, then surfaces on the home screen. The calendar event fires on the same day.

**Search and filters:** every field below can be filtered, as a single value or multiple values, and filters combine. For example, year 2026 plus awarded between $5,000 and $10,000 returns only grants that match both.

- Stage, funder, funder program, funder type, geographic scope, focus area
- Year, as either **calendar year** or **fiscal year** (section 11)
- Amount requested and amount awarded (range)
- KYO program supported
- Assignee
- Date ranges: started, submitted, awarded, Return To, Renewal, Ineligible until
- Whether the grant has a published public page. Also funder details: location, funded before, total won, whether contact information is on file, and application cycle months
- **Q&A text search** as an optional advanced filter. It searches the latest stored questions and answers (for example "music therapy") and combines with the structured filters. Results show the matching passage and link to the grant and its Google Doc.

Filters can be saved by name, for example "Qualified: Timing Not Right, returning this spring". Rejected funders are hidden from the main lists and searchable on request.

## 11. Fiscal Year and Reports

**Fiscal year:** runs July 1 to June 30 to follow the program year, so a grant awarded in October 2026 counts toward 2026-27. Calendar year is also available. The year filter, the reports and the AGM summary have a toggle between the two. The Drive folders always use the calendar year in which the application was started.

**Default reports.** Both use the same filters as the search screen, so they can be run for a specific year, program or funder. Each is exportable as a Google Doc (saved to the Grant Applications folder), Markdown, and PDF. Cancelled and Archived grants are excluded by default and can be included with a toggle.

**1. Grants Performance Report (all grants)**

- Success rate: wins, losses and pending, as counts and percentages, overall and by year, funder, funder type and KYO program
- Requested versus awarded: totals and percentage awarded, in the same breakdowns
- Funding by program, using the equal or custom splits
- Funding by fiscal year, using the per-year allocation on multi-year grants
- Pipeline snapshot: number and value of grants at each stage
- Closed: Lost split into Not Qualified and Reapply
- Top funders by total awarded
- Year-over-year trend

**2. AGM Summary (high level)**

- Grants applied for, won, and total dollars awarded for the chosen year
- Funding by program
- Notable new funders and renewals
- A short list of what is still pending

The AGM summary covers one year chosen at run time and defaults to the current fiscal year.

## 12. Public Grant Pages

Published grants render as public pages on the KYO website, generated dynamically from the existing grant page template, reused for every grant, and fills in the questions and answers for that grant.

**URL:** `case-for-support/grant/[year]/[funder-slug]`, where the year is the year the grant was generated, for example 2026. Slugs are lowercase, hyphenated and stripped of punctuation. If two grants share a funder and year, the program name or a numeric suffix is appended. Slugs are generated automatically, can be edited by hand until the first publish, and stay fixed after that so links never break.

**Publishing is manual, in both directions.** Someone toggles Published and Unpublished on each grant. Publishing is not tied to the stage, with one exception: moving a published grant to a Cancelled stage or Archived unpublishes its page automatically and logs it. Republishing stays manual. There are no live pages today, so there is nothing to migrate.

**Indexing:** every generated page carries a **noindex, follow** robots tag. Pages are not added to the sitemap and need no SEO metadata. Leaving a page live is therefore low risk.

**Visibility:** only published grants are served and unpublished grants return a 404. A per-question public flag hides individual answers, for example internal budget notes.

**Update speed:** a pull from the doc refreshes the live page within a minute or two, using incremental regeneration rather than a full redeploy.

## 13. CSV Imports

There are no automatic Drive imports. Two CSV imports cover bulk loading, and both show a **preview** of what will be created, merged or skipped, with any error rows flagged, before anything is saved. Both run the duplicate check on every funder row.

- **Funder and grant import:** loads funder details (name, type, scope, focus areas, location, links, contacts, application cycle and so on), programs (one row per program under a funder), and grants linked to existing Drive folders and docs by Drive ID.
- **Prospective funder import:** only the name is required. Every other funder field is optional and loads if present. Each row creates a funder record only, with no grant, in the Unreviewed triage queue (section 3).
- **Question CSV:** the existing question template still loads a grant's question list (section 7).

**Future phase, email quick-add:** an Apps Script, like the one already used for tax receipt emails, could watch a mailbox (for example add@grants.thekyo.ca) and create a quick-add funder from each email. This is not part of the first build.

## 14. Admin Settings

Every configurable value lives on one Settings screen in the portal, so no stage, list or ID is hard-coded.

**Access:** the Grants Portal permission flag in the existing admin panel, set per user next to Admin Panel and KYO Internal. There are no roles inside the portal: anyone with the flag has full access. The assigned-owner dropdown lists users who hold the flag.

**Connections**

| Setting | What it holds |
| --- | --- |
| Grant Applications folder | Drive ID of the root folder that holds the year folders |
| KYO Letter Head Template | Template ID of the Google Doc copied for each LOI Letter |
| Q&A document template | Optional template ID for the two-column question documents |
| KYO Grants calendar | ID of the shared calendar the app writes to |
| Fiscal year start | July 1, so the fiscal year ends June 30 |

**Managed lists**

| List | Starting values | Behaviour |
| --- | --- | --- |
| Stages | The default stage list in section 4 | Reordered by dragging. Each stage sets its required date, whether it creates files, and its folder status text |
| KYO programs | The Orchestras, Upbeat!, Chamber Music, Lessons | The four are permanent. Entries typed under Other are added for everyone and removed automatically once no grant uses them |
| Funder type | Private foundation, government, corporate, community foundation | Editable |
| Geographic scope | Local, provincial, national | Editable |
| Focus areas | Youth, music, arts education | Editable, multi-select on funders |
| Reporting types | Interim Report, Final Report, Financial Report, Site Visit, Other | Editable |
| Payment methods | Cheque, transfer, other | Editable |
| Rejection reasons | Not eligible, wrong focus, too small, other | Editable. A reason is required to reject a funder |
| Document types | Grant Agreement, LOI Letter, LOI Questions, Application Q&A, Report, Correspondence, Budget, Financial Statements, Board List, Receipt, Quote, Estimate, Supporting Document | Editable. The type is the middle part of every document file name. A type can be flagged as custom-named, so the app asks for a name when the file is added (see section 6) |
| Leading words | The, A, An, Le, La, Les, L' | Moved to the end of funder names so they file correctly, for example "Jackman Foundation (The)" |

## 15. Technical Architecture and Security

The portal is a standalone app at grants.thekyo.ca. The public KYO site only reads published grants from it, and holds no write access.

**Suggested stack:** Next.js with TypeScript, using the existing KYO Firebase project (Auth and Firestore) rather than a new one. The Next.js choice is an assumption to confirm. Google Drive, Docs and Calendar are called from server-side routes only.

**Sign-in:** Sign-in through the existing KYO account system, checked against the admin panel's user list and the Grants Portal flag. Removing the flag removes access on the next request.

**Main records**

- Funder, Program, Contact, Link
- Grant, with its program splits, yearly amounts, payments, reporting obligations, notes, documents and audit entries
- Settings: stages and the managed lists in section 14

**Scheduled job:** one job runs each morning. It finds grants whose Return To or Renewal Date is today, moves or clones them as described in section 4, and marks each date as used so it can never fire twice. It also refreshes the home table's date-driven ordering.

**Calendar sync:** the app creates, updates and deletes events on the KYO Grants calendar whenever a date, stage, owner or completion state changes. Each event carries a reminder on the day of and invites the assigned owner. Moving a grant to a Cancelled stage or Archived deletes all of its events.

**Drive sync:** the app renames a grant's folder whenever its submission date or status changes. It creates the folder on first need: Create Grant, a file-creating stage, or an upload.

**Duplicate check:** a deterministic comparison of normalized funder names, with no AI. It runs on quick-add, imports and restores, and also compares against rejected funders.

**Security**

- Drive, Docs and Calendar credentials stay on the server and never reach the browser.
- Imported answer text is sanitized before it is stored and again before it is rendered.
- Audit entries are append-only: nobody can edit or delete them.
- The portal sends noindex headers, and every generated grant page carries a noindex, follow robots tag.
- Uploaded files go straight to Drive. The app stores only the link, type and upload date.

## 16. Build Phases

1. **Foundation.** The app, sign-in with the Grants Portal flag, the Settings screen, stages and managed lists, funders and programs, quick-add, duplicate check, triage and rejection.
2. **Grants core.** Grant records with all structured fields, money and program splits, yearly amounts, payments, reporting obligations, contacts, notes, the audit log, the home table, and search with combinable filters.
3. **Drive and Docs.** Folder creation and renaming, document naming, uploads, Create Grant, the Q&A doc, both LOI documents, Pull from Doc and formatting sync.
4. **Calendar and date-driven actions.** The shared KYO Grants calendar, events and invitees, Return To and Renewal handling, the daily job, clones, and cancellation clean-up.
5. **Public pages.** The shared template, the manual publish and unpublish controls, and the noindex, follow tag.
6. **Imports and reports.** Both CSV imports with preview, the Grants Performance Report and the AGM Summary, and exports to doc, Markdown and PDF.
7. **Later.** Email-to-add quick-add through the existing Apps Script.

## 17. Acceptance Criteria

- Quick-add takes a funder name alone, and a likely duplicate, including a rejected funder, triggers the merge or continue prompt with the rejection reason shown.
- "The Jackman Foundation" is stored and listed as "Jackman Foundation (The)" under J.
- A foundation with no programs behaves as its own program. Adding a second program prompts for the first one's name.
- Moving a grant to Writing LOI, LOI Submitted, Drafting or In Review creates the folder if it is missing, plus that stage's documents.
- Moving a grant to Submitted, either Won outcome, either Lost stage, Archived or either Cancelled stage never creates files, and renames the folder if one exists.
- Uploading a document to a grant with no folder creates the folder, and the file is named "\[Funder\]: \[Document Name\]: \[Upload Date (MMDDYYYY)\]".
- A stage with a required date, number of years or renewal date cannot be saved without it.
- Qualified: Timing Not Right with a Return To date sits at the bottom of the home table until that date, then moves to Qualified: To Apply and to the top, and the move is logged.
- A Closed: Lost: Reapply or Won: Single-Year: Reapply date creates a new grant from the old one exactly once, and the old grant stays as history.
- Every dated item creates an event on the KYO Grants calendar with a day-of reminder and the owner invited. Cancelled stages and Archived delete all of a grant's events.
- Total value and per-year value modes both work, and the yearly amounts and program splits warn when they do not add up.
- A second pull from the Google Doc overwrites the stored answers with no leftover content, and bold, italics, lists and links carry over.
- Q&A text search works as an optional filter and combines with the structured filters.
- Publishing and unpublishing are manual, except that moving a published grant to a Cancelled stage or Archived unpublishes it automatically. The slug is locked after the first publish.
- Both CSV imports show a preview and apply the duplicate check before anything is saved.
- Both default reports run for fiscal year or calendar year and export as doc, Markdown and PDF.
- Every change appears in the grant's audit log, and no entry can be edited or deleted.
- Nobody without the Grants Portal flag can reach the portal.

## 18. Open Questions

- For the developer: how does the admin panel store its users and permissions (for example a Firebase Auth claim or a Firestore collection), so the portal can read the Grants Portal flag? The admin panel already has a screen for managing them.
