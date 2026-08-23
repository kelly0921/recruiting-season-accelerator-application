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
   - `migrations/0008_add_confirmation_email_tracking.sql`
5. Open **Workers & Pages → recruiting-accelerator-apply → Settings → Bindings**.
6. Add a **D1 database binding**:
   - Variable name: `APPLICATIONS_DB`
   - Database: `rsa-applications`
   - Environment: Production

The D1 database stores the application answers and future-cohort interest-list
records. It does not store the resume file itself.

The production database bound to the current Pages site was updated through
`0007_create_stage_one_application_fields.sql` and verified on August 23, 2026.
Do not rerun migrations `0001` through `0007` there. Run migration `0008` once to
add confirmation-email tracking before testing this feature. The existing D1
binding, R2 bucket, and Turnstile keys do not need to be replaced.

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

## 5. Configure Application Confirmation Email

Cloudflare Email Sending is currently available on the Workers Paid plan and
requires a domain using Cloudflare DNS. The Pages Function uses the Email Sending
REST API because Email Sending is not currently listed among the bindings supported
directly by Pages Functions.

1. Open **Compute → Email Service → Email Sending**.
2. Select **Onboard Domain** and choose `kellychen.dev`.
3. Let Cloudflare add the SPF, DKIM, bounce-handling, and DMARC records, then wait
   until the domain shows as ready.
4. Open **My Profile → API Tokens → Create Token**.
5. Create an account-scoped token with **Email Sending: Edit** and restrict it to
   the Cloudflare account that owns `kellychen.dev`.
6. Copy the Account ID from the Cloudflare dashboard.
7. In **Workers & Pages → recruiting-accelerator-apply → Settings → Variables and Secrets**, add these Production values:

| Variable | Type | Value |
| --- | --- | --- |
| `CLOUDFLARE_ACCOUNT_ID` | Plaintext | Your Cloudflare Account ID |
| `CLOUDFLARE_EMAIL_API_TOKEN` | Secret | The scoped Email Sending token |
| `CONFIRMATION_FROM_EMAIL` | Plaintext | `mentorship@kellychen.dev` |
| `CONFIRMATION_REPLY_TO` | Plaintext | `kellychenmeiyi@gmail.com` |

The confirmation includes the applicant's reference number, September 3 decision
date, and next-step expectations. It does not include application answers or the
resume. An email failure never deletes or invalidates a saved application; the
success screen tells the applicant to retain the reference number instead.

## 6. Redeploy After Configuration

`VITE_TURNSTILE_SITE_KEY` is inserted during the frontend build, so adding the
variable is not enough by itself.

1. Open the Pages project's **Deployments** tab.
2. Retry the latest production deployment, or push a new commit to `main`.
3. Wait for the production deployment to succeed.
4. Open `https://recruiting-accelerator-apply.pages.dev/apply`.
5. Confirm the Turnstile widget appears and the final submit button is enabled
   during the application window.

## 7. Run One Controlled End-to-End Test

Before sharing the LinkedIn post:

1. Submit one application using an email such as
   `kellychenmeiyi+launch-test@gmail.com` and a small test PDF.
2. Confirm the success screen displays an application reference.
3. Confirm the receipt arrives and that Reply goes to `kellychenmeiyi@gmail.com`.
4. In the D1 console, run:

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
  terms_version,
  confirmation_email_status,
  confirmation_email_sent_at,
  confirmation_email_message_id,
  confirmation_email_error
FROM applications
ORDER BY submitted_at DESC;
```

5. Confirm the test row appears and the confirmation status is `delivered` or `queued`.
6. Open the private R2 bucket and confirm the matching PDF exists under the
   `founding-cohort-2026/` prefix.
7. Test `/interest` once and confirm the record appears with:

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

8. Remove the test records and test PDF after verification so they are not
   confused with real applicants.

## 8. Know How Applications Will Be Reviewed

There is currently no private application dashboard or separate owner notification
when someone submits. Applicants receive a transactional receipt. During the
application window:

- Check the `applications` D1 table at least once each day.
- Review the associated resume from the private R2 bucket.
- Update the D1 `status` field manually as applications move through review.
- Check `confirmation_email_status` for `failed` or `not_configured` receipts.
- Do not download resumes onto shared or public devices.
- Do not export applicant data into public analytics or public spreadsheets.

An owner-only review dashboard or submission notification can be added later,
but it is not required for a small eight-person founding cohort if the D1 table
is checked consistently.

## 9. Prepare the Private Operational Links

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

## 10. Final LinkedIn Preflight

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
