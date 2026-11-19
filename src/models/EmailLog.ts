import mongoose, { Schema, Document, Model } from 'mongoose';
import { EmailType, EmailDeliveryStatusType } from '@/types';

export interface IEmailTimelineEvent {
  eventType: string;
  timestamp: Date;
  details?: string;
  data?: Record<string, unknown>;
}

export interface IEmailLog extends Document {
  resendEmailId?: string;
  recipient: string;
  sender: string;
  subject: string;
  emailType: EmailType;
  provider: string;
  status: EmailDeliveryStatusType;
  relatedEnquiryId?: mongoose.Types.ObjectId;
  relatedEnquiryReference?: string;
  errorMessage?: string;
  sentAt?: Date;
  deliveredAt?: Date;
  failedAt?: Date;
  bouncedAt?: Date;
  openedAt?: Date;
  lastOpenedAt?: Date;
  clickedAt?: Date;
  openedCount?: number;
  clickedCount?: number;
  lastEventAt?: Date;
  events: IEmailTimelineEvent[];
  eventHistory: IEmailTimelineEvent[];
  providerMetadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const EmailTimelineEventSchema = new Schema<IEmailTimelineEvent>(
  {
    eventType: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    details: { type: String },
    data: { type: Schema.Types.Mixed },
  },
  { _id: false }
);

const EmailLogSchema = new Schema<IEmailLog>(
  {
    resendEmailId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
      trim: true,
    },
    recipient: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    sender: {
      type: String,
      required: true,
      trim: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    emailType: {
      type: String,
      enum: [
        'admin_notification',
        'customer_acknowledgement',
        'newsletter_welcome',
        'newsletter_confirmation',
        'other',
      ],
      required: true,
      index: true,
    },
    provider: {
      type: String,
      default: 'resend',
    },
    status: {
      type: String,
      enum: [
        'queued',
        'sent',
        'delivered',
        'delivery_delayed',
        'bounced',
        'complained',
        'failed',
      ],
      default: 'queued',
      index: true,
    },
    relatedEnquiryId: {
      type: Schema.Types.ObjectId,
      ref: 'Enquiry',
      index: true,
    },
    relatedEnquiryReference: {
      type: String,
      index: true,
      trim: true,
    },
    errorMessage: {
      type: String,
      trim: true,
    },
    sentAt: {
      type: Date,
    },
    deliveredAt: {
      type: Date,
    },
    failedAt: {
      type: Date,
    },
    bouncedAt: {
      type: Date,
    },
    openedAt: {
      type: Date,
    },
    lastOpenedAt: {
      type: Date,
    },
    clickedAt: {
      type: Date,
    },
    openedCount: {
      type: Number,
      default: 0,
    },
    clickedCount: {
      type: Number,
      default: 0,
    },
    lastEventAt: {
      type: Date,
    },
    events: {
      type: [EmailTimelineEventSchema],
      default: [],
    },
    eventHistory: {
      type: [EmailTimelineEventSchema],
      default: [],
    },
    providerMetadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for fast reporting and lookups
EmailLogSchema.index({ status: 1, createdAt: -1 });
EmailLogSchema.index({ emailType: 1, createdAt: -1 });
EmailLogSchema.index({ recipient: 1, createdAt: -1 });
EmailLogSchema.index({ createdAt: -1 });

export const EmailLog: Model<IEmailLog> =
  mongoose.models.EmailLog || mongoose.model<IEmailLog>('EmailLog', EmailLogSchema);

export default EmailLog;
