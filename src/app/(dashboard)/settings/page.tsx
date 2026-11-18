import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import {
  Shield,
  Globe,
  Mail,
  Database,
  CheckCircle2,
} from 'lucide-react';

export default function SettingsPage() {
  return (
    <DashboardLayout
      title="System Configuration & Security"
      subtitle="Administrator credentials, environment health, and API connectivity"
    >
      <div className="space-y-6 max-w-5xl">
        {/* Administrator Profile & Security */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#B99A62]" />
              <CardTitle>Single Administrator Credential</CardTitle>
            </div>
            <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Active Administrator Session
            </span>
          </CardHeader>
          <CardContent className="space-y-5">
            <p className="text-xs text-[#7C8795]">
              As specified in the architecture brief, SOFISAM operates under a single verified
              administrator account. Public registration is permanently disabled.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#182536] mb-1">
                  Primary Admin Email
                </label>
                <Input
                  type="email"
                  defaultValue="admin@sofisam.com"
                  readOnly
                  className="bg-slate-50 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#182536] mb-1">
                  Role Classification
                </label>
                <Input
                  type="text"
                  defaultValue="Principal System Administrator"
                  readOnly
                  className="bg-slate-50 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-[#E5E9EF] flex items-center justify-between">
              <div className="text-xs text-[#7C8795]">
                Super Admin authority:
                <span className="ml-1.5 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-medium text-[11px] border border-emerald-200">
                  One-time self-registration locked
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* API Integration & CORS Allowlist */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#B99A62]" />
              <CardTitle>Public Website Integration</CardTitle>
            </div>
            <span className="text-xs text-[#7C8795]">Public CORS & Endpoints</span>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-[#7C8795]">
              The public portal at{' '}
              <a
                href="https://sofisam-seven.vercel.app/"
                target="_blank"
                rel="noreferrer"
                className="font-medium text-[#B99A62] underline"
              >
                https://sofisam-seven.vercel.app/
              </a>{' '}
              dispatches client enquiries to the following production endpoints:
            </p>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-[#E5E9EF]">
                <div className="flex items-center gap-2.5">
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono font-bold text-[10px]">
                    POST
                  </span>
                  <span className="font-mono text-[#182536]">/api/enquiries</span>
                </div>
                <span className="text-[#7C8795]">Private Office Submissions</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-[#E5E9EF]">
                <div className="flex items-center gap-2.5">
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono font-bold text-[10px]">
                    POST
                  </span>
                  <span className="font-mono text-[#182536]">/api/contact</span>
                </div>
                <span className="text-[#7C8795]">General Contact Enquiries</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-[#E5E9EF]">
                <div className="flex items-center gap-2.5">
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono font-bold text-[10px]">
                    POST
                  </span>
                  <span className="font-mono text-[#182536]">/api/newsletter</span>
                </div>
                <span className="text-[#7C8795]">Newsletter Signups</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resend Email & Database Diagnostics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#B99A62]" />
                <CardTitle>Email Delivery (Resend)</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-[#7C8795]">
              <div className="flex justify-between py-1.5 border-b border-[#E5E9EF]">
                <span>Admin Notification</span>
                <span className="font-medium text-[#182536]">Enabled</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#E5E9EF]">
                <span>Customer Acknowledgement</span>
                <span className="font-medium text-[#182536]">Branded Template</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span>Sender Domain</span>
                <span className="font-medium text-[#182536]">notifications@sofisam.com</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-[#B99A62]" />
                <CardTitle>Database Infrastructure</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-[#7C8795]">
              <div className="flex justify-between py-1.5 border-b border-[#E5E9EF]">
                <span>Engine</span>
                <span className="font-medium text-[#182536]">MongoDB Atlas</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#E5E9EF]">
                <span>ODM Provider</span>
                <span className="font-medium text-[#182536]">Mongoose 8</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span>Connection Pool Reuse</span>
                <span className="font-medium text-emerald-600">Active</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
