"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function InviteUserForm() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"owner" | "staff">("staff");

  async function invite() {
    if (!email || !name) return;
    setBusy(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, full_name: name, role }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "invite_failed");
      toast.success(`Invitation sent to ${email}.`);
      setEmail("");
      setName("");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Invite failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-md border bg-background p-5 space-y-3">
      <h2 className="font-display text-lg">Invite admin</h2>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div>
          <Label className="mb-1.5 block">Full name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <Label className="mb-1.5 block">Email</Label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <Label className="mb-1.5 block">Role</Label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as "owner" | "staff")}
            className="h-11 w-full rounded-md border bg-background px-3 text-sm"
          >
            <option value="staff">Staff</option>
            <option value="owner">Owner</option>
          </select>
        </div>
      </div>
      <Button onClick={invite} disabled={busy}>
        {busy ? "Sending…" : "Send invite"}
      </Button>
    </div>
  );
}
