import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { EnquiryChart } from '@/components/dashboard/EnquiryChart';
import { EnquirySummary } from '@/components/dashboard/EnquirySummary';
import { RecentEnquiries } from '@/components/dashboard/RecentEnquiries';
import { MOCK_STATS, MOCK_ENQUIRIES } from '@/lib/mockData';
import { Inbox, Mail, Clock, Users } from 'lucide-react';

export default function DashboardPage() {
  return (
    <DashboardLayout
      title="Executive Overview"
      subtitle="SOFISAM Institutional & Advisory Mandates Management"
    >
      <div className="space-y-8">
        {/* Statistics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            title="Total Enquiries"
            value={MOCK_STATS.totalEnquiries}
            change={MOCK_STATS.trends.totalEnquiriesChange}
            description="All historical mandates"
            icon={Inbox}
            variant="navy"
          />
          <StatCard
            title="New Submissions"
            value={MOCK_STATS.newEnquiries}
            change={MOCK_STATS.trends.newEnquiriesChange}
            description="Pending initial contact"
            icon={Mail}
            variant="info"
          />
          <StatCard
            title="In Progress"
            value={MOCK_STATS.inProgressEnquiries}
            change={MOCK_STATS.trends.inProgressChange}
            description="Active review & advisory"
            icon={Clock}
            variant="gold"
          />
          <StatCard
            title="Newsletter Subscribers"
            value={MOCK_STATS.newsletterSubscribers}
            change={MOCK_STATS.trends.subscribersChange}
            description="Active market intelligence list"
            icon={Users}
            variant="default"
          />
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <EnquiryChart data={MOCK_STATS.monthlySubmissions} />
          </div>
          <div>
            <EnquirySummary
              statusData={MOCK_STATS.statusDistribution}
              formTypeData={MOCK_STATS.formTypeDistribution}
            />
          </div>
        </div>

        {/* Recent Submissions */}
        <RecentEnquiries enquiries={MOCK_ENQUIRIES} />
      </div>
    </DashboardLayout>
  );
}
