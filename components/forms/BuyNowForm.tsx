"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { orderInputSchema, type OrderInput } from "@/lib/schemas/order";

interface BuyNowFormProps {
  productId: string;
  basePrice: number;
  onDone: () => void;
}

export function BuyNowForm({ productId, basePrice, onDone }: BuyNowFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OrderInput>({
    resolver: zodResolver(orderInputSchema),
    defaultValues: { product_id: productId, offered_price: basePrice },
  });

  const onSubmit = async (data: OrderInput) => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Could not place order");
      toast.success("Order received");
      onDone();
      router.push(`/order/${body.id}`);
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
        <Label htmlFor="customer_name">Full name</Label>
        <Input id="customer_name" {...register("customer_name")} autoComplete="name" />
        {errors.customer_name && (
          <p className="mt-1 text-xs text-destructive">{errors.customer_name.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="customer_email">Email</Label>
          <Input id="customer_email" type="email" autoComplete="email" {...register("customer_email")} />
          {errors.customer_email && (
            <p className="mt-1 text-xs text-destructive">{errors.customer_email.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="customer_phone">Phone / WhatsApp</Label>
          <Input id="customer_phone" type="tel" autoComplete="tel" {...register("customer_phone")} />
          {errors.customer_phone && (
            <p className="mt-1 text-xs text-destructive">{errors.customer_phone.message}</p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="delivery_address">Delivery address</Label>
        <Textarea id="delivery_address" rows={3} {...register("delivery_address")} />
        {errors.delivery_address && (
          <p className="mt-1 text-xs text-destructive">{errors.delivery_address.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="notes">Notes (optional)</Label>
        <Textarea id="notes" rows={2} {...register("notes")} placeholder="Anything we should know?" />
      </div>

      <Button type="submit" variant="accent" size="lg" className="w-full" disabled={submitting}>
        {submitting ? "Submitting…" : "Submit order"}
      </Button>
      <p className="text-xs text-muted-foreground">
        After submitting you'll see bank transfer details and your order reference number.
      </p>
    </form>
  );
}
