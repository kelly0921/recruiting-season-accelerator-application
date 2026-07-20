import {
  applicationRecord,
  validateApplication,
} from '../_shared/validation.js';
import { verifyTurnstile } from '../_shared/turnstile.js';

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });

export async function onRequestPost({ request, env }) {
  if (!env.APPLICATIONS_DB || !env.RESUMES_BUCKET || !env.TURNSTILE_SECRET_KEY) {
    return json({ error: 'Application services are not fully configured.' }, 503);
  }

  const contentType = request.headers.get('content-type') || '';
  if (!contentType.includes('multipart/form-data')) {
    return json({ error: 'Expected a multipart form submission.' }, 415);
  }

  let formData;
  try {
    formData = await request.formData();
  } catch {
    return json({ error: 'Unable to read the submitted form.' }, 400);
  }

  const error = validateApplication(formData);
  if (error) return json({ error }, 400);

  const turnstileValid = await verifyTurnstile(
    String(formData.get('cf-turnstile-response') || ''),
    env.TURNSTILE_SECRET_KEY,
    request.headers.get('CF-Connecting-IP'),
  );
  if (!turnstileValid) {
    return json({ error: 'Spam-protection verification failed. Please try again.' }, 400);
  }

  const id = crypto.randomUUID();
  const resume = formData.get('resume');
  const resumeKey = `founding-cohort-2026/${id}.pdf`;
  await env.RESUMES_BUCKET.put(resumeKey, resume.stream(), {
    httpMetadata: { contentType: 'application/pdf' },
    customMetadata: { applicationId: id },
  });

  const record = applicationRecord(formData, id, resumeKey);

  try {
    await env.APPLICATIONS_DB.prepare(
      `INSERT INTO applications (
        id, submitted_at, status, full_name, email, school, major,
        graduation_year, time_zone, linkedin_url, portfolio_url,
        resume_key, resume_original_name, opportunities, company_environments,
        current_experience, recruiting_history, three_month_goal,
        primary_obstacle, worthwhile_change, feedback_priority, program_fit,
        desired_support, referral_source, marketing_consent
      ) VALUES (
        ?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13,
        ?14, ?15, ?16, ?17, ?18, ?19, ?20, ?21, ?22, ?23, ?24, ?25
      )`,
    ).bind(
      record.id,
      record.submittedAt,
      record.status,
      record.fullName,
      record.email,
      record.school,
      record.major,
      record.graduationYear,
      record.timeZone,
      record.linkedInUrl,
      record.portfolioUrl,
      record.resumeKey,
      record.resumeOriginalName,
      JSON.stringify(record.opportunities),
      JSON.stringify(record.companyEnvironments),
      record.currentExperience,
      record.recruitingHistory,
      record.threeMonthGoal,
      record.primaryObstacle,
      record.worthwhileChange,
      record.feedbackPriority,
      record.programFit,
      JSON.stringify(record.desiredSupport),
      record.referralSource,
      record.marketingConsent,
    ).run();
  } catch (databaseError) {
    await env.RESUMES_BUCKET.delete(resumeKey);
    if (String(databaseError.message).includes('UNIQUE')) {
      return json(
        { error: 'An application has already been submitted with this email address.' },
        409,
      );
    }
    console.error('Application insert failed', databaseError);
    return json({ error: 'Your application could not be saved. Please try again.' }, 500);
  }

  return json({ ok: true, reference: id.slice(0, 8).toUpperCase() }, 201);
}

export function onRequestGet() {
  return json({ error: 'Method not allowed.' }, 405);
}
