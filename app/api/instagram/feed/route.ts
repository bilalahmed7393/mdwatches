import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("instagram_posts")
    .select("*")
    .order("posted_at", { ascending: false })
    .limit(12);
  return NextResponse.json(data ?? []);
}
