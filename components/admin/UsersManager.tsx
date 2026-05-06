"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Plus, Trash2, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { AdminProfile } from "@/types/database";
import { formatDate } from "@/lib/utils/format";

type Row = AdminProfile & { email: string };

interface Props {
  initial: Row[];
  currentUserId: string;
}

export function UsersManager({ initial, currentUserId }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<Row | null>(null);

  // Add-user form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"owner" | "staff">("staff");

  function resetAddForm() {
    setName("");
    setEmail("");
    setPassword("");
    setRole("staff");
  }

  async function add() {
    if (!name.trim() || !email.trim() || password.length < 8) {
      toast.error("Fill in name, email, and a password of at least 8 characters.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: name, email, password, role }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? "create_failed");
      toast.success(`Added ${email}.`);
      resetAddForm();
      setAdding(false);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not add user");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string, email: string) {
    if (id === currentUserId) {
      toast.error("You can't remove your own account.");
      return;
    }
    if (!confirm(`Remove ${email}? This deletes their admin access entirely.`)) return;
    const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    const body = await res.json().catch(() => ({}));
    if (res.ok) {
      toast.success("User removed.");
      router.refresh();
    } else {
      toast.error(body.error ?? "Delete failed");
    }
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-md border bg-background">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="border-b bg-secondary/40 text-left">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Role</th>
              <th className="p-3">Added</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {initial.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-muted-foreground">
                  No admin users yet.
                </td>
              </tr>
            )}
            {initial.map((u) => (
              <tr key={u.id}>
                <td className="p-3 font-medium">
                  {u.full_name ?? "—"}
                  {u.id === currentUserId && (
                    <span className="ml-2 text-xs text-muted-foreground">(you)</span>
                  )}
                </td>
                <td className="p-3 text-muted-foreground">{u.email}</td>
                <td className="p-3">
                  <Badge variant={u.role === "owner" ? "default" : "outline"}>{u.role}</Badge>
                </td>
                <td className="p-3 text-xs text-muted-foreground">{formatDate(u.created_at)}</td>
                <td className="p-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditing(u)}
                      title="Edit user"
                    >
                      <KeyRound className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(u.id, u.email)}
                      disabled={u.id === currentUserId}
                      title={u.id === currentUserId ? "You can't remove yourself" : "Remove"}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {adding ? (
        <div className="space-y-3 rounded-md border bg-background p-4">
          <h3 className="font-display text-lg">Add admin</h3>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <Label className="mb-1.5 block">Full name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <Label className="mb-1.5 block">Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <Label className="mb-1.5 block">Password (≥ 8 chars)</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
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
          <div className="flex gap-2">
            <Button onClick={add} disabled={busy}>
              {busy ? "Adding…" : "Add user"}
            </Button>
            <Button variant="outline" onClick={() => { setAdding(false); resetAddForm(); }}>
              Cancel
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            The new admin can sign in immediately at /admin/login with the email and password
            you set here. They can change their own password later from My account.
          </p>
        </div>
      ) : (
        <Button onClick={() => setAdding(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add admin
        </Button>
      )}

      {editing && (
        <EditUserDialog
          key={editing.id}
          user={editing}
          onClose={() => setEditing(null)}
          onSaved={() => router.refresh()}
        />
      )}
    </div>
  );
}

function EditUserDialog({
  user,
  onClose,
  onSaved,
}: {
  user: Row;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState(user.full_name ?? "");
  const [email, setEmail] = useState(user.email ?? "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"owner" | "staff">(user.role);

  async function save() {
    setBusy(true);
    try {
      const payload: Record<string, string> = {};
      if (name && name !== (user.full_name ?? "")) payload.full_name = name;
      if (email && email !== user.email) payload.email = email;
      if (role !== user.role) payload.role = role;
      if (password) payload.password = password;
      if (Object.keys(payload).length === 0) {
        toast.info("Nothing to update.");
        setBusy(false);
        return;
      }
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? "save_failed");
      toast.success("User updated.");
      onSaved();
      onClose();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit user</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
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
          <div>
            <Label className="mb-1.5 block">New password</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Leave blank to keep current"
              autoComplete="new-password"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save} disabled={busy}>
            {busy ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
