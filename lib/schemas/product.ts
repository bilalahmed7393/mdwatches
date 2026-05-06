import { z } from "zod";

export const conditionGrades = ["Mint", "Excellent", "Very Good", "Good", "Fair"] as const;
export const productStatuses = ["active", "sold", "reserved", "draft"] as const;

export const productInputSchema = z.object({
  slug: z.string().min(2).max(160).optional(),
  name: z.string().min(2).max(200),
  brand: z.string().min(1).max(120),
  model: z.string().max(120).optional().nullable(),
  reference_number: z.string().max(120).optional().nullable(),
  description: z.string().max(5000).optional().nullable(),
  price: z.number().nonnegative(),
  offer_price: z.number().nonnegative().optional().nullable(),
  condition_grade: z.enum(conditionGrades),
  category: z.string().max(120).optional().nullable(),
  case_size_mm: z.number().positive().optional().nullable(),
  movement_type: z.string().max(120).optional().nullable(),
  year: z.number().int().min(1900).max(2100).optional().nullable(),
  has_box: z.boolean(),
  has_papers: z.boolean(),
  stock_quantity: z.number().int().nonnegative(),
  status: z.enum(productStatuses),
  is_featured: z.boolean(),
  collection_id: z.string().uuid().optional().nullable(),
  meta_title: z.string().max(200).optional().nullable(),
  meta_description: z.string().max(400).optional().nullable(),
});

export type ProductInput = z.infer<typeof productInputSchema>;

export const promoCodeInputSchema = z.object({
  code: z.string().min(2).max(40),
  discount_type: z.enum(["percentage", "fixed"]),
  discount_value: z.number().positive(),
  min_order_value: z.number().nonnegative().optional().nullable(),
  max_uses: z.number().int().positive().optional().nullable(),
  is_active: z.boolean(),
  expires_at: z.string().datetime().optional().nullable(),
});

export type PromoCodeInput = z.infer<typeof promoCodeInputSchema>;

export const collectionInputSchema = z.object({
  name: z.string().min(2).max(120),
  slug: z.string().min(2).max(120),
  description: z.string().max(2000).optional().nullable(),
  cover_image_url: z.string().url().optional().nullable(),
  display_order: z.number().int().nonnegative(),
  is_active: z.boolean(),
});

export type CollectionInput = z.infer<typeof collectionInputSchema>;
