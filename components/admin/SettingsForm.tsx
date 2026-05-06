"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import { ImageOff, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createClient } from "@/lib/supabase/client";
import { nanoid } from "nanoid";
import type { SiteSetting } from "@/types/database";

// Friendly labels and descriptions for each setting key.
// Anything not listed here falls back to a humanised version of the key.
const FIELD_META: Record<string, { label: string; description?: string; multiline?: boolean }> = {
  "hero.headline": { label: "Hero headline", description: "Big serif text in the homepage hero." },
  "hero.subtext": { label: "Hero subtext", description: "Short line below the headline.", multiline: true },
  "hero.cta_label": { label: "Hero button label", description: 'e.g. "Shop the collection"' },
  "hero.cta_href": { label: "Hero button link", description: "URL the button goes to. Use /shop for the shop page." },
  "hero.image_url": { label: "Hero image", description: "Shown to the right of the headline. 4:5 aspect, ~1200×1500px works best." },
  "about.body": { label: "About / story copy", description: "Used in the homepage 'Pre-loved, properly' card and the About page.", multiline: true },
  "contact.email": { label: "Contact email", description: "Public-facing email shown in the footer and on the Contact page." },
  "contact.whatsapp": { label: "WhatsApp number", description: "Include country code, no spaces (e.g. +14155551234)." },
  "contact.instagram_url": { label: "Instagram URL", description: "Full URL to your Instagram profile." },
  "bank.bank_name": { label: "Bank name", description: "Shown to customers on the order confirmation page." },
  "bank.account_name": { label: "Account holder name" },
  "bank.account_number": { label: "Account number / IBAN" },
  "bank.swift_code": { label: "SWIFT / BIC code", description: "Optional — for international transfers." },
  "bank.instructions": { label: "Extra transfer instructions", description: "Anything else the buyer should know.", multiline: true },
  "seo.default_title": { label: "Default site title", description: "Used when a page doesn't override it." },
  "seo.default_description": { label: "Default meta description", description: "Used when a page doesn't override it.", multiline: true },
  "seo.og_image": { label: "Open Graph image", description: "Shown when the site is shared on social media. 1200×630px works best." },
  "announcement.enabled": { label: "Show announcement bar", description: "The thin black strip at the very top of every page." },
  "announcement.text": { label: "Announcement text", description: "What appears in the announcement bar." },
  "footer.tagline": { label: "Footer tagline", description: "Short line shown under the brand name in the footer." },
  "condition.mint": { label: "Mint — definition", description: "Shown to buyers in the condition guide.", multiline: true },
  "condition.excellent": { label: "Excellent — definition", multiline: true },
  "condition.very_good": { label: "Very Good — definition", multiline: true },
  "condition.good": { label: "Good — definition", multiline: true },
  "condition.fair": { label: "Fair — definition", multiline: true },
};

const SECTIONS: { key: string; label: string; description?: string }[] = [
  { key: "homepage", label: "Homepage", description: "Hero copy and image at the top of the home page." },
  { key: "about", label: "About", description: "Brand story used on the homepage card and About page." },
  { key: "contact", label: "Contact", description: "How customers reach you." },
  { key: "bank", label: "Bank transfer", description: "Shown to customers after they place an order." },
  { key: "announcement", label: "Announcement bar", description: "Thin strip at the top of every page." },
  { key: "footer", label: "Footer" },
  { key: "seo", label: "SEO & sharing" },
  { key: "conditions", label: "Condition guide" },
];

