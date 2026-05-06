"use client";
import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils/cn";
import type { ProductImage } from "@/types/database";

interface ProductGalleryProps {
  images: ProductImage[];
  sold?: boolean;
}

export function ProductGallery({ images, sold = false }: ProductGalleryProps) {
  const [active, setActive] = useState(0);
  if (images.length === 0) {
    return (
      <div className="aspect-square w-full rounded-md bg-muted flex items-center justify-center text-sm text-muted-foreground">
        No image
      </div>
    );
  }
  return (
    <div className="space-y-3">
      <div className="relative aspect-square w-full overflow-hidden rounded-md bg-muted">
        <Image
          src={images[active].image_url}
          alt=""
          fill
          priority
          sizes="(max-width:768px) 100vw, 50vw"
          className={cn("object-cover", sold && "opacity-80")}
        />
        {sold && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="rounded-sm bg-foreground/90 px-4 py-2 font-display text-2xl uppercase tracking-[0.25em] text-background">
              Sold
            </span>
          </div>
        )}
      </div>
      {images.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {images.map((img, i) => (
            <button
              key={img.id}
              type="button"
              aria-label={`Image ${i + 1}`}
              onClick={() => setActive(i)}
              className={cn(
                "relative aspect-square overflow-hidden rounded-md ring-offset-background transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                i === active ? "ring-2 ring-foreground" : "opacity-70 hover:opacity-100",
              )}
            >
              <Image
                src={img.image_url}
                alt=""
                fill
                sizes="20vw"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
