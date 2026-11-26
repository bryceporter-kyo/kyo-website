import { NextRequest, NextResponse } from "next/server";
import { fetchAllGrants, saveGrant, logGrantAudit } from "@/lib/grants/grants-service";
import { cloneGrantForNewCycle } from "@/lib/grants/grant-actions";

/**
 * Daily Scheduled Job (Spec §4 & §15)
 * Triggered at 6:00 AM daily by Google Cloud Scheduler or GitHub Actions.
 * Protected by shared secret: Authorization: Bearer <secret>
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const secret = process.env.GRANTS_JOB_SECRET;
    if (!secret) {
      console.error("[GrantsDailyJob] GRANTS_JOB_SECRET env var is not set.");
      return NextResponse.json({ error: "Job endpoint is not configured" }, { status: 500 });
    }

    if (!authHeader || authHeader.replace(/^Bearer\s+/i, "") !== secret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const todayStr = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const allGrants = await fetchAllGrants();

    let promotedCount = 0;
    let clonedCount = 0;

    await Promise.all(allGrants.map(async (grant) => {
      // 1. Return-To automation: Qualified: Timing Not Right -> Qualified: To Apply
      if (grant.returnToDate && !grant.returnToUsed) {
        const returnDateStr = grant.returnToDate.split("T")[0];
        if (returnDateStr <= todayStr) {
          await saveGrant({
            id: grant.id,
            stage: "Qualified: To Apply",
            returnToUsed: true,
          });
          await logGrantAudit({
            userId: "system_cron",
            userEmail: "system@thekyo.ca",
            userName: "Daily Scheduled Job",
            action: "AUTO_PROMOTE_RETURN_TO",
            summary: `Automated promotion on return date (${grant.returnToDate}): moved ${grant.funderName} to Qualified: To Apply.`,
          });
          promotedCount++;
        }
      }

      // 2. Renewal date automation: Closed: Lost: Reapply OR Closed: Won: Single-Year: Reapply -> Clone new grant
      if (grant.renewalDate && !grant.renewalUsed) {
        const renewalDateStr = grant.renewalDate.split("T")[0];
        const isEligibleStage = grant.stage === "Closed: Lost: Reapply" || grant.stage === "Closed: Won: Single-Year: Reapply";

        if (isEligibleStage && renewalDateStr <= todayStr) {
          await cloneGrantForNewCycle(grant, { prefillAnswers: true }, {
            id: "system_cron",
            email: "system@thekyo.ca",
            name: "Daily Scheduled Job",
          });
          clonedCount++;
        }
      }
    }));

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      promotedCount,
      clonedCount,
    });
  } catch (err: any) {
    console.error("[GrantsDailyJob Error]:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
