# Recruiting Season Accelerator Application

Unified program microsite and application portal for Kelly Chen's eight-person 2026
Recruiting Season Accelerator founding cohort.

## What this repository contains

- A responsive program-details landing page
- A coordinated, accessible five-step React application
- Structured recruiting-funnel metrics and cohort-fit questions
- A lightweight future-cohort interest form
- Program FAQ, Participant Terms, Privacy Notice, and Refund Policy routes
- Cloudflare Pages Function submission handling
- Cloudflare Turnstile server-side verification
- D1 application-record storage
- Private R2 PDF-resume storage
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
| `/refund` | Refund and Feedback Credit Policy |

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
     `0004_refine_application_fit_and_acknowledgements.sql`
   - Existing production databases that already have migrations `0001` through
     `0003` should run only migration `0004` before the updated site is deployed
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

Apply `VITE_TURNSTILE_SITE_KEY` to both production and preview builds if previews
need working submissions. Restrict production submissions to the production
hostname in the Turnstile widget.

Deploy again after adding bindings or environment variables.

For the complete production setup and pre-LinkedIn verification sequence, follow
[`docs/cloudflare-launch-checklist.md`](docs/cloudflare-launch-checklist.md).

## Founding-cohort timeline

- Applications open July 24, 2026
- Applications are reviewed on a rolling basis
- Applications close July 30 at 11:59 PM ET or earlier if all eight seats fill
- Final decisions are planned by July 31
- The August 1 kickoff is tentative and proceeds only if the cohort is confirmed
- The price is $99; scholarship seats are not available for the founding cohort

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
- The application stores recruiting-market and target-list context along with an
  adult-confirmation flag, acknowledgement timestamp, and terms version. It does
  not store each presentation-layer commitment checkbox as a separate column.
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
