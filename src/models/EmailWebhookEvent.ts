import mongoose, { Schema, Document, Model } from 'mongoose';

export type WebhookProcessingStatus = 'success' | 'duplicate' | 'unmatched' | 'failed';

export interface IEmailWebhookEvent extends Document {
  eventId: string;
  eventType: string;
  resendEmailId?: string;
  processedAt: Date;
  processingStatus: WebhookProcessingStatus;
  payload?: Record<string, unknown>;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const EmailWebhookEventSchema = new Schema<IEmailWebhookEvent>(
  {
    eventId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    eventType: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    resendEmailId: {
      type: String,
      index: true,
      trim: true,
    },
    processedAt: {
      type: Date,
      default: Date.now,
    },
    processingStatus: {
      type: String,
      enum: ['success', 'duplicate', 'unmatched', 'failed'],
      default: 'success',
      index: true,
    },
    payload: {
      type: Schema.Types.Mixed,
    },
    errorMessage: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

EmailWebhookEventSchema.index({ createdAt: -1 });

export const EmailWebhookEvent: Model<IEmailWebhookEvent> =
  mongoose.models.EmailWebhookEvent ||
  mongoose.model<IEmailWebhookEvent>('EmailWebhookEvent', EmailWebhookEventSchema);

export default EmailWebhookEvent;
