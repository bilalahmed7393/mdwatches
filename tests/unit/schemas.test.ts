import { describe, expect, it } from "vitest";
import { orderInputSchema, offerInputSchema } from "@/lib/schemas/order";
import { productInputSchema } from "@/lib/schemas/product";

describe("orderInputSchema", () => {
  it("accepts a complete payload", () => {
    const result = orderInputSchema.safeParse({
      product_id: "00000000-0000-0000-0000-000000000000",
      customer_name: "John Doe",
      customer_email: "john@example.com",
      customer_phone: "+15551234567",
      delivery_address: "123 Main Street, NY",
    });
    expect(result.success).toBe(true);
  });
  it("rejects bad email", () => {
    const result = orderInputSchema.safeParse({
      product_id: "00000000-0000-0000-0000-000000000000",
      customer_name: "John",
      customer_email: "not-an-email",
      customer_phone: "+15551234567",
      delivery_address: "addr",
    });
    expect(result.success).toBe(false);
  });
});

describe("offerInputSchema", () => {
  it("requires positive offered_price", () => {
    const result = offerInputSchema.safeParse({
      product_id: "00000000-0000-0000-0000-000000000000",
      customer_name: "Jane",
      customer_email: "j@example.com",
      customer_phone: "+15551234567",
      offered_price: -100,
    });
    expect(result.success).toBe(false);
  });
});

describe("productInputSchema", () => {
  it("rejects negative price", () => {
    const result = productInputSchema.safeParse({
      name: "Watch",
      brand: "Brand",
      price: -1,
      condition_grade: "Excellent",
      has_box: false,
      has_papers: false,
      stock_quantity: 1,
      status: "active",
      is_featured: false,
    });
    expect(result.success).toBe(false);
  });
  it("accepts a valid product", () => {
    const result = productInputSchema.safeParse({
      name: "Submariner",
      brand: "Rolex",
      price: 9000,
      condition_grade: "Excellent",
      has_box: true,
      has_papers: true,
      stock_quantity: 1,
      status: "active",
      is_featured: false,
    });
    expect(result.success).toBe(true);
  });
});
