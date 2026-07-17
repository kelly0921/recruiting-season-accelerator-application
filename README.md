# Recruiting Season Accelerator Application

Unified program microsite and application portal for Kelly Chen's six-person 2026
Recruiting Season Accelerator founding cohort.

## What this repository contains

- A responsive program-details landing page
- A coordinated, accessible five-step React application
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
| `/apply` | Founding-cohort application |
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
| Project name | `kelly-recruiting-accelerator-apply` |
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
   - Run `migrations/0001_create_applications.sql` against the production database

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

## Privacy and operations

- Restrict Cloudflare dashboard access to Kelly and explicitly authorized operators.
- Review applications in D1; retrieve resumes from the private R2 bucket only when
  needed for selection.
- Delete rejected applicant data within 60–90 days unless the applicant separately
  joins an updates list.
- Do not place applicant names, emails, school information, resume details, or form
  responses in analytics.
- The form does not collect payment information.

## Validation

```bash
npm test
npm run build
```
