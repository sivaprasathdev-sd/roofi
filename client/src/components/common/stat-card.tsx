import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  tone = "default",
  className,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon?: LucideIcon;
  tone?: "default" | "brand" | "teal" | "warning" | "danger";
  className?: string;
}) {
  const tones = {
    default: "bg-muted text-muted-foreground",
    brand: "bg-primary/10 text-primary",
    teal: "bg-teal/10 text-teal",
    warning: "bg-warning/15 text-warning-foreground",
    danger: "bg-destructive/10 text-destructive",
  } as const;

  return (
    <div className={cn("card-elevated flex items-start gap-3 p-4", className)}>
      {Icon && (
        <span className={cn("grid size-9 shrink-0 place-items-center rounded-lg", tones[tone])}>
          <Icon className="size-4.5" />
        </span>
      )}
      <div className="min-w-0">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{label}</p>
        <p className="mt-1 truncate text-xl font-bold text-foreground">{value}</p>
        {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
      </div>
    </div>
  );
}

export function MiniStat({
  label,
  value,
  active,
}: {
  label: string;
  value: number | string;
  active?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-card px-3 py-2 text-center",
        active ? "border-primary/50 bg-primary/5" : "border-border",
      )}
    >
      <p className="text-lg font-bold text-foreground">{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}
