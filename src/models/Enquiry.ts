import mongoose, { Schema, Document, Model } from 'mongoose';
import { FormType, EnquiryStatus, EnquiryPriority } from '@/types';

export interface IAdminNote {
  id: string;
  author: string;
  content: string;
  createdAt: Date;
}

export interface IEnquiry extends Document {
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
  adminNotes: IAdminNote[];
  submittedAt: Date;
  updatedAt: Date;
}

const AdminNoteSchema = new Schema<IAdminNote>(
  {
    id: { type: String, required: true },
    author: { type: String, required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const EnquirySchema = new Schema<IEnquiry>(
  {
    referenceId: {
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
    name: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
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
    company: {
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
    submittedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Enquiry: Model<IEnquiry> =
  mongoose.models.Enquiry || mongoose.model<IEnquiry>('Enquiry', EnquirySchema);

export default Enquiry;
