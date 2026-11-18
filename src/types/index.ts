export type FormType = 'private_enquiry' | 'contact';

export type EnquiryStatus = 'new' | 'contacted' | 'in_progress' | 'converted' | 'closed';

export type EnquiryPriority = 'low' | 'normal' | 'high';

export interface AdminNote {
  id?: string;
  author?: string;
  note?: string;
  content?: string;
  createdAt: string | Date;
}

export interface EmailDeliveryStatus {
  adminNotification: 'pending' | 'sent' | 'failed';
  customerAcknowledgement: 'pending' | 'sent' | 'failed';
}

export interface Enquiry {
  _id: string;
  enquiryReference?: string;
  referenceId?: string; // Backwards compatible alias
  formType: FormType;
  nameAndTitle?: string;
  fullName?: string;
  name?: string; // Unified display alias
  displayName?: string;
  title?: string; // Job title alias
  email: string;
  organisation?: string;
  company?: string;
  displayOrganisation?: string;
  areaOfInterest?: string;
  message: string;
  status: EnquiryStatus;
  priority: EnquiryPriority;
  sourcePage: string;
  adminNotes?: AdminNote[];
  emailStatus?: EmailDeliveryStatus;
  submittedAt: string;
  updatedAt: string;
}

export type SubscriberStatus = 'active' | 'unsubscribed';

export interface NewsletterSubscriber {
  _id: string;
  email: string;
  status: SubscriberStatus;
  sourcePage: string;
  consent?: boolean;
  subscribedAt: string;
  unsubscribedAt?: string;
}

export interface AdminUser {
  _id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

export interface DashboardStats {
  totalEnquiries: number;
  newSubmissions?: number;
  newEnquiries?: number;
  inProgress?: number;
  inProgressEnquiries?: number;
  newsletterSubscribers: number;
  activeNewsletterSubscribers?: number;
  previousPeriod?: {
    totalEnquiries: number;
    newSubmissions: number;
  };
  changes?: {
    totalEnquiries: number | null;
    newSubmissions: number | null;
    inProgress?: number | null;
    newsletterSubscribers?: number | null;
  };
  trends?: {
    totalEnquiriesChange?: number;
    newEnquiriesChange?: number;
    inProgressChange?: number;
    subscribersChange?: number;
  };
  monthlySubmissions?: {
    month: string;
    enquiries: number;
    contacts: number;
    total: number;
  }[];
  statusDistribution?: {
    name: string;
    value: number;
    color: string;
  }[];
  formTypeDistribution?: {
    name: string;
    value: number;
    color: string;
  }[];
}

export interface AnalyticsVolume {
  label: string;
  date?: string;
  month?: string;
  year?: number;
  day?: number;
  enquiries: number;
  contacts: number;
  privateEnquiries: number;
  contactForms: number;
  total: number;
}

export interface AnalyticsDistribution {
  status: EnquiryStatus;
  name: string;
  value?: number;
  count: number;
  percentage: number;
  color?: string;
}

export interface DashboardAnalytics {
  period?: '1m' | '3m';
  periodLabel?: string;
  volume?: AnalyticsVolume[];
  monthlyVolume: AnalyticsVolume[];
  statusDistribution: AnalyticsDistribution[];
  formTypeDistribution?: {
    name: string;
    value: number;
    color: string;
    count?: number;
  }[];
  channelDistribution: {
    privateEnquiries: number;
    contactForms: number;
    privateOffice?: number;
    contact?: number;
  };
  totalPeriodEnquiries?: number;
}

export interface FilterState {
  search: string;
  formType: 'all' | FormType;
  status: 'all' | EnquiryStatus;
  priority: 'all' | EnquiryPriority;
  dateRange: 'all' | '7d' | '30d' | '90d';
  sortBy: 'newest' | 'oldest';
  page: number;
  limit: number;
}
