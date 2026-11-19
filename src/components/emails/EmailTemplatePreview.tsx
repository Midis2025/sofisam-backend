'use client';

import React, { useState } from 'react';
import {
  Monitor,
  Smartphone,
  Eye,
  FileText,
  Code,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Sparkles,
} from 'lucide-react';
import {
  SAMPLE_CONTACT_ENQUIRY,
  renderContactEnquiryHtml,
  renderContactEnquiryText,
} from '@/lib/email-templates/contact-enquiry';

interface TestResultData {
  resendEmailId?: string;
  emailLogId?: string;
  recipient: string;
  sender: string;
  subject: string;
  status: string;
  dispatchedAt?: string;
}

interface EmailTemplatePreviewProps {
  onViewActivity?: () => void;
}

export function EmailTemplatePreview({ onViewActivity }: EmailTemplatePreviewProps) {
  // Viewport mode: desktop (600px) | mobile (375px)
  const [viewport, setViewport] = useState<'desktop' | 'mobile'>('desktop');

  // Format mode: rendered | text | source
  const [format, setFormat] = useState<'rendered' | 'text' | 'source'>('rendered');

  // Test dispatch state
  const [recipientInput, setRecipientInput] = useState<string>('swayam.midis@gmail.com');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message?: string;
    error?: string;
    hint?: string;
    data?: TestResultData;
  } | null>(null);

  // Copy buttons
  const [copiedResendId, setCopiedResendId] = useState<boolean>(false);
  const [copiedLogId, setCopiedLogId] = useState<boolean>(false);

  // Pre-rendered template content
  const htmlContent = renderContactEnquiryHtml(SAMPLE_CONTACT_ENQUIRY, { isClientPreview: true });
  const textContent = renderContactEnquiryText(SAMPLE_CONTACT_ENQUIRY);

  const handleSendTestEmail = async () => {
    if (isSending) return;
    setIsSending(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/admin/emails/test-contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipient: recipientInput.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setTestResult({
          success: false,
          error: data.error || 'Failed to dispatch test email',
          hint: data.hint,
          data: data.data,
        });
      } else {
        setTestResult({
          success: true,
          message: data.message || 'Test email dispatched successfully',
          data: data.data,
        });
      }
    } catch (err: unknown) {
      setTestResult({
        success: false,
        error: (err as Error).message || 'Network exception while sending test email',
      });
    } finally {
      setIsSending(false);
    }
  };

  const copyToClipboard = (text: string, type: 'resend' | 'log') => {
    navigator.clipboard.writeText(text);
    if (type === 'resend') {
      setCopiedResendId(true);
      setTimeout(() => setCopiedResendId(false), 2000);
    } else {
      setCopiedLogId(true);
      setTimeout(() => setCopiedLogId(false), 2000);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* 1. Template Overview & Metadata Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Sparkles className="w-3 h-3" />
                Live Branded Template
              </span>
              <span className="text-xs text-slate-400">|</span>
              <span className="text-xs font-mono text-slate-400">contact-enquiry.ts</span>
            </div>
            <h2 className="text-lg font-semibold text-slate-100 tracking-tight">
              New Contact Enquiry – Admin Notification
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl">
              Dispatched instantly to executive administrators when a prospective client submits
              the public SOFISAM contact form. Styled with authentic website design tokens:
              deep charcoal header, signature gold brass accents, and responsive layout.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-slate-300">
              <span className="text-slate-400 block text-[10px] uppercase tracking-wider">Trigger</span>
              Website Contact Form
            </div>
            <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-slate-300">
              <span className="text-slate-400 block text-[10px] uppercase tracking-wider">Sender</span>
              SOFISAM &lt;onboarding@resend.dev&gt;
            </div>
            <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-slate-300">
              <span className="text-slate-400 block text-[10px] uppercase tracking-wider">Default Target</span>
              swayam.midis@gmail.com
            </div>
          </div>
        </div>
      </div>

      {/* 2. Interactive Controls & Test Dispatch Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Viewport & Format Switchers */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Viewport Toggle */}
            <div className="inline-flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800">
              <button
                type="button"
                onClick={() => setViewport('desktop')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  viewport === 'desktop'
                    ? 'bg-slate-800 text-amber-400 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                Desktop (600px)
              </button>
              <button
                type="button"
                onClick={() => setViewport('mobile')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  viewport === 'mobile'
                    ? 'bg-slate-800 text-amber-400 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                Mobile (375px)
              </button>
            </div>

            {/* Format Toggle */}
            <div className="inline-flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800">
              <button
                type="button"
                onClick={() => setFormat('rendered')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  format === 'rendered'
                    ? 'bg-slate-800 text-slate-100 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                Rendered HTML
              </button>
              <button
                type="button"
                onClick={() => setFormat('text')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  format === 'text'
                    ? 'bg-slate-800 text-slate-100 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                Plain Text
              </button>
              <button
                type="button"
                onClick={() => setFormat('source')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  format === 'source'
                    ? 'bg-slate-800 text-slate-100 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Code className="w-3.5 h-3.5" />
                HTML Source
              </button>
            </div>
          </div>

          {/* Test Send Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <input
                type="email"
                value={recipientInput}
                onChange={(e) => setRecipientInput(e.target.value)}
                placeholder="swayam.midis@gmail.com"
                className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-2 w-64 focus:outline-none focus:border-amber-500/50 transition-colors"
                title="Target Recipient Email"
              />
            </div>

            <button
              type="button"
              onClick={handleSendTestEmail}
              disabled={isSending}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium bg-amber-500 hover:bg-amber-400 text-slate-950 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold shadow-md hover:shadow-amber-500/20"
            >
              {isSending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Sending via Resend...
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  Send Test Email
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 3. Dispatch Result Banner */}
      {testResult && (
        <div
          className={`rounded-xl p-5 border shadow-lg transition-all ${
            testResult.success
              ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-200'
              : 'bg-rose-950/40 border-rose-800/60 text-rose-200'
          }`}
        >
          <div className="flex items-start gap-3">
            {testResult.success ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-400 mt-0.5 shrink-0" />
            )}

            <div className="space-y-3 flex-1">
              <div>
                <h3 className="text-sm font-semibold text-slate-100">
                  {testResult.success
                    ? 'Resend API Accepted Test Dispatch'
                    : 'Test Email Dispatch Failed'}
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  {testResult.success
                    ? testResult.message
                    : testResult.error}
                </p>
                {testResult.hint && (
                  <p className="text-xs text-amber-300/90 mt-1.5 p-2 bg-amber-950/30 border border-amber-800/40 rounded">
                    <strong>Configuration Note:</strong> {testResult.hint}
                  </p>
                )}
              </div>

              {testResult.data && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-950/70 p-3 rounded-lg border border-slate-800/80 text-xs">
                  {testResult.data.resendEmailId && (
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                        Resend Email ID
                      </span>
                      <div className="flex items-center gap-1.5 font-mono text-amber-300 font-semibold text-[11px]">
                        <span className="truncate max-w-[130px]">
                          {testResult.data.resendEmailId}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            copyToClipboard(testResult.data!.resendEmailId!, 'resend')
                          }
                          className="hover:text-amber-200 text-slate-400 transition-colors"
                          title="Copy Resend ID"
                        >
                          {copiedResendId ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {testResult.data.emailLogId && (
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                        MongoDB Log ID
                      </span>
                      <div className="flex items-center gap-1.5 font-mono text-slate-300 text-[11px]">
                        <span className="truncate max-w-[130px]">
                          {testResult.data.emailLogId}
                        </span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(testResult.data!.emailLogId!, 'log')}
                          className="hover:text-slate-100 text-slate-400 transition-colors"
                          title="Copy MongoDB Log ID"
                        >
                          {copiedLogId ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                      Recipient
                    </span>
                    <span className="text-slate-200 font-medium truncate block">
                      {testResult.data.recipient}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                      Initial Status
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {testResult.data.status}
                    </span>
                  </div>
                </div>
              )}

              {testResult.success && (
                <div className="flex items-center justify-between text-xs pt-1">
                  <p className="text-slate-400 text-[11px] italic">
                    Note: Email is recorded in MongoDB. Status updates to &quot;delivered&quot; once
                    Resend webhooks post delivery receipts.
                  </p>
                  {onViewActivity && (
                    <button
                      type="button"
                      onClick={onViewActivity}
                      className="inline-flex items-center gap-1.5 text-amber-400 hover:text-amber-300 font-medium transition-colors"
                    >
                      View in Activity Table &rarr;
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. Template Display Canvas */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 sm:p-6 shadow-inner flex flex-col items-center min-h-[600px]">
        {format === 'rendered' && (
          <div
            className={`w-full transition-all duration-300 flex justify-center ${
              viewport === 'mobile' ? 'max-w-[400px]' : 'max-w-[680px]'
            }`}
          >
            {viewport === 'mobile' ? (
              /* Mobile Smartphone Frame Simulation */
              <div className="w-full bg-slate-900 border-[6px] border-slate-700 rounded-[36px] shadow-2xl overflow-hidden p-2">
                <div className="w-24 h-4 bg-slate-800 rounded-full mx-auto mb-2" />
                <div className="rounded-[24px] overflow-hidden bg-[#F6F2EA] border border-slate-700/60">
                  <iframe
                    title="Mobile Email Preview"
                    srcDoc={htmlContent}
                    className="w-full h-[650px] border-0"
                    sandbox="allow-same-origin"
                  />
                </div>
                <div className="w-16 h-1 bg-slate-700 rounded-full mx-auto mt-2.5" />
              </div>
            ) : (
              /* Desktop Browser Container */
              <div className="w-full bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden">
                {/* Browser Address Bar Simulation */}
                <div className="bg-slate-950 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
                  </div>
                  <div className="bg-slate-900 px-3 py-1 rounded text-[11px] font-mono text-slate-400 max-w-sm truncate border border-slate-800">
                    Subject: New Contact Enquiry | SOFISAM | Dr. Marcus Vance
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <span className="text-slate-400">Width:</span>
                    <span className="font-mono text-amber-400">600px</span>
                  </div>
                </div>

                {/* Email HTML IFrame */}
                <div className="w-full bg-[#F6F2EA] flex justify-center">
                  <iframe
                    title="Desktop Email Preview"
                    srcDoc={htmlContent}
                    className="w-full h-[760px] border-0"
                    sandbox="allow-same-origin"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {format === 'text' && (
          <div className="w-full max-w-3xl">
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 mb-2 flex items-center justify-between text-xs text-slate-400">
              <span className="font-medium text-slate-300">Plain-Text Alternative (RFC 2822 Fallback)</span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(textContent);
                }}
                className="inline-flex items-center gap-1 text-slate-400 hover:text-slate-200 transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                Copy Text
              </button>
            </div>
            <pre className="font-mono text-xs text-slate-300 bg-slate-950 p-5 rounded-lg border border-slate-800 whitespace-pre-wrap leading-relaxed overflow-x-auto shadow-inner">
              {textContent}
            </pre>
          </div>
        )}

        {format === 'source' && (
          <div className="w-full max-w-4xl">
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 mb-2 flex items-center justify-between text-xs text-slate-400">
              <span className="font-medium text-slate-300">HTML Source Code</span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(htmlContent);
                }}
                className="inline-flex items-center gap-1 text-slate-400 hover:text-slate-200 transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                Copy HTML
              </button>
            </div>
            <pre className="font-mono text-[11px] text-amber-200/90 bg-slate-950 p-5 rounded-lg border border-slate-800 whitespace-pre-wrap leading-relaxed overflow-x-auto max-h-[700px] shadow-inner">
              {htmlContent}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
