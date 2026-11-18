import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .toLowerCase(),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

export const registerSuperAdminSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, 'Full name must be at least 2 characters')
      .max(100, 'Full name cannot exceed 100 characters'),
    email: z
      .string()
      .trim()
      .min(1, 'Email address is required')
      .email('Please enter a valid email address')
      .toLowerCase(),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters long')
      .regex(/[A-Z]/, 'Password must include at least one uppercase letter')
      .regex(/[a-z]/, 'Password must include at least one lowercase letter')
      .regex(/[0-9]/, 'Password must include at least one number')
      .max(100, 'Password cannot exceed 100 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const enquirySubmissionSchema = z.object({
  formType: z.enum(['private_enquiry', 'contact']).default('private_enquiry'),
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  title: z.string().trim().max(100).optional().nullable(),
  email: z.string().trim().email('Invalid email address').toLowerCase(),
  company: z.string().trim().max(150).optional().nullable(),
  areaOfInterest: z.string().trim().max(200).optional().nullable(),
  message: z.string().trim().min(10, 'Message must be at least 10 characters').max(5000),
  sourcePage: z.string().trim().url().optional().default('https://sofisam-seven.vercel.app/'),
});

export const contactSubmissionSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().trim().email('Invalid email address').toLowerCase(),
  company: z.string().trim().max(150).optional().nullable(),
  message: z.string().trim().min(10, 'Message must be at least 10 characters').max(5000),
  sourcePage: z.string().trim().url().optional().default('https://sofisam-seven.vercel.app/contact'),
});

export const newsletterSubmissionSchema = z.object({
  email: z.string().trim().email('Invalid email address').toLowerCase(),
  sourcePage: z.string().trim().url().optional().default('https://sofisam-seven.vercel.app/'),
});
