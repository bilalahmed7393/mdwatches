"use client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Trash2, Star, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  productInputSchema,
  type ProductInput,
  conditionGrades,
  productStatuses,
} from "@/lib/schemas/product";
import { createClient } from "@/lib/supabase/client";
import type { Collection, ProductImage } from "@/types/database";

interface ProductFormProps {
  collections: Collection[];
  initial?: Partial<ProductInput> & { id?: string };
  initialImages?: ProductImage[];
}

export function ProductForm({ collections, initial, initialImages = [] }: ProductFormProps) {
  const router = useRouter();
  const isEdit = Boolean(initial?.id);
  const [submitting, setSubmitting] = useState(false);
  const [images, setImages] = useState(initialImages);
  const [uploading, setUploading] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductInput>({
    resolver: zodResolver(productInputSchema),
    defaultValues: {
      name: initial?.name ?? "",
      brand: initial?.brand ?? "",
      slug: initial?.slug ?? "",
      model: initial?.model ?? "",
      reference_number: initial?.reference_number ?? "",
      description: initial?.description ?? "",
      price: initial?.price ?? 0,
      offer_price: initial?.offer_price ?? null,
      condition_grade: initial?.condition_grade ?? "Excellent",
      category: initial?.category ?? "",
      case_size_mm: initial?.case_size_mm ?? null,
      movement_type: initial?.movement_type ?? "",
      year: initial?.year ?? null,
      has_box: initial?.has_box ?? false,
      has_papers: initial?.has_papers ?? false,
      stock_quantity: initial?.stock_quantity ?? 1,
      status: initial?.status ?? "draft",
      is_featured: initial?.is_featured ?? false,
      collection_id: initial?.collection_id ?? null,
      meta_title: initial?.meta_title ?? "",
      meta_description: initial?.meta_description ?? "",
    },
  });

  async function uploadImage(file: File) {
    if (!initial?.id) {
      toast.error("Save the product first, then upload images.");
      return;
    }
    setUploading(true);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `products/${initial.id}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("product-images")
        .upload(path, file, { upsert: true, contentType: file.type });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("product-images").getPublicUrl(path);
      const res = await fetch(`/api/admin/products/${initial.id}/images`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image_url: pub.publicUrl,
          display_order: images.length,
          is_primary: images.length === 0,
        }),
      });
      const created = await res.json();
      if (!res.ok) throw new Error(created.error ?? "upload_failed");
      setImages((prev) => [...prev, created]);
      toast.success("Image uploaded.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function deleteImage(imageId: string) {
    if (!initial?.id) return;
    if (!confirm("Remove this image?")) return;
    const res = await fetch(`/api/admin/products/${initial.id}/images/${imageId}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setImages((prev) => prev.filter((i) => i.id !== imageId));
      toast.success("Image removed.");
    } else {
      toast.error("Failed to remove image.");
    }
  }

  async function makePrimary(imageId: string) {
    if (!initial?.id) return;
    const res = await fetch(`/api/admin/products/${initial.id}/images`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        order: images.map((img, idx) => ({
          id: img.id,
          display_order: idx,
          is_primary: img.id === imageId,
        })),
      }),
    });
    if (res.ok) {
      setImages((prev) => prev.map((i) => ({ ...i, is_primary: i.id === imageId })));
    }
  }

  const onSubmit = async (data: ProductInput) => {
    setSubmitting(true);
    try {
      const url = isEdit ? `/api/admin/products/${initial!.id}` : "/api/admin/products";
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "save_failed");
      toast.success(isEdit ? "Product updated." : "Product created.");
      if (!isEdit && body.id) {
        router.push(`/admin/products/${body.id}`);
      } else {
        router.refresh();
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        {/* Basic info */}
        <Section title="Basic info">
          <Field label="Name" error={errors.name?.message}>
            <Input {...register("name")} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Brand" error={errors.brand?.message}>
              <Input {...register("brand")} />
            </Field>
            <Field label="Model">
              <Input {...register("model")} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Reference number">
              <Input {...register("reference_number")} />
            </Field>
            <Field label="Slug (auto if blank)">
              <Input {...register("slug")} />
            </Field>
          </div>
          <Field label="Description">
            <Textarea rows={6} {...register("description")} />
          </Field>
        </Section>

        {/* Specs */}
        <Section title="Specifications">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Category">
              <Input {...register("category")} placeholder="Diver, Dress, Chronograph…" />
            </Field>
            <Field label="Case size (mm)">
              <Input type="number" step="0.5" {...register("case_size_mm", { valueAsNumber: true })} />
            </Field>
            <Field label="Movement">
              <Input {...register("movement_type")} placeholder="Automatic / Manual / Quartz" />
            </Field>
            <Field label="Year">
              <Input type="number" {...register("year", { valueAsNumber: true })} />
            </Field>
          </div>
          <div className="flex gap-6">
            <Controller
              control={control}
              name="has_box"
              render={({ field }) => (
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} /> Box
                </label>
              )}
            />
            <Controller
              control={control}
              name="has_papers"
              render={({ field }) => (
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} /> Papers
                </label>
              )}
            />
          </div>
        </Section>

        {/* Images */}
        <Section
          title="Images"
          description={!initial?.id ? "Save the product first, then upload images here." : undefined}
        >
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {images.map((img) => (
              <div key={img.id} className="group relative aspect-square overflow-hidden rounded-md border bg-muted">
                <Image src={img.image_url} alt="" fill sizes="200px" className="object-cover" />
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-background/80 p-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => makePrimary(img.id)}
                    title={img.is_primary ? "Primary image" : "Make primary"}
                  >
                    <Star className={`h-3 w-3 ${img.is_primary ? "fill-current" : ""}`} />
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => deleteImage(img.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
            {initial?.id && (
              <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed text-xs text-muted-foreground hover:bg-muted">
                <Upload className="mb-1 h-5 w-5" />
                {uploading ? "Uploading…" : "Add image"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) uploadImage(f);
                  }}
                />
              </label>
            )}
          </div>
        </Section>

        <Section title="SEO">
          <Field label="Meta title">
            <Input {...register("meta_title")} />
          </Field>
          <Field label="Meta description">
            <Textarea rows={2} {...register("meta_description")} />
          </Field>
        </Section>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        <Section title="Status">
          <Field label="Status">
            <select
              {...register("status")}
              className="h-11 w-full rounded-md border bg-background px-3 text-sm"
            >
              {productStatuses.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </Field>
          <Field label="Stock quantity">
            <Input type="number" {...register("stock_quantity", { valueAsNumber: true })} />
          </Field>
          <Controller
            control={control}
            name="is_featured"
            render={({ field }) => (
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                Featured on homepage
              </label>
            )}
          />
        </Section>

        <Section title="Pricing">
          <Field label="Price ($)" error={errors.price?.message}>
            <Input type="number" step="1" {...register("price", { valueAsNumber: true })} />
          </Field>
          <Field label="Offer price ($)">
            <Input type="number" step="1" {...register("offer_price", { valueAsNumber: true })} />
          </Field>
          <Field label="Condition">
            <select
              {...register("condition_grade")}
              className="h-11 w-full rounded-md border bg-background px-3 text-sm"
            >
              {conditionGrades.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </Field>
        </Section>

        <Section title="Collection">
          <select
            {...register("collection_id")}
            className="h-11 w-full rounded-md border bg-background px-3 text-sm"
          >
            <option value="">— None —</option>
            {collections.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </Section>

        <div className="sticky bottom-4 rounded-md border bg-background p-3 shadow">
          <Button type="submit" className="w-full" size="lg" disabled={submitting}>
            {submitting ? "Saving…" : isEdit ? "Save changes" : "Create product"}
          </Button>
        </div>
      </div>
    </form>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-md border bg-background p-5 space-y-4">
      <div>
        <h2 className="font-display text-lg">{title}</h2>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
      {children}
    </section>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label className="mb-1.5 block">{label}</Label>
      {children}
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}
