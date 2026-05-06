"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { waitlistInputSchema, type WaitlistInput } from "@/lib/schemas/order";

interface WaitlistFormProps {
  productId?: string;
  onDone: () => void;
}

export function WaitlistForm({ productId, onDone }: WaitlistFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<WaitlistInput>({
    resolver: zodResolver(waitlistInputSchema),
    defaultValues: { product_id: productId ?? null, notification_preference: "email" },
  });

  const onSubmit = async (data: WaitlistInput) => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("submit_failed");
      toast.success("You're on the waitlist.");
      onDone();
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="wl_name">Name</Label>
        <Input id="wl_name" {...register("customer_name")} />
        {errors.customer_name && (
          <p className="mt-1 text-xs text-destructive">{errors.customer_name.message}</p>
        )}
      </div>
      <div>
        <Label htmlFor="wl_email">Email</Label>
        <Input id="wl_email" type="email" {...register("customer_email")} />
        {errors.customer_email && (
          <p className="mt-1 text-xs text-destructive">{errors.customer_email.message}</p>
        )}
      </div>
      <div>
        <Label htmlFor="wl_phone">Phone (optional)</Label>
        <Input id="wl_phone" type="tel" {...register("customer_phone")} />
      </div>
      <div>
        <Label className="mb-2 block">Notify via</Label>
        <select
          {...register("notification_preference")}
          className="h-11 w-full rounded-md border bg-background px-3 text-sm"
        >
          <option value="email">Email</option>
          <option value="whatsapp">WhatsApp</option>
          <option value="both">Both</option>
        </select>
      </div>
      <Button type="submit" variant="accent" className="w-full" disabled={submitting}>
        {submitting ? "Submitting…" : "Join waitlist"}
      </Button>
    </form>
  );
}
