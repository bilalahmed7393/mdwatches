import { MessagesView } from "@/components/admin/MessagesView";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ContactMessage } from "@/types/database";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin · Messages" };

export default async function AdminMessagesPage() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false });
  const messages = (data ?? []) as unknown as ContactMessage[];

  const counts = {
    unread: messages.filter((m) => m.status === "unread").length,
    total: messages.length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl tracking-tight">Messages</h1>
        <p className="text-sm text-muted-foreground">
          Customer enquiries from the contact form.{" "}
          {counts.unread > 0 ? (
            <>
              <span className="font-medium text-foreground">{counts.unread} unread</span> ·{" "}
              {counts.total} total
            </>
          ) : (
            <>{counts.total} total</>
          )}
        </p>
      </div>
      <MessagesView initial={messages} />
    </div>
  );
}
