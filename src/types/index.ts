export type FormType = 'private_enquiry' | 'contact';

export type EnquiryStatus = 'new' | 'contacted' | 'in_progress' | 'converted' | 'closed';

export type EnquiryPriority = 'low' | 'normal' | 'high';

export interface AdminNote {
  id: string;
  author: string;
  content: string;
  createdAt: string;
}

export interface Enquiry {
  _id: string;
  referenceId: string;
  formType: FormType;
  name: string;
  title?: string;
  email: string;
  company?: string;
  areaOfInterest?: string;
  message: string;
  status: EnquiryStatus;
  priority: EnquiryPriority;
  sourcePage: string;
  adminNotes?: AdminNote[];
  submittedAt: string;
  updatedAt: string;
}

export type SubscriberStatus = 'active' | 'unsubscribed';

export interface NewsletterSubscriber {
  _id: string;
  email: string;
  status: SubscriberStatus;
  sourcePage: string;
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
  newEnquiries: number;
  inProgressEnquiries: number;
  newsletterSubscribers: number;
  trends: {
    totalEnquiriesChange: number;
    newEnquiriesChange: number;
    inProgressChange: number;
    subscribersChange: number;
  };
  monthlySubmissions: Array<{
    month: string;
    enquiries: number;
    contacts: number;
    total: number;
  }>;
  statusDistribution: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  formTypeDistribution: Array<{
    name: string;
    value: number;
    color: string;
  }>;
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
