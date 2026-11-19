import mongoose, { Schema, Document, Model } from 'mongoose';
import { FormType, EnquiryStatus, EnquiryPriority } from '@/types';

export interface IAdminNote {
  note: string;
  createdAt: Date;
}

export interface IEmailStatus {
  adminNotification: 'pending' | 'sent' | 'failed';
  customerAcknowledgement: 'pending' | 'sent' | 'failed';
}

export interface IEnquiry extends Document {
  enquiryReference: string;
  formType: FormType;
  nameAndTitle?: string;
  fullName?: string;
  email: string;
  organisation?: string;
  company?: string;
  phone?: string;
  subject?: string;
  areaOfInterest?: string;
  message: string;
  status: EnquiryStatus;
  priority: EnquiryPriority;
  sourcePage: string;
  adminNotes: IAdminNote[];
  emailStatus: IEmailStatus;
  submittedAt: Date;
  updatedAt: Date;
}

const AdminNoteSchema = new Schema<IAdminNote>(
  {
    note: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const EmailStatusSchema = new Schema<IEmailStatus>(
  {
    adminNotification: {
      type: String,
      enum: ['pending', 'sent', 'failed'],
      default: 'pending',
    },
    customerAcknowledgement: {
      type: String,
      enum: ['pending', 'sent', 'failed'],
      default: 'pending',
    },
  },
  { _id: false }
);

const EnquirySchema = new Schema<IEnquiry>(
  {
    enquiryReference: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    formType: {
      type: String,
      enum: ['private_enquiry', 'contact'],
      required: true,
      index: true,
    },
    nameAndTitle: {
      type: String,
      trim: true,
    },
    fullName: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    organisation: {
      type: String,
      trim: true,
    },
    company: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    subject: {
      type: String,
      trim: true,
    },
    areaOfInterest: {
      type: String,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['new', 'contacted', 'in_progress', 'converted', 'closed'],
      default: 'new',
      index: true,
    },
    priority: {
      type: String,
      enum: ['low', 'normal', 'high'],
      default: 'normal',
      index: true,
    },
    sourcePage: {
      type: String,
      default: 'https://sofisam-seven.vercel.app/',
    },
    adminNotes: {
      type: [AdminNoteSchema],
      default: [],
    },
    emailStatus: {
      type: EmailStatusSchema,
      default: () => ({
        adminNotification: 'pending',
        customerAcknowledgement: 'pending',
      }),
    },
    submittedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual helper for unified name presentation in dashboard
EnquirySchema.virtual('displayName').get(function () {
  return this.fullName || this.nameAndTitle || 'Anonymous Client';
});

// Virtual helper for unified organisation presentation in dashboard
EnquirySchema.virtual('displayOrganisation').get(function () {
  return this.company || this.organisation || '';
});

export const Enquiry: Model<IEnquiry> =
  mongoose.models.Enquiry || mongoose.model<IEnquiry>('Enquiry', EnquirySchema);

export default Enquiry;
