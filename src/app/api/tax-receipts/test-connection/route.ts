import { NextRequest, NextResponse } from 'next/server';
import { getTaxReceiptSettings, logTaxReceiptAudit, logTaxReceipt } from '@/lib/taxReceipts';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const settings = await getTaxReceiptSettings();

    const targetUrl = body.appsScriptWebAppUrl || settings.appsScriptWebAppUrl;
    const secret = body.appsScriptSecret || settings.appsScriptSecret || '';

    if (!targetUrl) {
      return NextResponse.json({ 
        success: false, 
        error: 'No Apps Script Web App URL provided or saved in settings.' 
      }, { status: 400 });
    }

    await logTaxReceiptAudit({
      eventType: 'connection_test_initiated',
      title: 'Apps Script Connection Test Initiated',
      description: `Sending handshake verification ping to ${targetUrl}`,
      metadata: { targetUrl, hasSecret: !!secret },
      status: 'info'
    });

    const pingPayload = {
      secret: secret,
      action: 'ping',
      donorName: 'KYO Connection Test (Website Verification Ping)',
      donorAddress: 'Verified Two-Way Connection with Google Sheets & Apps Script',
      donationDate: new Date().toISOString().split('T')[0],
    };

    let scriptResponse;
    try {
      scriptResponse = await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pingPayload),
      });
    } catch (fetchErr: any) {
      await logTaxReceiptAudit({
        eventType: 'connection_test_failed',
        title: 'Connection Test Failed (Network / Host Error)',
        description: `Could not reach Apps Script endpoint: ${fetchErr.message}`,
        metadata: { error: fetchErr.message, targetUrl },
        status: 'error'
      });

      return NextResponse.json({
        success: false,
        error: `Could not reach Apps Script URL. Please verify the URL and that "Who has access" was set to "Anyone": ${fetchErr.message}`
      }, { status: 502 });
    }

    if (!scriptResponse.ok) {
      const errText = await scriptResponse.text().catch(() => '');
      await logTaxReceiptAudit({
        eventType: 'connection_test_failed',
        title: `Connection Test Failed (HTTP ${scriptResponse.status})`,
        description: `Apps Script returned HTTP ${scriptResponse.status}. ${errText.slice(0, 150)}`,
        metadata: { status: scriptResponse.status, responseText: errText },
        status: 'error'
      });

      return NextResponse.json({
        success: false,
        error: `Apps Script returned HTTP status ${scriptResponse.status}. Make sure the secret matches and the Web App is deployed.`
      }, { status: 400 });
    }

    const jsonResult = await scriptResponse.json().catch(() => null);

    // Also record a verification item into the Receipt Log to show confirmation on both sides
    const testLogId = await logTaxReceipt({
      donorName: 'KYO System Test Connection',
      donorEmail: 'admin@thekyo.ca',
      donorPhone: 'N/A',
      donorAddress: 'Google Workspace Verified Handshake',
      amount: 0,
      frequency: 'one-time',
      donationDate: new Date().toISOString().split('T')[0],
      receiptId: 'CONN_TEST_' + Math.floor(1000 + Math.random() * 9000),
      driveUrl: jsonResult?.trackingSheetId 
        ? `https://docs.google.com/spreadsheets/d/${jsonResult.trackingSheetId}/edit`
        : settings.googleSheetId 
          ? `https://docs.google.com/spreadsheets/d/${settings.googleSheetId}/edit` 
          : '',
      status: 'emailed',
      errorMessage: 'System Handshake Verified: Test row added to Google Sheet',
    });

    // Record success in audit logs
    await logTaxReceiptAudit({
      eventType: 'connection_test_success',
      title: 'Apps Script & Sheet Connection Verified',
      description: 'Successfully exchanged data with Apps Script and wrote a test confirmation row to Google Sheets.',
      metadata: { 
        response: jsonResult, 
        testLogId,
        sheetId: jsonResult?.trackingSheetId || settings.googleSheetId 
      },
      status: 'success'
    });

    return NextResponse.json({
      success: true,
      message: 'Connection verified! Test row added to both the Google Sheet and website logs.',
      data: jsonResult,
      testLogId,
    }, { status: 200 });

  } catch (err: any) {
    console.error('[tax-receipts/test-connection] Error:', err);
    return NextResponse.json({ success: false, error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

