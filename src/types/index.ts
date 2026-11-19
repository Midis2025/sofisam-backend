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

export type EmailType =
  | 'admin_notification'
  | 'customer_acknowledgement'
  | 'newsletter_welcome'
  | 'newsletter_confirmation'
  | 'other';

export type EmailDeliveryStatusType =
  | 'queued'
  | 'sent'
  | 'delivered'
  | 'delivery_delayed'
  | 'bounced'
  | 'complained'
  | 'failed';

export interface EmailTimelineEvent {
  eventType: string;
  name?: string;
  status?: string;
  timestamp: string | Date;
  details?: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

export interface EmailLogItem {
  _id: string;
  resendEmailId?: string;
  recipient: string;
  sender: string;
  subject: string;
  emailType: EmailType;
  provider: string;
  status: EmailDeliveryStatusType;
  relatedEnquiryId?: string;
  relatedEnquiryReference?: string;
  errorMessage?: string;
  errorCode?: string;
  bounceReason?: string;
  bounceType?: string;
  bounceSubtype?: string;
  createdAt: string;
  updatedAt?: string;
  sentAt?: string;
  deliveredAt?: string;
  failedAt?: string;
  bouncedAt?: string;
  openedAt?: string;
  lastOpenedAt?: string;
  clickedAt?: string;
  openedCount?: number;
  clickedCount?: number;
  lastEventAt?: string;
  events?: EmailTimelineEvent[];
  eventHistory?: EmailTimelineEvent[];
}

export interface EmailStats {
  totalEmails: number;
  totalSent: number;
  totalAccepted?: number;
  sent: number;
  delivered: number;
  pending: number;
  inTransit?: number;
  failed: number;
  bounced: number;
  complained: number;
  deliveryDelayed: number;
  deliveryRate: number;
  failureRate: number;
  opened?: number;
  uniqueOpened?: number;
  totalOpens?: number;
  openRate?: number;
  clicked?: number;
  uniqueClicked?: number;
  totalClicks?: number;
  clickRate?: number;
}

export interface EmailHealth {
  resendConfigured: boolean;
  webhookConfigured: boolean;
  webhookStatus: 'active' | 'not_configured' | 'error';
  senderDomain: string;
  totalWebhookEvents: number;
  totalWebhookEventsReceived?: number;
  totalWebhookEventsProcessed?: number;
  totalWebhookProcessingFailures?: number;
  lastWebhookReceivedAt?: string;
  lastProcessedAt?: string;
  lastProcessingError?: string;
  webhookUrl?: string;
  subscribedEvents?: string[];
  latestSuccessfulDispatch?: string;
  latestSuccessfulDelivery?: string;
  latestEmailFailure?: {
    timestamp: string;
    message: string;
  };
  recentFailureCount24h: number;
  overallDeliveryRate?: number;
  overallFailureRate?: number;
  lastDeliveredAt?: string;
  lastConfirmedDelivery?: string;
  lastEmailAttempt?: string;
  lastSuccessfulApiResponse?: string;
  lastFailedAt?: string;
  lastFailedReason?: string;
}

