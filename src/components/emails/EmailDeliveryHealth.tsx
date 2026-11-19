'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { EmailHealth } from '@/types';
import {
  Activity,
  CheckCircle2,
  AlertCircle,
  Clock,
  Radio,
  ExternalLink,
  RefreshCw,
  ShieldCheck,
  Check,
} from 'lucide-react';

interface EmailDeliveryHealthProps {
  health: EmailHealth | null;
  isLoading?: boolean;
  onSyncComplete?: () => void;
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return 'No recorded events';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return String(dateStr);
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(d);
  } catch {
    return String(dateStr);
  }
}

export function EmailDeliveryHealth({
  health,
  isLoading = false,
  onSyncComplete,
}: EmailDeliveryHealthProps) {
  const isApiConfigured = health?.resendConfigured ?? false;
  const isWebhookConfigured = health?.webhookConfigured ?? false;
  const deliveryRate = health?.overallDeliveryRate ?? 100;
  const failureRate = health?.overallFailureRate ?? 0;

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  const handleSyncTracking = async () => {
    setIsSyncing(true);
    setSyncStatus(null);
    try {
      const res = await fetch('/api/admin/emails/reconcile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSyncStatus(`Synced ${data.data?.updatedCount ?? 0} records from Resend`);
        if (onSyncComplete) onSyncComplete();
      } else {
        setSyncStatus(`Sync error: ${data.error || 'Failed to sync'}`);
      }
    } catch (err: unknown) {
      setSyncStatus(`Sync error: ${(err as Error)?.message || 'Failed'}`);
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncStatus(null), 4000);
    }
  };

  const totalReceived = health?.totalWebhookEventsReceived ?? health?.totalWebhookEvents ?? 0;
  const totalProcessed = health?.totalWebhookEventsProcessed ?? 0;
  const totalFailures = health?.totalWebhookProcessingFailures ?? 0;

  return (
    <Card className="border border-[#DED7CA] shadow-xs bg-white">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 border-b border-[#DED7CA] gap-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#C7A46A]" />
          <CardTitle className="text-sm">Delivery Infrastructure &amp; Webhook Diagnostics</CardTitle>
        </div>
        <div className="flex items-center gap-3">
          {/* Real-time Resend sync button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleSyncTracking}
            disabled={isSyncing || isLoading}
            className="text-xs h-7 px-2.5 text-[#7A5D33] border-[#C7A46A]/40 hover:bg-[#F6F2EA]"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isSyncing ? 'animate-spin text-[#C7A46A]' : ''}`} />
            {isSyncing ? 'Syncing...' : 'Sync with Resend'}
          </Button>

          <div className="flex items-center gap-1.5 pl-2 border-l border-[#DED7CA]">
            <span className="relative flex h-2.5 w-2.5">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isApiConfigured && isWebhookConfigured ? 'bg-emerald-400' : 'bg-amber-400'
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                  isApiConfigured && isWebhookConfigured ? 'bg-[#2B6B48]' : 'bg-[#C07D2B]'
                }`}
              />
            </span>
            <span className="text-xs font-medium text-[#66625B]">
              {isApiConfigured && isWebhookConfigured ? 'Fully Operational' : 'Action Recommended'}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5 space-y-5">
        {syncStatus && (
          <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-[#2B6B48] flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-[#2B6B48]" />
              {syncStatus}
            </span>
          </div>
        )}

        {/* Connection Diagnostics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Resend API Key */}
          <div className="p-3.5 rounded-lg bg-[#FBF9F5] border border-[#DED7CA] flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-[#66625B] uppercase">Resend API Key</p>
              <p className="text-xs font-medium text-[#171717] mt-0.5">
                {isApiConfigured ? 'Configured & Verified' : 'Missing RESEND_API_KEY'}
              </p>
            </div>
            {isApiConfigured ? (
              <CheckCircle2 className="w-5 h-5 text-[#2B6B48] shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-[#9A3F2C] shrink-0" />
            )}
          </div>

          {/* Resend Webhook Secret */}
          <div className="p-3.5 rounded-lg bg-[#FBF9F5] border border-[#DED7CA] flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-[#66625B] uppercase">Svix Webhook Secret</p>
              <p className="text-xs font-medium text-[#171717] mt-0.5">
                {isWebhookConfigured ? 'Active (Svix Verified)' : 'Unset RESEND_WEBHOOK_SECRET'}
              </p>
            </div>
            {isWebhookConfigured ? (
              <Radio className="w-5 h-5 text-[#2B6B48] shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-[#C07D2B] shrink-0" />
            )}
          </div>

          {/* Delivery Rate Indicator */}
          <div className="p-3.5 rounded-lg bg-[#FBF9F5] border border-[#DED7CA]">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold text-[#66625B] uppercase">Delivery Rate</p>
              <span className="text-xs font-bold text-[#2B6B48]">{deliveryRate}%</span>
            </div>
            <div className="w-full bg-[#EEE8DC] rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className="bg-[#2B6B48] h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, deliveryRate))}%` }}
              />
            </div>
          </div>

          {/* Failure Rate Indicator */}
          <div className="p-3.5 rounded-lg bg-[#FBF9F5] border border-[#DED7CA]">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold text-[#66625B] uppercase">Failure Rate</p>
              <span className="text-xs font-bold text-[#9A3F2C]">{failureRate}%</span>
            </div>
            <div className="w-full bg-[#EEE8DC] rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className="bg-[#9A3F2C] h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, failureRate))}%` }}
              />
            </div>
          </div>
        </div>

        {/* Webhook Health & Event Counters Grid (Requirement 9) */}
        <div className="p-4 rounded-xl bg-[#FBF9F5] border border-[#DED7CA] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#7A5D33]" />
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#171717]">
                Webhook Diagnostic Status
              </h4>
            </div>
            <span className="text-[11px] font-mono text-[#66625B]">
              Endpoint: /api/webhooks/resend
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-2.5 bg-white rounded-lg border border-[#DED7CA]">
              <span className="text-[#66625B] text-[11px] block">Events Received</span>
              <span className="font-bold text-[#171717] text-sm mt-0.5 block">
                {totalReceived.toLocaleString()}
              </span>
            </div>
            <div className="p-2.5 bg-white rounded-lg border border-[#DED7CA]">
              <span className="text-[#66625B] text-[11px] block">Events Processed</span>
              <span className="font-bold text-[#2B6B48] text-sm mt-0.5 block">
                {totalProcessed.toLocaleString()}
              </span>
            </div>
            <div className="p-2.5 bg-white rounded-lg border border-[#DED7CA]">
              <span className="text-[#66625B] text-[11px] block">Processing Failures</span>
              <span className={`font-bold text-sm mt-0.5 block ${totalFailures > 0 ? 'text-[#9A3F2C]' : 'text-[#66625B]'}`}>
                {totalFailures.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] pt-1">
            <div className="text-[#66625B]">
              <span className="font-semibold text-[#171717]">Last Processed Webhook Event: </span>
              <span>{formatDate(health?.lastProcessedAt || health?.lastWebhookReceivedAt)}</span>
            </div>
            <div className="text-[#66625B]">
              <span className="font-semibold text-[#171717]">Last Processing Error: </span>
              {health?.lastProcessingError ? (
                <span className="text-[#9A3F2C]">{health.lastProcessingError}</span>
              ) : (
                <span className="text-[#2B6B48]">None recorded</span>
              )}
            </div>
          </div>
        </div>

        {/* Timestamps summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2 border-t border-[#DED7CA] text-xs">
          <div className="flex items-start gap-2 text-[#66625B]">
            <Clock className="w-4 h-4 text-[#C7A46A] shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-[#171717] block">Last Email Attempt:</span>
              <span>{isLoading ? 'Checking...' : formatDate(health?.lastEmailAttempt)}</span>
            </div>
          </div>

          <div className="flex items-start gap-2 text-[#66625B]">
            <CheckCircle2 className="w-4 h-4 text-[#2B6B48] shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-[#171717] block">Last API Response:</span>
              <span>{isLoading ? 'Checking...' : formatDate(health?.lastSuccessfulApiResponse || health?.latestSuccessfulDispatch)}</span>
            </div>
          </div>

          <div className="flex items-start gap-2 text-[#66625B]">
            <CheckCircle2 className="w-4 h-4 text-[#2B6B48] shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-[#171717] block">Last Confirmed Delivery:</span>
              <span>{isLoading ? 'Checking...' : formatDate(health?.lastConfirmedDelivery || health?.lastDeliveredAt)}</span>
            </div>
          </div>

          <div className="flex items-start gap-2 text-[#66625B]">
            <AlertCircle className="w-4 h-4 text-[#9A3F2C] shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-[#171717] block">Last Delivery Failure:</span>
              {isLoading ? (
                <span>Checking...</span>
              ) : health?.lastFailedAt ? (
                <span>
                  {formatDate(health.lastFailedAt)}
                  {health.lastFailedReason ? ` (${health.lastFailedReason})` : ''}
                </span>
              ) : (
                <span className="text-[#2B6B48] font-medium">None recorded</span>
              )}
            </div>
          </div>
        </div>

        {/* Webhook Configuration Note */}
        {!isWebhookConfigured && (
          <div className="p-3 rounded-lg bg-amber-50/80 border border-amber-200 text-xs text-amber-900 flex items-start justify-between gap-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-[#C07D2B] shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-[#171717]">Resend Webhook Secret Not Configured</p>
                <p className="text-[#66625B] mt-0.5">
                  Set <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-bold text-amber-900">RESEND_WEBHOOK_SECRET</code> in your environment to automatically verify incoming delivery events at <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-amber-900">/api/webhooks/resend</code>.
                </p>
              </div>
            </div>
            <a
              href="https://resend.com/webhooks"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#7A5D33] underline shrink-0 hover:text-[#C7A46A]"
            >
              Resend Portal <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
