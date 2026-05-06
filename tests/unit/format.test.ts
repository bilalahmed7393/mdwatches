import { describe, expect, it } from "vitest";
import {
  formatPrice,
  slugify,
  generateOrderNumber,
  buildWhatsappLink,
} from "@/lib/utils/format";

describe("formatPrice", () => {
  it("formats whole-dollar amounts in USD by default", () => {
    expect(formatPrice(2500)).toBe("$2,500");
  });
  it("respects currency override", () => {
    expect(formatPrice(1000, "EUR")).toContain("1,000");
  });
});

describe("slugify", () => {
  it("lowercases and joins with hyphens", () => {
    expect(slugify("Rolex Submariner Date")).toBe("rolex-submariner-date");
  });
  it("strips punctuation", () => {
    expect(slugify("Omega Speedmaster ('Moonwatch')")).toBe("omega-speedmaster-moonwatch");
  });
  it("trims leading/trailing hyphens", () => {
    expect(slugify("--hello--")).toBe("hello");
  });
});

describe("generateOrderNumber", () => {
  it("starts with MD- and includes today's date", () => {
    const n = generateOrderNumber();
    expect(n).toMatch(/^MD-\d{8}-[A-Z0-9]{5}$/);
  });
  it("returns unique values", () => {
    const a = generateOrderNumber();
    const b = generateOrderNumber();
    expect(a).not.toBe(b);
  });
});

describe("buildWhatsappLink", () => {
  it("strips non-digits from the phone", () => {
    const link = buildWhatsappLink("+1 (555) 123-4567", "Hi");
    expect(link).toContain("https://wa.me/15551234567");
  });
  it("URL-encodes the message", () => {
    const link = buildWhatsappLink("123", "hi & bye");
    expect(link).toContain("hi%20%26%20bye");
  });
});
