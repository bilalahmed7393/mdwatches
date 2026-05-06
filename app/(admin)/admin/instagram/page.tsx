import Image from "next/image";
import { InstagramSyncBar } from "@/components/admin/InstagramSyncBar";
import { createAdminClient } from "@/lib/supabase/admin";
import type { InstagramPost } from "@/types/database";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin · Instagram" };

export default async function AdminInstagramPage() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("instagram_posts")
    .select("*")
    .order("posted_at", { ascending: false });
  const posts = (data ?? []) as unknown as InstagramPost[];
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl tracking-tight">Instagram</h1>
          <p className="text-sm text-muted-foreground">
            Sync posts from @mdwatches.co and import them as product drafts.
          </p>
        </div>
        <InstagramSyncBar />
      </div>
      {posts.length === 0 ? (
        <div className="rounded-md border border-dashed p-12 text-center text-sm text-muted-foreground">
          No Instagram posts synced yet. Configure <code>INSTAGRAM_ACCESS_TOKEN</code> and{" "}
          <code>INSTAGRAM_USER_ID</code> in env, then click Sync.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {posts.map((p) => (
            <div key={p.id} className="rounded-md border bg-background">
              <div className="relative aspect-square overflow-hidden rounded-t-md bg-muted">
                <Image
                  src={p.thumbnail_url ?? p.media_url}
                  alt=""
                  fill
                  sizes="(max-width:768px) 50vw, 25vw"
                  className="object-cover"
                />
                {p.is_imported && (
                  <span className="absolute right-2 top-2 rounded-sm bg-foreground px-2 py-0.5 text-xs text-background">
                    Imported
                  </span>
                )}
              </div>
              <div className="space-y-2 p-3">
                {p.caption && (
                  <p className="line-clamp-3 text-xs text-muted-foreground">{p.caption}</p>
                )}
                {!p.is_imported && <ImportButton igPostId={p.id} />}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import { ImportButton } from "@/components/admin/ImportButton";
