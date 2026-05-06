import { z } from "zod";

export const orderInputSchema = z.object({
  product_id: z.string().uuid(),
  customer_name: z.string().min(2).max(120),
  customer_email: z.string().email().max(200),
  customer_phone: z.string().min(6).max(40),
  delivery_address: z.string().min(8).max(1000),
  offered_price: z.number().positive().optional(),
  notes: z.string().max(2000).optional(),
});

export type OrderInput = z.infer<typeof orderInputSchema>;

export const offerInputSchema = z.object({
  product_id: z.string().uuid(),
  customer_name: z.string().min(2).max(120),
  customer_email: z.string().email().max(200),
  customer_phone: z.string().min(6).max(40),
  offered_price: z.number().positive(),
  message: z.string().max(2000).optional(),
});

export type OfferInput = z.infer<typeof offerInputSchema>;

export const waitlistInputSchema = z.object({
  product_id: z.string().uuid().nullable().optional(),
  customer_name: z.string().min(2).max(120),
  customer_email: z.string().email().max(200),
  customer_phone: z.string().min(6).max(40).optional(),
  notification_preference: z.enum(["email", "whatsapp", "both"]),
});

export type WaitlistInput = z.infer<typeof waitlistInputSchema>;

export const newsletterInputSchema = z.object({
  customer_email: z.string().email(),
  customer_name: z.string().min(1).max(120).optional(),
});

export type NewsletterInput = z.infer<typeof newsletterInputSchema>;

export const contactInputSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email().max(200),
  message: z.string().min(8).max(4000),
});

export type ContactInput = z.infer<typeof contactInputSchema>;
