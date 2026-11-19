import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { reconcileEmailsWithResend } from '@/lib/email-reconciliation';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();

    let targetId: string | undefined;
    try {
      const body = await req.json();
      if (body?.id) targetId = body.id;
    } catch {
      // Empty body is fine — reconciles all
    }

    const result = await reconcileEmailsWithResend(targetId);

    return NextResponse.json({
      success: true,
      message: `Reconciled ${result.updatedCount} of ${result.totalChecked} email logs against Resend.`,
      data: result,
    });
  } catch (error: unknown) {
    const err = error as { message?: string };
    if (err?.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error reconciling email logs:', error);
    return NextResponse.json(
      { error: err?.message || 'Failed to reconcile email logs' },
      { status: 500 }
    );
  }
}
