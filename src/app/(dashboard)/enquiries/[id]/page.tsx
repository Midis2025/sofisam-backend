import React, { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { EnquiryDetails } from '@/components/enquiries/EnquiryDetails';
import { MOCK_ENQUIRIES } from '@/lib/mockData';

interface PageProps {
  params: Promise<{ id: string }>;
}

async function EnquiryContent({ params }: PageProps) {
  const { id } = await params;
  const enquiry = MOCK_ENQUIRIES.find((e) => e._id === id || e.referenceId === id);

  if (!enquiry) {
    notFound();
  }

  return (
    <DashboardLayout
      title={`Mandate File: ${enquiry.referenceId}`}
      subtitle={`Submitted by ${enquiry.name} • ${enquiry.company || 'Private Client'}`}
    >
      <EnquiryDetails initialEnquiry={enquiry} />
    </DashboardLayout>
  );
}

export default function EnquiryDetailPage({ params }: PageProps) {
  return (
    <Suspense
      fallback={
        <DashboardLayout title="Mandate File" subtitle="Loading mandate records...">
          <div className="p-8 text-center text-xs text-[#7C8795]">Loading client file...</div>
        </DashboardLayout>
      }
    >
      <EnquiryContent params={params} />
    </Suspense>
  );
}
