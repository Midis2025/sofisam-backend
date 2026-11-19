'use client';

import React, { useState } from 'react';
import { Activity, Eye, Sparkles } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { EmailMonitoringSection } from '@/components/emails/EmailMonitoringSection';
import { EmailTemplatePreview } from '@/components/emails/EmailTemplatePreview';

export default function EmailsPage() {
  const [activeTab, setActiveTab] = useState<'monitoring' | 'preview'>('monitoring');

  return (
    <DashboardLayout
      title="Email Monitoring &amp; Delivery"
      subtitle="Track Resend dispatches, webhook delivery receipts, and live branded email templates"
    >
      <div className="w-full space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-[#DED7CA] pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('monitoring')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'monitoring'
                ? 'bg-[#C7A46A]/15 text-[#7A5D33] border border-[#C7A46A]/35 shadow-sm font-semibold'
                : 'text-[#66625B] hover:text-[#171717] hover:bg-[#F6F2EA]'
            }`}
          >
            <Activity className="w-4 h-4" />
            Monitoring &amp; Delivery Activity
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'preview'
                ? 'bg-[#C7A46A]/15 text-[#7A5D33] border border-[#C7A46A]/35 shadow-sm font-semibold'
                : 'text-[#66625B] hover:text-[#171717] hover:bg-[#F6F2EA]'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>Email Template Preview</span>
            <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.2 rounded bg-[#C7A46A]/20 text-[#7A5D33] font-semibold tracking-wide uppercase border border-[#C7A46A]/30">
              <Sparkles className="w-2.5 h-2.5" />
              Live
            </span>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'monitoring' ? (
          <EmailMonitoringSection />
        ) : (
          <EmailTemplatePreview onViewActivity={() => setActiveTab('monitoring')} />
        )}
      </div>
    </DashboardLayout>
  );
}
