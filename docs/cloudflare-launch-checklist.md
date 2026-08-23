# Cloudflare and LinkedIn Launch Checklist

Use this checklist before announcing Recruiting Season Accelerator publicly.
The production form, Cloudflare bindings, Turnstile variables, and storage are
configured. Use the checks below to verify them before the public announcement.

## 1. Confirm the Public Timeline

The website currently communicates:

- Applications open August 24, 2026
- Applications close August 31 at 11:59 PM ET
- Decisions are planned for September 3
- Asynchronous onboarding runs September 3–14
- The fall-semester cohort runs September 14–December 15
- The high-touch four-week intensive runs September 14–October 11
- Monthly check-ins and lightweight product feedback continue October 12–December 15
- Eight students may join the founding mentorship cohort, with two alternates
- The founding mentorship cohort is free

ApplyFirst beta and conference-material interest outside the mentorship cohort will
use a separate form. Do not add those sign-ups to the mentorship application.

Before posting on LinkedIn, confirm the group-session dates and times that accepted
mentees will receive during selection and onboarding.

## 2. Create the D1 Application Database

In the Cloudflare dashboard:

1. Open **Storage & Databases → D1 SQL Database**.
2. Create a database named `rsa-applications`.
3. Open its **Console**.
4. Run these files in numerical order:
   - `migrations/0001_create_applications.sql`
   - `migrations/0002_create_future_cohort_interest.sql`
   - `migrations/0003_refine_application_selection.sql`
   - `migrations/0004_refine_application_fit_and_acknowledgements.sql`
   - `migrations/0005_add_conference_interest.sql`
   - `migrations/0006_add_beta_interest.sql`
   - `migrations/0007_create_stage_one_application_fields.sql`
5. Open **Workers & Pages → recruiting-accelerator-apply → Settings → Bindings**.
6. Add a **D1 database binding**:
   - Variable name: `APPLICATIONS_DB`
   - Database: `rsa-applications`
   - Environment: Production

The D1 database stores the application answers and future-cohort interest-list
records. It does not store the resume file itself.

The production database bound to the current Pages site was updated through
`0007_create_stage_one_application_fields.sql` and verified on August 23, 2026.
Do not rerun that migration there. Run it once only when updating another database
that already has migrations `0001` through `0006`. The existing D1 binding, R2
bucket, and Turnstile keys do not need to be replaced.

## 3. Create Private Resume Storage

In Cloudflare:

1. Open **R2 Object Storage**.
2. Create a bucket named `rsa-application-resumes`.
3. Keep public access disabled.
4. Return to **Workers & Pages → recruiting-accelerator-apply → Settings → Bindings**.
5. Add an **R2 bucket binding**:
   - Variable name: `RESUMES_BUCKET`
   - Bucket: `rsa-application-resumes`
   - Environment: Production

Resumes are saved under `founding-cohort-2026/<application-id>.pdf`. The D1 row
stores the corresponding private object key.

## 4. Configure Cloudflare Turnstile

1. Open **Turnstile** in Cloudflare.
2. Create a widget for `recruiting-accelerator-apply.pages.dev`.
3. Use the managed widget mode.
4. Copy the site key and secret key.
5. In **Workers & Pages → recruiting-accelerator-apply → Settings → Environment Variables**, add:

| Variable | Type | Value |
| --- | --- | --- |
| `VITE_TURNSTILE_SITE_KEY` | Plaintext | Turnstile site key |
| `TURNSTILE_SECRET_KEY` | Secret | Turnstile secret key |

Set both for Production. The site key is intentionally public; the secret key
must remain encrypted and must never be committed to GitHub.

## 5. Redeploy After Configuration

`VITE_TURNSTILE_SITE_KEY` is inserted during the frontend build, so adding the
variable is not enough by itself.

1. Open the Pages project's **Deployments** tab.
2. Retry the latest production deployment, or push a new commit to `main`.
3. Wait for the production deployment to succeed.
4. Open `https://recruiting-accelerator-apply.pages.dev/apply`.
5. Confirm the Turnstile widget appears and the final submit button is enabled
   during the application window.

## 6. Run One Controlled End-to-End Test

Before sharing the LinkedIn post:

1. Submit one application using an email such as
   `kellychenmeiyi+launch-test@gmail.com` and a small test PDF.
2. Confirm the success screen displays an application reference.
3. In the D1 console, run:

```sql
SELECT
  id,
  submitted_at,
  status,
  full_name,
  email,
  graduation_date,
  academic_stage,
  roles_exploring,
  fall_goal,
  obstacles,
  recent_action,
  kelly_question,
  conference_interest,
  beta_interest,
  adult_confirmed,
  acknowledgements_accepted_at,
  terms_version
FROM applications
ORDER BY submitted_at DESC;
```

4. Confirm the test row appears.
5. Open the private R2 bucket and confirm the matching PDF exists under the
   `founding-cohort-2026/` prefix.
6. Test `/interest` once and confirm the record appears with:

```sql
SELECT
  submitted_at,
  full_name,
  email,
  graduation_year,
  opportunity_interest,
  preferred_timing
FROM future_cohort_interest
ORDER BY submitted_at DESC;
```

7. Remove the test records and test PDF after verification so they are not
   confused with real applicants.

## 7. Know How Applications Will Be Reviewed

There is currently no private application dashboard and no automatic email
notification when someone submits. During the application window:

- Check the `applications` D1 table at least once each day.
- Review the associated resume from the private R2 bucket.
- Update the D1 `status` field manually as applications move through review.
- Do not download resumes onto shared or public devices.
- Do not export applicant data into public analytics or public spreadsheets.

An owner-only review dashboard or submission notification can be added later,
but it is not required for a small eight-person founding cohort if the D1 table
is checked consistently.

## 8. Prepare the Private Operational Links

Do not publish these on the landing page or in the LinkedIn post:

- Stripe payment link
- Zoom meeting link
- Scheduling links
- Private cohort-space invitation
- Participant documents or resume links

Send scheduling and onboarding information only after acceptance. Do not request
payment information; the Fall 2026 founding mentorship cohort is free.

Create the two private post-decision forms described in
[`post-acceptance-forms.md`](post-acceptance-forms.md) before decisions are sent.
Do not add those detailed questions back to the public Stage 1 application.

## 9. Final LinkedIn Preflight

Immediately before posting:

- Open the landing page, `/apply`, `/faq`, and all policy pages.
- Submit the controlled test described above.
- Confirm the August 24–31 application window, September 3 decision date,
  September 14 start, eight mentorship spots, and free pilot are consistent.
- Confirm Kelly's portfolio links to the Cloudflare landing page—not the retired
  `chatgpt.site` version.
- Check that the LinkedIn post links to
  `https://recruiting-accelerator-apply.pages.dev/`.
- Clarify that conference interest is a positive fit signal, not a requirement.
- Confirm the mentorship application does not collect separate ApplyFirst beta or
  conference-material registrations.
