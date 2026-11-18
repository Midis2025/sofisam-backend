'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Mail,
  Calendar,
  Globe,
  Send,
  Trash2,
  MessageSquare,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { StatusBadge, PriorityBadge, FormTypeBadge } from '@/components/ui/Badge';
import { Enquiry, EnquiryStatus, EnquiryPriority, AdminNote } from '@/types';
import { formatDate } from '@/lib/utils';

interface EnquiryDetailsProps {
  initialEnquiry: Enquiry;
}

export function EnquiryDetails({ initialEnquiry }: EnquiryDetailsProps) {
  const router = useRouter();
  const [enquiry, setEnquiry] = useState<Enquiry>(initialEnquiry);
  const [newNote, setNewNote] = useState('');
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleStatusChange = async (newStatus: EnquiryStatus) => {
    setEnquiry((prev) => ({
      ...prev,
      status: newStatus,
      updatedAt: new Date().toISOString(),
    }));

    try {
      await fetch(`/api/admin/enquiries/${enquiry._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handlePriorityChange = async (newPriority: EnquiryPriority) => {
    setEnquiry((prev) => ({
      ...prev,
      priority: newPriority,
      updatedAt: new Date().toISOString(),
    }));

    try {
      await fetch(`/api/admin/enquiries/${enquiry._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priority: newPriority }),
      });
    } catch (err) {
      console.error('Failed to update priority:', err);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim() || isSubmittingNote) return;

    const noteText = newNote.trim();
    setIsSubmittingNote(true);

    const noteItem: AdminNote = {
      id: `note-${Date.now()}`,
      author: 'Administrator',
      content: noteText,
      note: noteText,
      createdAt: new Date().toISOString(),
    };

    setEnquiry((prev) => ({
      ...prev,
      adminNotes: [...(prev.adminNotes || []), noteItem],
    }));
    setNewNote('');

    try {
      const res = await fetch(`/api/admin/enquiries/${enquiry._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: noteText }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          setEnquiry(data.data);
        }
      }
    } catch (err) {
      console.error('Failed to save note:', err);
    } finally {
      setIsSubmittingNote(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await fetch(`/api/admin/enquiries/${enquiry._id}`, {
        method: 'DELETE',
      });
      router.push('/enquiries');
    } catch (err) {
      console.error('Failed to delete enquiry:', err);
      setIsDeleting(false);
      setDeleteModalOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Navigation & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4.5 rounded-xl border border-[#E5E9EF] shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            href="/enquiries"
            className="p-2 rounded-lg text-[#7C8795] hover:bg-slate-100 hover:text-[#182536] transition-colors"
            title="Return to enquiries ledger"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-[#14243A] bg-slate-100 px-2 py-0.5 rounded">
                {enquiry.referenceId || enquiry.enquiryReference}
              </span>
              <FormTypeBadge formType={enquiry.formType} />
            </div>
            <h2 className="text-lg font-bold text-[#182536] mt-0.5">{enquiry.name}</h2>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href={`mailto:${enquiry.email}?subject=RE: SOFISAM Mandate ${enquiry.referenceId || enquiry.enquiryReference}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg bg-[#14243A] text-white hover:bg-[#1E3554] shadow-xs transition-colors"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Direct Email</span>
          </a>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setDeleteModalOpen(true)}
            className="text-xs text-rose-600 hover:bg-rose-50 hover:border-rose-200"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Submission Details & Message */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Content Card */}
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Mandate Request & Client Message</CardTitle>
                <p className="text-xs text-[#7C8795] mt-0.5">
                  Full context submitted from public portal
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Client Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-[#E5E9EF]">
                <div>
                  <span className="text-[11px] font-semibold text-[#7C8795] uppercase tracking-wider block">
                    Full Name
                  </span>
                  <span className="text-sm font-semibold text-[#182536] mt-0.5 block">
                    {enquiry.name}
                  </span>
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-[#7C8795] uppercase tracking-wider block">
                    Email Address
                  </span>
                  <span className="text-sm font-semibold text-[#182536] mt-0.5 block">
                    {enquiry.email}
                  </span>
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-[#7C8795] uppercase tracking-wider block">
                    Company / Organization
                  </span>
                  <span className="text-sm font-medium text-[#182536] mt-0.5 block">
                    {enquiry.company || enquiry.organisation || 'Not Specified'}
                  </span>
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-[#7C8795] uppercase tracking-wider block">
                    Classification
                  </span>
                  <span className="text-sm font-medium text-[#182536] mt-0.5 block">
                    {enquiry.formType === 'private_enquiry'
                      ? 'Private Office Mandate'
                      : 'Corporate Contact'}
                  </span>
                </div>

                <div className="sm:col-span-2">
                  <span className="text-[11px] font-semibold text-[#7C8795] uppercase tracking-wider block">
                    Area of Interest
                  </span>
                  <span className="text-sm font-medium text-[#B99A62] mt-0.5 block">
                    {enquiry.areaOfInterest || 'General Institutional Advisory'}
                  </span>
                </div>
              </div>

              {/* Message Body */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#7C8795] mb-2">
                  Client Message
                </h4>
                <div className="p-4 rounded-xl bg-[#FBF8F2] border border-[#DFD3BD] text-sm text-[#182536] leading-relaxed whitespace-pre-wrap font-serif">
                  {enquiry.message}
                </div>
              </div>

              {/* Submission Metadata */}
              <div className="pt-4 border-t border-[#E5E9EF] grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#7C8795]">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#B99A62]" />
                  <span>Submitted: {formatDate(enquiry.submittedAt)}</span>
                </div>
                <div className="flex items-center gap-2 truncate">
                  <Globe className="w-4 h-4 text-[#B99A62]" />
                  <span className="truncate">Source: {enquiry.sourcePage}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Internal Notes Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#B99A62]" />
                <CardTitle>Internal Executive Notes</CardTitle>
              </div>
              <span className="text-xs text-[#7C8795]">Strictly confidential (Admin only)</span>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {!enquiry.adminNotes || enquiry.adminNotes.length === 0 ? (
                  <p className="text-xs text-[#7C8795] py-2 italic">
                    No internal notes recorded yet for this client file.
                  </p>
                ) : (
                  enquiry.adminNotes.map((note, index) => (
                    <div
                      key={note.id || index}
                      className="p-3.5 rounded-lg bg-slate-50 border border-[#E5E9EF] text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between text-[11px] text-[#7C8795]">
                        <span className="font-semibold text-[#14243A]">
                          {note.author || 'Administrator'}
                        </span>
                        <span>{formatDate(note.createdAt)}</span>
                      </div>
                      <p className="text-sm text-[#182536] leading-relaxed">
                        {note.content || note.note}
                      </p>
                    </div>
                  ))
                )}
              </div>

              {/* Add Note Form */}
              <form onSubmit={handleAddNote} className="space-y-2 pt-3 border-t border-[#E5E9EF]">
                <textarea
                  rows={3}
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Record internal consultation notes, follow-up actions or executive instructions..."
                  className="w-full rounded-lg border border-[#E5E9EF] p-3 text-xs text-[#182536] placeholder-[#7C8795] focus:border-[#B99A62] focus:outline-none focus:ring-1 focus:ring-[#B99A62]"
                />
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    variant="gold"
                    size="sm"
                    disabled={!newNote.trim() || isSubmittingNote}
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSubmittingNote ? 'Saving...' : 'Save Note'}</span>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (1 Col): Status & Priority Controls */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Lifecycle & Governance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Status Selector */}
              <div>
                <label className="block text-xs font-semibold text-[#182536] mb-1.5">
                  Current Status
                </label>
                <div className="mb-2">
                  <StatusBadge status={enquiry.status} />
                </div>
                <Select
                  value={enquiry.status}
                  onChange={(e) => handleStatusChange(e.target.value as EnquiryStatus)}
                >
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="in_progress">In Progress</option>
                  <option value="converted">Converted</option>
                  <option value="closed">Closed</option>
                </Select>
                <p className="text-[11px] text-[#7C8795] mt-1">
                  Updates workflow step for this enquiry.
                </p>
              </div>

              {/* Priority Selector */}
              <div className="pt-4 border-t border-[#E5E9EF]">
                <label className="block text-xs font-semibold text-[#182536] mb-1.5">
                  Priority Rating
                </label>
                <div className="mb-2">
                  <PriorityBadge priority={enquiry.priority} />
                </div>
                <Select
                  value={enquiry.priority}
                  onChange={(e) => handlePriorityChange(e.target.value as EnquiryPriority)}
                >
                  <option value="low">Low Priority</option>
                  <option value="normal">Normal Priority</option>
                  <option value="high">High Priority</option>
                </Select>
              </div>

              {/* Channel badge summary */}
              <div className="pt-4 border-t border-[#E5E9EF] space-y-2">
                <div className="text-xs font-semibold text-[#182536]">Channel Validation</div>
                <div className="p-3 rounded-lg bg-slate-50 border border-[#E5E9EF] text-xs space-y-1">
                  <div className="text-[#7C8795]">Classification:</div>
                  <div className="font-semibold text-[#14243A]">
                    {enquiry.formType === 'private_enquiry'
                      ? 'Private Office / Institutional Mandate'
                      : 'General Corporate Contact'}
                  </div>
                  <div className="text-[11px] text-slate-400 pt-1">
                    Customer acknowledgement email dispatched upon intake.
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Enquiry Record"
        description="Are you sure you want to permanently delete this submission?"
        confirmLabel={isDeleting ? 'Deleting...' : 'Confirm Delete'}
        confirmVariant="danger"
        onConfirm={handleDelete}
      >
        <p className="text-xs text-[#182536]">
          This action will permanently delete record{' '}
          <strong>{enquiry.referenceId || enquiry.enquiryReference}</strong> from{' '}
          <strong>{enquiry.name}</strong>.
        </p>
      </Modal>
    </div>
  );
}
