"use client";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  CheckCheck,
  Filter,
  Mail,
  MessageSquare,
  Reply,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils/cn";
import { formatDate } from "@/lib/utils/format";
import type { ContactMessage, ContactMessageStatus } from "@/types/database";

type Filter = "all" | ContactMessageStatus;
const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "read", label: "Read" },
  { key: "replied", label: "Replied" },
];

export function MessagesView({ initial }: { initial: ContactMessage[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(initial[0]?.id ?? null);

  const filtered = useMemo(
    () => initial.filter((m) => filter === "all" || m.status === filter),
    [initial, filter],
  );

  const selected = initial.find((m) => m.id === selectedId) ?? null;

  async function patch(id: string, body: Partial<ContactMessage>) {
    const res = await fetch(`/api/admin/messages/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      toast.error("Save failed");
      return false;
    }
    router.refresh();
    return true;
  }

  async function remove(id: string) {
    if (!confirm("Delete this message? This can't be undone.")) return;
    const res = await fetch(`/api/admin/messages/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Deleted.");
      if (selectedId === id) setSelectedId(null);
      router.refresh();
    } else toast.error("Delete failed");
  }

  function selectAndMaybeMarkRead(m: ContactMessage) {
    setSelectedId(m.id);
    if (m.status === "unread") {
      void patch(m.id, { status: "read" });
    }
  }

  if (initial.length === 0) {
    return (
      <div className="rounded-md border bg-background p-12 text-center">
        <Mail className="mx-auto h-8 w-8 text-muted-foreground" />
        <p className="mt-3 text-sm text-muted-foreground">
          No messages yet. Submissions from the contact form will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Filter pills */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <Filter className="h-3.5 w-3.5 text-muted-foreground" />
        {FILTERS.map((f) => {
          const count =
            f.key === "all" ? initial.length : initial.filter((m) => m.status === f.key).length;
          const isActive = filter === f.key;
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={cn(
                "rounded-full border px-3 py-1 transition-colors",
                isActive ? "bg-foreground text-background" : "hover:bg-muted",
              )}
            >
              {f.label} {count > 0 && <span className="opacity-60">({count})</span>}
            </button>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(320px,1fr)_minmax(0,1.6fr)]">
        {/* List */}
        <div className="overflow-hidden rounded-md border bg-background">
          {filtered.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">No messages match this filter.</p>
          ) : (
            <ul className="divide-y">
              {filtered.map((m) => (
                <li key={m.id}>
                  <button
                    type="button"
                    onClick={() => selectAndMaybeMarkRead(m)}
                    className={cn(
                      "block w-full px-4 py-3 text-left transition-colors",
                      "hover:bg-muted/40",
                      selectedId === m.id && "bg-muted/60",
                      m.status === "unread" && "border-l-2 border-foreground",
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={cn(
                          "truncate text-sm",
                          m.status === "unread" ? "font-semibold" : "font-medium",
                        )}
                      >
                        {m.name}
                      </span>
                      <span className="shrink-0 text-[11px] text-muted-foreground">
                        {formatDate(m.created_at)}
                      </span>
                    </div>
                    <div className="mt-0.5 truncate text-xs text-muted-foreground">{m.email}</div>
                    <p className="mt-1.5 line-clamp-2 text-xs text-foreground/80">{m.message}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <StatusBadge status={m.status} />
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Detail */}
        <div className="rounded-md border bg-background">
          {selected ? (
            <DetailPanel
              message={selected}
              onMarkReplied={() => patch(selected.id, { status: "replied" })}
              onMarkUnread={() => patch(selected.id, { status: "unread" })}
              onDelete={() => remove(selected.id)}
              onSaveNotes={(notes) => patch(selected.id, { admin_notes: notes })}
            />
          ) : (
            <div className="flex h-full min-h-[280px] flex-col items-center justify-center p-10 text-center text-sm text-muted-foreground">
              <MessageSquare className="mb-2 h-8 w-8" />
              Select a message to read it.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailPanel({
  message,
  onMarkReplied,
  onMarkUnread,
  onDelete,
  onSaveNotes,
}: {
  message: ContactMessage;
  onMarkReplied: () => Promise<boolean>;
  onMarkUnread: () => Promise<boolean>;
  onDelete: () => void;
  onSaveNotes: (notes: string | null) => Promise<boolean>;
}) {
  const [notes, setNotes] = useState(message.admin_notes ?? "");
  const [savingNotes, setSavingNotes] = useState(false);

  const replyHref = `mailto:${encodeURIComponent(message.email)}?subject=${encodeURIComponent(
    "Re: your enquiry",
  )}&body=${encodeURIComponent(`Hi ${message.name},\n\n`)}`;

  async function saveNotes() {
    setSavingNotes(true);
    try {
      const ok = await onSaveNotes(notes.trim() || null);
      if (ok) toast.success("Notes saved.");
    } finally {
      setSavingNotes(false);
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="font-display text-xl">{message.name}</h2>
            <a
              href={`mailto:${message.email}`}
              className="text-sm text-muted-foreground hover:underline"
            >
              {message.email}
            </a>
          </div>
          <StatusBadge status={message.status} />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Received {formatDate(message.created_at)}
          {message.replied_at && ` · Replied ${formatDate(message.replied_at)}`}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button asChild size="sm" variant="default">
            <a href={replyHref}>
              <Reply className="mr-2 h-3.5 w-3.5" /> Reply by email
            </a>
          </Button>
          {message.status !== "replied" ? (
            <Button size="sm" variant="outline" onClick={onMarkReplied}>
              <CheckCheck className="mr-2 h-3.5 w-3.5" /> Mark replied
            </Button>
          ) : (
            <Button size="sm" variant="outline" onClick={onMarkUnread}>
              Mark unread
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={onDelete}>
            <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
          </Button>
        </div>
      </div>

      <div className="flex-1 space-y-5 p-5">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Message
          </p>
          <div className="mt-2 whitespace-pre-line rounded-md border bg-muted/30 p-4 text-sm leading-relaxed">
            {message.message}
          </div>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Internal notes
          </p>
          <Textarea
            rows={3}
            placeholder="Private notes — only visible to admins"
            className="mt-2"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <Button
            size="sm"
            variant="outline"
            className="mt-2"
            disabled={savingNotes || notes === (message.admin_notes ?? "")}
            onClick={saveNotes}
          >
            {savingNotes ? "Saving…" : "Save notes"}
          </Button>
        </div>

        {(message.user_agent || message.ip_address) && (
          <details className="text-xs text-muted-foreground">
            <summary className="cursor-pointer hover:text-foreground">Submission details</summary>
            <dl className="mt-2 grid grid-cols-[88px_1fr] gap-x-3 gap-y-1">
              {message.ip_address && (
                <>
                  <dt>IP</dt>
                  <dd className="truncate font-mono">{message.ip_address}</dd>
                </>
              )}
              {message.user_agent && (
                <>
                  <dt>Agent</dt>
                  <dd className="truncate font-mono">{message.user_agent}</dd>
                </>
              )}
            </dl>
          </details>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: ContactMessageStatus }) {
  if (status === "replied") {
    return <Badge variant="default">Replied</Badge>;
  }
  if (status === "read") {
    return <Badge variant="outline">Read</Badge>;
  }
  return <Badge>Unread</Badge>;
}
