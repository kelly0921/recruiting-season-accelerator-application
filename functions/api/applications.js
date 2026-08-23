import {
  applicationRecord,
  validateApplication,
  validateResumeSignature,
} from '../_shared/validation.js';
import { sendApplicationConfirmation } from '../_shared/confirmationEmail.js';
import { verifyTurnstile } from '../_shared/turnstile.js';

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });

async function recordConfirmationEmailOutcome(env, applicationId, outcome) {
  try {
    await env.APPLICATIONS_DB.prepare(
      `UPDATE applications
       SET confirmation_email_status = ?1,
           confirmation_email_sent_at = ?2,
           confirmation_email_error = ?3,
           confirmation_email_message_id = ?4
       WHERE id = ?5`,
    ).bind(
      outcome.status,
      outcome.sent ? new Date().toISOString() : '',
      String(outcome.error || '').slice(0, 500),
      String(outcome.messageId || '').slice(0, 200),
      applicationId,
    ).run();
  } catch (error) {
    console.error('Confirmation email status update failed', {
      applicationId,
      message: error.message,
    });
  }
}

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

  const resume = formData.get('resume');
  const resumeSignatureError = await validateResumeSignature(resume);
  if (resumeSignatureError) return json({ error: resumeSignatureError }, 400);

  const turnstileValid = await verifyTurnstile(
    String(formData.get('cf-turnstile-response') || ''),
    env.TURNSTILE_SECRET_KEY,
    request.headers.get('CF-Connecting-IP'),
  );
  if (!turnstileValid) {
    return json({ error: 'Spam-protection verification failed. Please try again.' }, 400);
  }

  const id = crypto.randomUUID();
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
        desired_support, referral_source, marketing_consent,
        applications_submitted, first_interviews, final_rounds, offers_received,
        scheduling_constraints, community_commitment, recruiting_market,
        target_list, adult_confirmed, acknowledgements_accepted_at, terms_version,
        conference_interest, conference_details,
        graduation_date, academic_stage, roles_exploring, fall_goal, obstacles,
        recent_action, kelly_question
      ) VALUES (
        ?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13,
        ?14, ?15, ?16, ?17, ?18, ?19, ?20, ?21, ?22, ?23, ?24, ?25,
        ?26, ?27, ?28, ?29, ?30, ?31, ?32, ?33, ?34, ?35, ?36, ?37,
        ?38, ?39, ?40, ?41, ?42, ?43, ?44, ?45
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
      record.applicationsSubmitted,
      record.firstInterviews,
      record.finalRounds,
      record.offersReceived,
      record.schedulingConstraints,
      record.communityCommitment,
      record.recruitingMarket,
      record.targetList,
      record.adultConfirmed,
      record.acknowledgementsAcceptedAt,
      record.termsVersion,
      record.conferenceInterest,
      record.conferenceDetails,
      record.graduationDate,
      record.academicStage,
      JSON.stringify(record.rolesExploring),
      record.fallGoal,
      JSON.stringify(record.obstacles),
      record.recentAction,
      record.kellyQuestion,
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

  const reference = id.slice(0, 8).toUpperCase();
  let confirmationEmail;

  try {
    confirmationEmail = await sendApplicationConfirmation({
      env,
      fullName: record.fullName,
      email: record.email,
      reference,
    });
  } catch (error) {
    confirmationEmail = {
      sent: false,
      status: 'failed',
      error: error.message,
      messageId: '',
    };
    console.error('Application confirmation email failed', {
      applicationId: id,
      message: error.message,
    });
  }

  await recordConfirmationEmailOutcome(env, id, confirmationEmail);

  return json({
    ok: true,
    reference,
    confirmationEmailSent: confirmationEmail.sent,
  }, 201);
}

export function onRequestGet() {
  return json({ error: 'Method not allowed.' }, 405);
}
