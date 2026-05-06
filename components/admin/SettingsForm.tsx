"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { SiteSetting } from "@/types/database";

const SECTIONS: { key: string; label: string }[] = [
  { key: "homepage", label: "Homepage" },
  { key: "about", label: "About" },
  { key: "contact", label: "Contact" },
  { key: "bank", label: "Bank" },
  { key: "seo", label: "SEO" },
  { key: "announcement", label: "Announcement" },
  { key: "footer", label: "Footer" },
  { key: "conditions", label: "Conditions" },
];

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
        <TabsContent key={g.key} value={g.key} className="space-y-4 rounded-md border bg-background p-5">
          {g.items.map((s) => (
            <div key={s.id}>
              <Label className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">
                {s.key}
              </Label>
              {s.type === "boolean" ? (
                <select
                  value={values[s.key]}
                  onChange={(e) => set(s.key, e.target.value)}
                  className="h-11 w-full rounded-md border bg-background px-3 text-sm"
                >
                  <option value="true">true</option>
                  <option value="false">false</option>
                </select>
              ) : (values[s.key] ?? "").length > 80 ? (
                <Textarea
                  rows={4}
                  value={values[s.key] ?? ""}
                  onChange={(e) => set(s.key, e.target.value)}
                />
              ) : (
                <Input
                  value={values[s.key] ?? ""}
                  onChange={(e) => set(s.key, e.target.value)}
                />
              )}
            </div>
          ))}
        </TabsContent>
      ))}

      <div className="sticky bottom-2 rounded-md border bg-background p-3 shadow">
        <Button onClick={save} disabled={busy} className="w-full">
          {busy ? "Saving…" : "Save settings"}
        </Button>
      </div>
    </Tabs>
  );
}
