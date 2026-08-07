
import { NextResponse } from 'next/server';
import { getRegistrationForm } from '@/lib/registration-form-service';
import { saveRegistrationSubmission } from '@/lib/registration-submission-service';

export async function POST(req: Request) {
  try {
    const { program, answers, uid } = await req.json();

    if (!program || !answers) {
      return NextResponse.json({ success: false, error: "Missing program or answers" }, { status: 400 });
    }

    // 1. Get form config to check for webhook settings
    const config = await getRegistrationForm(program);
    if (!config) {
      return NextResponse.json({ success: false, error: "Form configuration not found" }, { status: 404 });
    }

    // 2. Save the submission to Firestore (primary source of truth)
    const submissionId = await saveRegistrationSubmission({
      program,
      formId: config.id,
      formTitle: config.title,
      answers,
      uid,
    });

    // 3. Trigger Google Sheets Webhook if configured
    if (config.webhookUrl) {
      console.log(`[API] Triggering webhook for ${program}: ${config.webhookUrl}`);
      
      // Map answers from question.id to question.label for the Google Sheet
      const humanReadableAnswers: Record<string, any> = {};
      Object.entries(answers).forEach(([qId, val]) => {
        const question = config.questions.find(q => q.id === qId);
        if (question && question.type !== 'section_header') {
          humanReadableAnswers[question.label] = val;
        }
      });

      const orderedHeaders = [
        "Submission_ID",
        "Submitted_At",
        "Form_Title",
        "Program",
        ...config.questions.filter(q => q.type !== 'section_header').map(q => q.label)
      ];

      const payload = {
        orderedHeaders,
        data: {
          Submission_ID: submissionId,
          Submitted_At: new Date().toISOString(),
          Form_Title: config.title,
          Program: program,
          ...humanReadableAnswers
        }
      };

      try {
        const response = await fetch(config.webhookUrl, {
          method: 'POST',
          mode: 'no-cors', // Apps Script often requires this or handles redirects oddly
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
        
        console.log(`[API] Webhook triggered. Status: ${response.status}`);
      } catch (webhookErr) {
        // We log the error but don't fail the user's submission
        console.error("[API] Webhook call failed:", webhookErr);
      }
    }

    return NextResponse.json({ 
      success: true, 
      submissionId,
      message: "Submission processed successfully" 
    });
  } catch (err: any) {
    console.error("[API] Registration submission error:", err);
    return NextResponse.json({ 
      success: false, 
      error: err.message || "An internal error occurred" 
    }, { status: 500 });
  }
}