function humanise(key: string) {
  const last = key.split(".").pop() ?? key;
  return last.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function metaFor(key: string, type: string) {
  const m = FIELD_META[key];
  if (m) return m;
  return { label: humanise(key), multiline: type === "text" && key.endsWith("body") };
}

export function SettingsForm({ initial }: { initial: SiteSetting[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [values, setValues] = useState<Record<string, string>>(() => {
    const m: Record<string, string> = {};
    for (const s of initial) m[s.key] = s.value ?? "";
    return m;
  });

  function set(key: string, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function save() {
    setBusy(true);
    try {
      const updates = initial.map((s) => ({
        key: s.key,
        value: values[s.key] ?? "",
        type: s.type,
        section: s.section,
      }));
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates }),
      });
      if (!res.ok) throw new Error("save_failed");
      toast.success("Settings saved.");
      router.refresh();
    } catch {
      toast.error("Save failed");
    } finally {
      setBusy(false);
    }
  }

  const grouped = SECTIONS.map((sec) => ({
    ...sec,
    items: initial.filter((s) => s.section === sec.key),
  })).filter((g) => g.items.length > 0);

  return (
    <Tabs defaultValue={grouped[0]?.key ?? "homepage"} className="space-y-4">
      <TabsList className="h-auto flex-wrap">
        {grouped.map((g) => (
          <TabsTrigger key={g.key} value={g.key}>
            {g.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {grouped.map((g) => (
        <TabsContent key={g.key} value={g.key} className="space-y-5 rounded-md border bg-background p-6">
          {g.description && (
            <p className="text-sm text-muted-foreground">{g.description}</p>
          )}
          {g.items.map((s) => {
            const meta = metaFor(s.key, s.type);
            return (
              <SettingRow
                key={s.id}
                setting={s}
                label={meta.label}
                description={meta.description}
                value={values[s.key] ?? ""}
                onChange={(v) => set(s.key, v)}
                multiline={meta.multiline}
              />
            );
          })}
        </TabsContent>
      ))}

      <div className="sticky bottom-2 rounded-md border bg-background p-3 shadow-md">
        <Button onClick={save} disabled={busy} className="w-full" size="lg">
          {busy ? "Saving…" : "Save settings"}
        </Button>
      </div>
    </Tabs>
  );
}

function SettingRow({
  setting,
  label,
  description,
  value,
  multiline,
  onChange,
}: {
  setting: SiteSetting;
  label: string;
  description?: string;
  value: string;
  multiline?: boolean;
  onChange: (v: string) => void;
}) {
  return (
    <div className="grid gap-2 border-b border-border/60 pb-5 last:border-b-0 last:pb-0 md:grid-cols-[280px_1fr] md:gap-6">
      <div className="md:pt-1.5">
        <Label className="text-sm font-medium text-foreground">{label}</Label>
        {description && (
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        )}
        <p className="mt-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground/60">
          {setting.key}
        </p>
      </div>
      <div className="min-w-0">
        {setting.type === "boolean" ? (
          <BooleanField value={value} onChange={onChange} />
        ) : setting.type === "image" ? (
          <ImageField value={value} onChange={onChange} keyName={setting.key} />
        ) : multiline || (value && value.length > 80) ? (
          <Textarea rows={4} value={value} onChange={(e) => onChange(e.target.value)} />
        ) : (
          <Input value={value} onChange={(e) => onChange(e.target.value)} />
        )}
      </div>
    </div>
  );
}

function BooleanField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const checked = value === "true";
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(checked ? "false" : "true")}
      className={
        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors " +
        (checked ? "bg-foreground" : "bg-muted")
      }
    >
      <span
        className={
          "inline-block h-5 w-5 transform rounded-full bg-background shadow transition-transform " +
          (checked ? "translate-x-5" : "translate-x-0.5")
        }
      />
    </button>
  );
}

function ImageField({
  value,
  onChange,
  keyName,
}: {
  value: string;
  onChange: (v: string) => void;
  keyName: string;
}) {
  const [uploading, setUploading] = useState(false);

  async function upload(file: File) {
    setUploading(true);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `settings/${keyName}/${nanoid(10)}.${ext}`;
      const { error } = await supabase.storage
        .from("site-assets")
        .upload(path, file, { upsert: true, contentType: file.type });
      if (error) throw error;
      const { data: pub } = supabase.storage.from("site-assets").getPublicUrl(path);
      onChange(pub.publicUrl);
      toast.success("Image uploaded — don't forget to save.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex items-start gap-3">
      <div className="relative h-24 w-32 shrink-0 overflow-hidden rounded-md border bg-muted">
        {value ? (
          <Image src={value} alt="" fill sizes="128px" className="object-cover" />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-muted-foreground">
            <ImageOff className="h-5 w-5" />
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2">
        <div className="flex flex-wrap gap-2">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted/60">
            <Upload className="h-3.5 w-3.5" />
            {uploading ? "Uploading…" : value ? "Replace" : "Upload"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={uploading}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) upload(f);
                e.target.value = "";
              }}
            />
          </label>
          {value && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onChange("")}
            >
              <X className="mr-1 h-3.5 w-3.5" /> Remove
            </Button>
          )}
        </div>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Or paste an image URL"
          className="text-xs"
        />
      </div>
    </div>
  );
}
