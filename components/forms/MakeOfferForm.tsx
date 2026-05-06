"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { offerInputSchema, type OfferInput } from "@/lib/schemas/order";

interface MakeOfferFormProps {
  productId: string;
  onDone: () => void;
}

export function MakeOfferForm({ productId, onDone }: MakeOfferFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OfferInput>({
    resolver: zodResolver(offerInputSchema),
    defaultValues: { product_id: productId },
  });

  const onSubmit = async (data: OfferInput) => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Could not submit offer");
      }
      toast.success("Offer submitted");
      onDone();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <input type="hidden" {...register("product_id")} value={productId} />

      <div>
        <Label htmlFor="offer_name">Full name</Label>
        <Input id="offer_name" {...register("customer_name")} autoComplete="name" />
        {errors.customer_name && (
          <p className="mt-1 text-xs text-destructive">{errors.customer_name.message}</p>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="offer_email">Email</Label>
          <Input id="offer_email" type="email" {...register("customer_email")} />
          {errors.customer_email && (
            <p className="mt-1 text-xs text-destructive">{errors.customer_email.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="offer_phone">Phone</Label>
          <Input id="offer_phone" type="tel" {...register("customer_phone")} />
          {errors.customer_phone && (
            <p className="mt-1 text-xs text-destructive">{errors.customer_phone.message}</p>
          )}
        </div>
      </div>
      <div>
        <Label htmlFor="offered_price">Your offer ($)</Label>
        <Input
          id="offered_price"
          type="number"
          step="1"
          inputMode="numeric"
          {...register("offered_price", { valueAsNumber: true })}
        />
        {errors.offered_price && (
          <p className="mt-1 text-xs text-destructive">Enter a positive amount</p>
        )}
      </div>
      <div>
        <Label htmlFor="message">Message (optional)</Label>
        <Textarea id="message" rows={3} {...register("message")} />
      </div>
      <Button type="submit" variant="accent" size="lg" className="w-full" disabled={submitting}>
        {submitting ? "Submitting…" : "Send offer"}
      </Button>
    </form>
  );
}
