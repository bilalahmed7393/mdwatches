import { Badge } from "@/components/ui/badge";
import type { ConditionGrade } from "@/types/database";

const styles: Record<ConditionGrade, string> = {
  Mint: "bg-emerald-600/10 text-emerald-700 border-emerald-600/20",
  Excellent: "bg-blue-600/10 text-blue-700 border-blue-600/20",
  "Very Good": "bg-amber-600/10 text-amber-700 border-amber-600/20",
  Good: "bg-orange-600/10 text-orange-700 border-orange-600/20",
  Fair: "bg-rose-600/10 text-rose-700 border-rose-600/20",
};

export function ConditionBadge({ grade }: { grade: ConditionGrade }) {
  return (
    <Badge variant="outline" className={styles[grade]}>
      {grade}
    </Badge>
  );
}
