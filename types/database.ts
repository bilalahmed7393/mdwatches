// MD Watches — Supabase types
// Hand-curated to mirror supabase/migrations/0001_init.sql.
// Regenerate with `npm run db:types` once a Supabase project is provisioned.

export type ConditionGrade = "Mint" | "Excellent" | "Very Good" | "Good" | "Fair";
export type ProductStatus = "active" | "sold" | "reserved" | "draft";
export type OrderStatus =
  | "pending"
  | "payment_submitted"
  | "payment_confirmed"
  | "shipped"
  | "delivered"
  | "cancelled";
export type OfferStatus = "pending" | "accepted" | "rejected" | "countered";
export type AdminRole = "owner" | "staff";
export type DiscountType = "percentage" | "fixed";
export type NotificationPref = "email" | "whatsapp" | "both";
export type SettingType = "text" | "image" | "json" | "boolean";

export interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  cover_image_url: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  brand: string;
  model: string | null;
  reference_number: string | null;
  description: string | null;
  price: number;
  offer_price: number | null;
  condition_grade: ConditionGrade;
  category: string | null;
  case_size_mm: number | null;
  movement_type: string | null;
  year: number | null;
  has_box: boolean;
  has_papers: boolean;
  stock_quantity: number;
  status: ProductStatus;
  views_count: number;
  is_featured: boolean;
  collection_id: string | null;
  meta_title: string | null;
  meta_description: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  display_order: number;
  is_primary: boolean;
  created_at: string;
}

export interface ProductCertificate {
  id: string;
  product_id: string;
  certificate_url: string;
  certificate_type: string | null;
  created_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  product_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  delivery_address: string;
  offered_price: number | null;
  final_price: number;
  status: OrderStatus;
  payment_proof_url: string | null;
  tracking_number: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Offer {
  id: string;
  product_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  offered_price: number;
  message: string | null;
  status: OfferStatus;
  admin_response: string | null;
  created_at: string;
}

export interface WaitlistEntry {
  id: string;
  product_id: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  notification_preference: NotificationPref;
  is_general_newsletter: boolean;
  created_at: string;
}

export interface SiteSetting {
  id: string;
  key: string;
  value: string | null;
  type: SettingType;
  section: string;
  updated_at: string;
}

export interface AnalyticsEvent {
  id: string;
  event_type: string;
  product_id: string | null;
  session_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface AdminProfile {
  id: string;
  role: AdminRole;
  full_name: string | null;
  created_at: string;
}

export interface PromoCode {
  id: string;
  code: string;
  discount_type: DiscountType;
  discount_value: number;
  min_order_value: number | null;
  max_uses: number | null;
  current_uses: number;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
}

export interface InstagramPost {
  id: string;
  instagram_id: string;
  media_url: string;
  thumbnail_url: string | null;
  caption: string | null;
  permalink: string | null;
  posted_at: string | null;
  is_imported: boolean;
  linked_product_id: string | null;
  created_at: string;
}

// Joined / view types
export interface ProductWithImages extends Product {
  images: ProductImage[];
  collection?: Collection | null;
}

export interface DashboardStats {
  active_products: number;
  sold_products: number;
  pending_orders: number;
  orders_today: number;
  pending_offers: number;
  confirmed_revenue: number;
}

// Generic Supabase Database type — minimal shape for client typing.
export interface Database {
  public: {
    Tables: {
      products: { Row: Product; Insert: Partial<Product>; Update: Partial<Product> };
      product_images: { Row: ProductImage; Insert: Partial<ProductImage>; Update: Partial<ProductImage> };
      product_certificates: { Row: ProductCertificate; Insert: Partial<ProductCertificate>; Update: Partial<ProductCertificate> };
      collections: { Row: Collection; Insert: Partial<Collection>; Update: Partial<Collection> };
      orders: { Row: Order; Insert: Partial<Order>; Update: Partial<Order> };
      offers: { Row: Offer; Insert: Partial<Offer>; Update: Partial<Offer> };
      waitlist: { Row: WaitlistEntry; Insert: Partial<WaitlistEntry>; Update: Partial<WaitlistEntry> };
      site_settings: { Row: SiteSetting; Insert: Partial<SiteSetting>; Update: Partial<SiteSetting> };
      analytics_events: { Row: AnalyticsEvent; Insert: Partial<AnalyticsEvent>; Update: Partial<AnalyticsEvent> };
      admin_profiles: { Row: AdminProfile; Insert: Partial<AdminProfile>; Update: Partial<AdminProfile> };
      promo_codes: { Row: PromoCode; Insert: Partial<PromoCode>; Update: Partial<PromoCode> };
      instagram_posts: { Row: InstagramPost; Insert: Partial<InstagramPost>; Update: Partial<InstagramPost> };
    };
    Views: {
      admin_dashboard_stats: { Row: DashboardStats };
    };
    Functions: {
      increment_product_views: { Args: { p_slug: string }; Returns: void };
      is_admin: { Args: Record<string, never>; Returns: boolean };
      is_owner: { Args: Record<string, never>; Returns: boolean };
    };
  };
}
