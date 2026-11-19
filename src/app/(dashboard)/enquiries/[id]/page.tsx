import React, { Suspense } from 'react';
import { notFound } from 'next/navigation';
import mongoose from 'mongoose';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { EnquiryDetails } from '@/components/enquiries/EnquiryDetails';
import connectToDatabase from '@/lib/mongodb';
import Enquiry from '@/models/Enquiry';
import { Enquiry as EnquiryType } from '@/types';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

async function EnquiryContent({ params }: PageProps) {
  const { id } = await params;
  await connectToDatabase();

  const filter = mongoose.Types.ObjectId.isValid(id)
    ? { $or: [{ _id: id }, { enquiryReference: id }] }
    : { enquiryReference: id };

  const doc = await Enquiry.findOne(filter).lean();

  if (!doc) {
    notFound();
  }

  const name = doc.fullName || doc.nameAndTitle || 'Anonymous Client';
  const company = doc.company || doc.organisation || '';
  const ref = doc.enquiryReference || '';

  const enquiry: EnquiryType = {
    _id: doc._id.toString(),
    enquiryReference: ref,
    referenceId: ref,
    formType: doc.formType,
    name,
    fullName: doc.fullName || '',
    nameAndTitle: doc.nameAndTitle || '',
    email: doc.email,
    company,
    organisation: doc.organisation || '',
    areaOfInterest: doc.areaOfInterest || '',
    message: doc.message,
    status: doc.status,
    priority: doc.priority,
    sourcePage: doc.sourcePage,
    adminNotes: (doc.adminNotes || []).map((n: { note?: string; content?: string; createdAt?: Date | string }) => ({
      note: n.note || n.content || '',
      content: n.content || n.note || '',
      createdAt: n.createdAt ? new Date(n.createdAt).toISOString() : new Date().toISOString(),
    })),
    emailStatus: doc.emailStatus || {
      adminNotification: 'pending',
      customerAcknowledgement: 'pending',
    },
    submittedAt: doc.submittedAt ? new Date(doc.submittedAt).toISOString() : new Date().toISOString(),
    updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : new Date().toISOString(),
  };

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
          <div className="p-8 text-center text-xs text-[#66625B]">Loading client file...</div>
        </DashboardLayout>
      }
    >
      <EnquiryContent params={params} />
    </Suspense>
  );
}
