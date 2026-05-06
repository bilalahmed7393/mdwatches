"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z
  .object({
    full_name: z.string().min(1, "Name is required").max(120),
    email: z.string().email(),
    password: z.union([z.string().length(0), z.string().min(8, "At least 8 characters").max(72)]).optional(),
    confirm_password: z.string().optional(),
  })
  .refine((d) => !d.password || d.password === d.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"],
  });

type Form = z.infer<typeof schema>;

export function AccountForm({
  initialName,
  initialEmail,
  role,
}: {
  initialName: string;
  initialEmail: string;
  role: "owner" | "staff";
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { full_name: initialName, email: initialEmail, password: "", confirm_password: "" },
  });

  const onSubmit = async (data: Form) => {
    setBusy(true);
    try {
      const payload: Record<string, string> = {};
      if (data.full_name && data.full_name !== initialName) payload.full_name = data.full_name;
      if (data.email && data.email !== initialEmail) payload.email = data.email;
      if (data.password) payload.password = data.password;

      if (Object.keys(payload).length === 0) {
        toast.info("Nothing to update.");
        return;
      }

      const res = await fetch("/api/admin/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? "save_failed");
      toast.success("Account updated.");
      reset({ ...data, password: "", confirm_password: "" });
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-6">
      <section className="space-y-4 rounded-md border bg-background p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg">Profile</h2>
          <Badge variant="outline">{role}</Badge>
        </div>
        <div>
          <Label className="mb-1.5 block">Full name</Label>
          <Input {...register("full_name")} />
          {errors.full_name && <p className="mt-1 text-xs text-destructive">{errors.full_name.message}</p>}
        </div>
        <div>
          <Label className="mb-1.5 block">Email</Label>
          <Input type="email" {...register("email")} />
          {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
          <p className="mt-1 text-xs text-muted-foreground">
            Used to sign in. Changing this updates your login email immediately.
          </p>
        </div>
      </section>

      <section className="space-y-4 rounded-md border bg-background p-6">
        <h2 className="font-display text-lg">Change password</h2>
        <p className="text-xs text-muted-foreground">
          Leave both fields blank to keep your current password.
        </p>
        <div>
          <Label className="mb-1.5 block">New password</Label>
          <Input type="password" autoComplete="new-password" {...register("password")} />
          {errors.password && <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>}
        </div>
        <div>
          <Label className="mb-1.5 block">Confirm new password</Label>
          <Input type="password" autoComplete="new-password" {...register("confirm_password")} />
          {errors.confirm_password && (
            <p className="mt-1 text-xs text-destructive">{errors.confirm_password.message}</p>
          )}
        </div>
      </section>

      <div className="sticky bottom-2 rounded-md border bg-background p-3 shadow-md">
        <Button type="submit" className="w-full" size="lg" disabled={busy}>
          {busy ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
