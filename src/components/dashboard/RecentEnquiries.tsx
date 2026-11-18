import React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { StatusBadge, FormTypeBadge } from '@/components/ui/Badge';
import { Enquiry } from '@/types';
import { formatDate } from '@/lib/utils';
import { ArrowRight, Eye } from 'lucide-react';

interface RecentEnquiriesProps {
  enquiries: Enquiry[];
}

export function RecentEnquiries({ enquiries }: RecentEnquiriesProps) {
  const latestFive = enquiries.slice(0, 5);

  return (
    <Card className="col-span-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Mandate & Contact Submissions</CardTitle>
          <CardDescription>Latest client submissions requiring administrator review</CardDescription>
        </div>
        <Link
          href="/enquiries"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#B99A62] hover:text-[#A6874E] transition-colors"
        >
          <span>View All Enquiries</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </CardHeader>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#F8F9FA] border-b border-[#E5E9EF] text-[11px] font-semibold uppercase tracking-wider text-[#7C8795]">
            <tr>
              <th className="py-3 px-6">Client / Prospect</th>
              <th className="py-3 px-6">Company / Organization</th>
              <th className="py-3 px-6">Form Type</th>
              <th className="py-3 px-6">Submitted</th>
              <th className="py-3 px-6">Status</th>
              <th className="py-3 px-6 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E9EF] bg-white">
            {latestFive.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-xs text-[#7C8795]">
                  No submissions recorded yet.
                </td>
              </tr>
            ) : (
              latestFive.map((enq) => (
                <tr
                  key={enq._id}
                  className="hover:bg-slate-50/70 transition-colors group"
                >
                  <td className="py-3.5 px-6">
                    <div className="font-semibold text-[#182536] group-hover:text-[#14243A]">
                      {enq.name}
                    </div>
                    <div className="text-xs text-[#7C8795]">{enq.email}</div>
                  </td>
                  <td className="py-3.5 px-6">
                    <div className="text-xs font-medium text-[#182536]">
                      {enq.company || '—'}
                    </div>
                    {enq.title && (
                      <div className="text-[11px] text-[#7C8795]">{enq.title}</div>
                    )}
                  </td>
                  <td className="py-3.5 px-6">
                    <FormTypeBadge formType={enq.formType} />
                  </td>
                  <td className="py-3.5 px-6 text-xs text-[#7C8795]">
                    {formatDate(enq.submittedAt)}
                  </td>
                  <td className="py-3.5 px-6">
                    <StatusBadge status={enq.status} />
                  </td>
                  <td className="py-3.5 px-6 text-right">
                    <Link
                      href={`/enquiries/${enq._id}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-[#14243A] hover:text-[#B99A62] hover:bg-slate-100 rounded-md transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Review</span>
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
