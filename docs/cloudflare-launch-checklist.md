# Cloudflare and LinkedIn Launch Checklist

Use this checklist before announcing Recruiting Season Accelerator publicly.
The form code is complete, but submissions will not be accepted or stored until
the Cloudflare bindings and Turnstile variables below are configured.

## 1. Confirm the Public Timeline

The website currently communicates:

- Applications open Friday, July 24, 2026
- Applications are reviewed on a rolling basis
- Applications close July 30 at 11:59 PM ET or earlier if all eight seats fill
- Final decisions are planned by July 31
- The August 1 kickoff is tentative and depends on confirming a viable cohort
- The founding price is $99
- Scholarship seats are not available

Before posting on LinkedIn, decide privately what minimum cohort size makes the
August 1 kickoff viable. The public site does not promise a specific minimum.

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
5. Open **Workers & Pages → recruiting-accelerator-apply → Settings → Bindings**.
6. Add a **D1 database binding**:
   - Variable name: `APPLICATIONS_DB`
   - Database: `rsa-applications`
   - Environment: Production

The D1 database stores the application answers and future-cohort interest-list
records. It does not store the resume file itself.

If the database was already configured with migrations `0001` through `0003`,
run only `0004_refine_application_fit_and_acknowledgements.sql` for the revised
form. Run it once before deploying the updated code. The existing D1 binding,
R2 bucket, and Turnstile keys do not need to be replaced.

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
  applications_submitted,
  first_interviews,
  final_rounds,
  offers_received,
  recruiting_market,
  target_list,
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

Send payment and onboarding information only after acceptance. Since no
scholarships are offered, accepted applicants should receive the same clear $99
payment instructions and refund deadline.

## 9. Final LinkedIn Preflight

Immediately before posting:

- Open the landing page, `/apply`, `/faq`, and all policy pages.
- Submit the controlled test described above.
- Confirm the application dates, rolling-review language, $99 price, eight-seat
  limit, no-scholarship policy, and tentative August 1 kickoff are consistent.
- Confirm Kelly's portfolio links to the Cloudflare landing page—not the retired
  `chatgpt.site` version.
- Check that the LinkedIn post links to
  `https://recruiting-accelerator-apply.pages.dev/`.
- State that applications may close early if the cohort fills.
- Avoid promising that the August 1 kickoff is guaranteed until the cohort is
  confirmed.
