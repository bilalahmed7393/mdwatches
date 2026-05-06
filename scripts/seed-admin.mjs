import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.env.SEED_ADMIN_EMAIL;
const password = process.env.SEED_ADMIN_PASSWORD;
const fullName = process.env.SEED_ADMIN_NAME ?? "Admin";

if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}
if (!email || !password) {
  console.error("Missing SEED_ADMIN_EMAIL or SEED_ADMIN_PASSWORD in .env.local");
  process.exit(1);
}
if (password.length < 8) {
  console.error("SEED_ADMIN_PASSWORD must be at least 8 characters");
  process.exit(1);
}

const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

let userId;
const { data: created, error: createErr } = await admin.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
});

if (created?.user) {
  userId = created.user.id;
  console.log(`✓ Created auth user ${email}`);
} else if (createErr && /already|exists|registered/i.test(createErr.message)) {
  const { data: list, error: listErr } = await admin.auth.admin.listUsers({ perPage: 1000 });
  if (listErr) {
    console.error("listUsers failed:", listErr.message);
    process.exit(1);
  }
  const existing = list.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
  if (!existing) {
    console.error(`User ${email} exists according to API but was not found in listUsers`);
    process.exit(1);
  }
  userId = existing.id;
  const { error: updErr } = await admin.auth.admin.updateUserById(userId, {
    password,
    email_confirm: true,
  });
  if (updErr) {
    console.error("updateUser failed:", updErr.message);
    process.exit(1);
  }
  console.log(`✓ Updated existing auth user ${email}`);
} else {
  console.error("createUser failed:", createErr?.message ?? createErr);
  process.exit(1);
}

const { error: profErr } = await admin
  .from("admin_profiles")
  .upsert({ id: userId, role: "owner", full_name: fullName }, { onConflict: "id" });

if (profErr) {
  console.error("admin_profiles upsert failed:", profErr.message);
  process.exit(1);
}

console.log(`✓ ${email} is now an owner — sign in at /admin/login`);
