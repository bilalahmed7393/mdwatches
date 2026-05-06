import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProductCard } from "@/components/product/ProductCard";
import type { ProductWithImages } from "@/types/database";

const baseProduct: ProductWithImages = {
  id: "p1",
  slug: "rolex-sub",
  name: "Submariner Date",
  brand: "Rolex",
  model: null,
  reference_number: null,
  description: null,
  price: 9800,
  offer_price: null,
  condition_grade: "Excellent",
  category: null,
  case_size_mm: null,
  movement_type: null,
  year: null,
  has_box: true,
  has_papers: true,
  stock_quantity: 1,
  status: "active",
  views_count: 0,
  is_featured: false,
  collection_id: null,
  meta_title: null,
  meta_description: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  images: [
    {
      id: "img1",
      product_id: "p1",
      image_url: "https://example.com/a.jpg",
      display_order: 0,
      is_primary: true,
      created_at: new Date().toISOString(),
    },
  ],
};

describe("ProductCard", () => {
  it("renders brand, name, and formatted price", () => {
    render(<ProductCard product={baseProduct} />);
    expect(screen.getByText("Rolex")).toBeInTheDocument();
    expect(screen.getByText("Submariner Date")).toBeInTheDocument();
    expect(screen.getByText("$9,800")).toBeInTheDocument();
  });

  it("shows SOLD overlay for sold products", () => {
    render(<ProductCard product={{ ...baseProduct, status: "sold" }} />);
    expect(screen.getByText("Sold")).toBeInTheDocument();
  });

  it("links to the product detail page", () => {
    render(<ProductCard product={baseProduct} />);
    const link = screen.getByRole("link");
    expect(link.getAttribute("href")).toBe("/shop/rolex-sub");
  });

  it("shows offer price with strikethrough on original", () => {
    render(
      <ProductCard
        product={{ ...baseProduct, offer_price: 8500 }}
      />,
    );
    expect(screen.getByText("$8,500")).toBeInTheDocument();
    expect(screen.getByText("$9,800")).toBeInTheDocument();
  });
});
