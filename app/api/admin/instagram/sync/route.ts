import { adminHandler } from "@/lib/api/admin-handler";

export const dynamic = "force-dynamic";

interface InstagramMediaItem {
  id: string;
  media_url: string;
  thumbnail_url?: string;
  caption?: string;
  permalink?: string;
  timestamp?: string;
  media_type?: string;
}

export const POST = adminHandler({}, async ({ supabase }) => {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  const userId = process.env.INSTAGRAM_USER_ID;
  if (!token || !userId) {
    return { synced: 0, skipped: true, reason: "INSTAGRAM_ACCESS_TOKEN or INSTAGRAM_USER_ID not set" };
  }
  const url = `https://graph.instagram.com/${userId}/media?fields=id,media_url,thumbnail_url,caption,permalink,timestamp,media_type&limit=20&access_token=${token}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Instagram API error: ${res.status}`);
  const json = (await res.json()) as { data?: InstagramMediaItem[] };

  let upserted = 0;
  for (const item of json.data ?? []) {
    await supabase
      .from("instagram_posts")
      .upsert(
        {
          instagram_id: item.id,
          media_url: item.media_url,
          thumbnail_url: item.thumbnail_url ?? null,
          caption: item.caption ?? null,
          permalink: item.permalink ?? null,
          posted_at: item.timestamp ?? null,
        },
        { onConflict: "instagram_id" },
      );
    upserted += 1;
  }
  return { synced: upserted };
});
