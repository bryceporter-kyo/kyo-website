import { NextRequest, NextResponse } from 'next/server';
import { logTaxReceipt, getTaxReceiptSettings, TaxReceiptRecord } from '@/lib/taxReceipts';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const settings = await getTaxReceiptSettings();

    // Verify secret authentication
    if (settings.appsScriptSecret && body.secret !== settings.appsScriptSecret) {
      return NextResponse.json({ error: 'Unauthorized: Invalid secret' }, { status: 401 });
    }

    const receiptRecord: TaxReceiptRecord = {
      donorName: body.donorName || 'Manual Donor',
      donorEmail: body.donorEmail || '',
      donorPhone: body.donorPhone || '',
      donorAddress: body.donorAddress || '',
      amount: parseFloat(body.amount || '0'),
      assumedAnnualAmount: body.assumedAnnualAmount ? parseFloat(body.assumedAnnualAmount) : undefined,
      frequency: body.frequency || 'one-time',
      donationDate: body.donationDate || new Date().toISOString().split('T')[0],
      receiptId: body.receiptId || '',
      driveUrl: body.receiptUrl || body.driveUrl || '',
      status: body.status || 'emailed',
      errorMessage: body.errorMessage,
    };

    const docId = await logTaxReceipt(receiptRecord);

    return NextResponse.json({ success: true, docId, message: 'Tax receipt recorded in website database' }, { status: 200 });
  } catch (error: any) {
    console.error('Error logging manual tax receipt to website:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
