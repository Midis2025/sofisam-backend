'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import {
  Shield,
  Globe,
  Database,
  CheckCircle2,
} from 'lucide-react';
import { EmailMonitoringSection } from '@/components/emails/EmailMonitoringSection';

export default function SettingsPage() {
  return (
    <DashboardLayout
      title="System Configuration &amp; Monitoring"
      subtitle="Administrator credentials, environment health, API connectivity, and Resend delivery"
    >
      <div className="space-y-8 max-w-6xl">
        {/* Administrator Profile & Security */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#C7A46A]" />
              <CardTitle>Single Administrator Credential</CardTitle>
            </div>
            <span className="text-xs text-[#2B6B48] font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Active Administrator Session
            </span>
          </CardHeader>
          <CardContent className="space-y-5">
            <p className="text-xs text-[#66625B]">
              As specified in the architecture brief, SOFISAM operates under a single verified
              administrator account. Public registration is permanently disabled.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#171717] mb-1">
                  Primary Admin Email
                </label>
                <Input
                  type="email"
                  defaultValue="admin@sofisam.com"
                  readOnly
                  className="bg-[#F6F2EA] cursor-not-allowed border-[#DED7CA] text-[#171717]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#171717] mb-1">
                  Role Classification
                </label>
                <Input
                  type="text"
                  defaultValue="Principal System Administrator"
                  readOnly
                  className="bg-[#F6F2EA] cursor-not-allowed border-[#DED7CA] text-[#171717]"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-[#DED7CA] flex items-center justify-between">
              <div className="text-xs text-[#66625B]">
                Super Admin authority:
                <span className="ml-1.5 px-2 py-0.5 rounded bg-emerald-50 text-[#2B6B48] font-medium text-[11px] border border-emerald-200">
                  One-time self-registration locked
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resend Email Monitoring & Delivery Tracking */}
        <div className="space-y-4">
          <div className="border-t border-[#DED7CA] pt-6">
            <h2 className="text-base font-semibold text-[#171717]">
              Email Delivery &amp; Webhook Monitoring
            </h2>
            <p className="text-xs text-[#66625B] mt-0.5">
              Live tracking of Resend dispatches, webhook receipts, bounce telemetry, and delivery audit logs
            </p>
          </div>
          <EmailMonitoringSection />
        </div>

        {/* API Integration & Database Infrastructure */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* API Integration & CORS Allowlist */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#C7A46A]" />
                <CardTitle>Public Website Integration</CardTitle>
              </div>
              <span className="text-xs text-[#66625B]">Public CORS &amp; Endpoints</span>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-[#66625B]">
                The public portal at{' '}
                <a
                  href="https://sofisam-seven.vercel.app/"
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-[#7A5D33] hover:text-[#C7A46A] underline transition-colors"
                >
                  https://sofisam-seven.vercel.app/
                </a>{' '}
                dispatches client enquiries to the following production endpoints:
              </p>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-3 rounded-lg bg-[#FBF9F5] border border-[#DED7CA]">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-[#2B6B48] border border-emerald-200 font-mono font-bold text-[10px]">
                      POST
                    </span>
                    <span className="font-mono text-[#171717]">/api/enquiries</span>
                  </div>
                  <span className="text-[#66625B]">Private Office Submissions</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-[#FBF9F5] border border-[#DED7CA]">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-[#2B6B48] border border-emerald-200 font-mono font-bold text-[10px]">
                      POST
                    </span>
                    <span className="font-mono text-[#171717]">/api/contact</span>
                  </div>
                  <span className="text-[#66625B]">General Contact Enquiries</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-[#FBF9F5] border border-[#DED7CA]">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-[#2B6B48] border border-emerald-200 font-mono font-bold text-[10px]">
                      POST
                    </span>
                    <span className="font-mono text-[#171717]">/api/newsletter</span>
                  </div>
                  <span className="text-[#66625B]">Newsletter Signups</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Database Infrastructure */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-[#C7A46A]" />
                <CardTitle>Database Infrastructure</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-[#66625B]">
              <div className="flex justify-between py-2 border-b border-[#DED7CA]">
                <span>Engine</span>
                <span className="font-medium text-[#171717]">MongoDB Atlas</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#DED7CA]">
                <span>ODM Provider</span>
                <span className="font-medium text-[#171717]">Mongoose 9</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#DED7CA]">
                <span>Connection Pool Reuse</span>
                <span className="font-medium text-[#2B6B48]">Active (Global Cached)</span>
              </div>
              <div className="flex justify-between py-2">
                <span>Collections</span>
                <span className="font-medium text-[#171717]">
                  Admins, Enquiries, Newsletters, EmailLogs, Webhooks
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
