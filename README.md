# Recruiting Season Accelerator Application

Unified program microsite and application portal for Kelly Chen's free Fall 2026
Recruiting Season Accelerator founding mentorship cohort application.

## What this repository contains

- A responsive program-details landing page
- A coordinated, accessible three-step React application designed for 7–10 minutes
- Concise cohort-fit, action-orientation, and commitment questions
- A lightweight future-cohort interest form
- Program FAQ, Participant Terms, Privacy Notice, and Cost Policy routes
- Cloudflare Pages Function submission handling
- Cloudflare Turnstile server-side verification
- D1 application-record storage
- Private R2 PDF-resume storage
- Transactional application-receipt email with delivery-status tracking
- Server-side validation and application-window enforcement

Applicant data, resumes, API secrets, payment links, and private program links must
never be committed to this repository.

## Public routes

| Route | Purpose |
| --- | --- |
| `/` | Program details |
| `/apply` | Founding-cohort application and closed-state handoff |
| `/interest` | Future-cohort interest form |
| `/faq` | Program questions |
| `/terms` | Participant Terms |
| `/privacy` | Privacy Notice |
| `/refund` | Cost and Participation Policy |

## Local development

```bash
npm install
npm run dev
```

The frontend can be reviewed locally. Full submission testing requires Cloudflare
bindings or a deployed Pages environment.

## Cloudflare Pages deployment

Connect this repository from **Workers & Pages → Create application → Pages →
Connect to Git**.

Use:

| Setting | Value |
| --- | --- |
| Project name | `recruiting-accelerator-apply` |
| Production branch | `main` |
| Framework preset | React (Vite) |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | leave blank |

### Required bindings

Create and attach these under the Pages project's **Settings → Bindings**:

1. **D1 database**
   - Create a database such as `rsa-applications`
   - Binding name: `APPLICATIONS_DB`
   - Run all SQL files in `migrations/` in numerical order against the production
     database, including `0003_refine_application_selection.sql` and
     `0004_refine_application_fit_and_acknowledgements.sql`, followed by
     `0005_add_conference_interest.sql`, `0006_add_beta_interest.sql`, and
     `0007_create_stage_one_application_fields.sql`, followed by
     `0008_add_confirmation_email_tracking.sql`
   - The production database for the current Pages site was updated through
     migration `0007` on August 23, 2026. Do not rerun it there.
   - The future-interest endpoint also creates its table safely if the second
     migration has not yet been run

2. **R2 bucket**
   - Create a private bucket such as `rsa-application-resumes`
   - Binding name: `RESUMES_BUCKET`
   - Do not expose the bucket publicly

### Required environment variables

Create a Cloudflare Turnstile widget for the production `pages.dev` hostname.
Add:

| Variable | Visibility | Purpose |
| --- | --- | --- |
| `VITE_TURNSTILE_SITE_KEY` | Plaintext | Renders the browser widget during the build |
| `TURNSTILE_SECRET_KEY` | Secret | Verifies tokens inside the Pages Function |
| `CLOUDFLARE_ACCOUNT_ID` | Plaintext | Selects the Cloudflare account used for Email Sending |
| `CLOUDFLARE_EMAIL_API_TOKEN` | Secret | Sends transactional email through the Email Sending REST API |
| `CONFIRMATION_FROM_EMAIL` | Plaintext | Onboarded sender, such as `mentorship@kellychen.dev` |
| `CONFIRMATION_REPLY_TO` | Plaintext | Address that receives applicant replies |

Apply `VITE_TURNSTILE_SITE_KEY` to both production and preview builds if previews
need working submissions. Restrict production submissions to the production
hostname in the Turnstile widget.

Deploy again after adding bindings or environment variables.

Cloudflare Pages Functions do not currently expose Email Sending as a supported
Pages binding, so the confirmation uses Cloudflare's server-side Email Sending REST
API. The API token is available only to the Pages Function and must never use a
`VITE_` prefix. Follow the email setup and test steps in
[`docs/cloudflare-launch-checklist.md`](docs/cloudflare-launch-checklist.md).

For the complete production setup and pre-LinkedIn verification sequence, follow
[`docs/cloudflare-launch-checklist.md`](docs/cloudflare-launch-checklist.md).

## Founding-cohort timeline

- Applications open August 24, 2026
- Applications close August 31 at 11:59 PM ET
- Decisions are planned for September 3
- Asynchronous onboarding runs September 3–14
- The fall-semester mentorship cohort runs September 14–December 15
- The high-touch four-week intensive runs September 14–October 11
- Monthly check-ins, continued resource access, and lightweight ApplyFirst and
  conference-playbook feedback continue October 12–December 15
- The Fall 2026 founding mentorship cohort is free

## Two-stage application model

The public `/apply` route is intentionally limited to the Stage 1 selection form.
It collects:

- Name, email, required LinkedIn URL, school, academic area, and graduation month/year
- Fall 2026 college year and confirmation that the applicant will be at least 18
- Roles or paths currently being explored
- One fall goal, up to two current obstacles, one recent action, and one question for Kelly
- Current conference stage without detailed conference information
- A required PDF resume
- Separate confirmations for workshops, intensive-phase work, individual sessions,
  the October–December check-in and feedback cadence, program limitations, and the
  participant terms

Detailed availability, ApplyFirst baselines, accommodations, conference logistics,
workshop preferences, and optional permissions are not part of the public application.
They belong in private post-acceptance onboarding. See
[`docs/post-acceptance-forms.md`](docs/post-acceptance-forms.md).

ApplyFirst beta access and conference-material interest outside the mentorship cohort
use separate sign-up forms and are not collected through `/apply`.

## Future-cohort interest form

The native form is available at `/interest`. It intentionally stays out of the
primary navigation while founding-cohort applications are active. After the
application deadline, program calls to action and the closed `/apply` state route
visitors to this form.

It collects:

- Full name and email address
- Optional school
- Expected graduation year
- Primary opportunity interest
- Optional preferred cohort timing
- Optional short note about the support the student is seeking
- Explicit consent to receive future cohort announcements

Submissions are validated in `/functions/api/interest.js`, protected by the same
Turnstile configuration as the application, and stored in the
`future_cohort_interest` D1 table. Duplicate email submissions are acknowledged
without creating duplicate records. The form does not request a resume, detailed
recruiting history, or payment information.

## Privacy and operations

- Restrict Cloudflare dashboard access to Kelly and explicitly authorized operators.
- Review applications in D1; retrieve resumes from the private R2 bucket only when
  needed for selection.
- The application stores the concise Stage 1 selection fields along with an
  eligibility-derived adult flag, acknowledgement timestamp, and terms version.
  It does not store each presentation-layer commitment checkbox as a separate column.
- Delete rejected applicant data within 60–90 days unless the applicant separately
  joins an updates list.
- Do not place applicant names, emails, school information, resume details, or form
  responses in analytics.
- Honor correction, deletion, and future-announcement removal requests sent to the
  program contact email.
- The form does not collect payment information.

## Validation

```bash
npm test
npm run build
```
