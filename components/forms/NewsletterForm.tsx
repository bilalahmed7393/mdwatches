"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { newsletterInputSchema, type NewsletterInput } from "@/lib/schemas/order";

export function NewsletterForm() {
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NewsletterInput>({
    resolver: zodResolver(newsletterInputSchema),
  });

  const onSubmit = async (data: NewsletterInput) => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: data.customer_name ?? data.customer_email.split("@")[0],
          customer_email: data.customer_email,
          notification_preference: "email",
          product_id: null,
        }),
      });
      if (!res.ok) throw new Error("submit_failed");
      toast.success("You're on the list.");
      reset();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-3 flex gap-2">
      <Input
        type="email"
        placeholder="you@example.com"
        aria-label="Email"
        autoComplete="email"
        {...register("customer_email")}
      />
      <Button type="submit" variant="accent" disabled={submitting}>
        {submitting ? "…" : "Join"}
      </Button>
      {errors.customer_email && (
        <span className="text-xs text-destructive">Valid email required</span>
      )}
    </form>
  );
}
