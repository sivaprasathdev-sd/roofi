import { Facebook, Instagram, PenLine, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LeadSource, LeadStatus, Priority } from "@/types";

const base =
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap";

const statusStyles: Record<string, string> = {
  New: "border-info/30 bg-info/10 text-info",
  Assigned: "border-deep-teal/30 bg-deep-teal/10 text-deep-teal",
  Contacted: "border-teal/30 bg-teal/10 text-teal",
  Qualified: "border-cyan/30 bg-cyan/10 text-cyan",
  "Follow-up": "border-warning/40 bg-warning/15 text-warning-foreground",
  Quotation: "border-primary/25 bg-primary/10 text-primary",
  "Proforma Invoice": "border-primary/30 bg-primary/12 text-primary",
  Invoice: "border-primary/30 bg-primary/12 text-primary",
  Converted: "border-primary/40 bg-primary/15 text-primary",
  Lost: "border-destructive/30 bg-destructive/10 text-destructive",
  Draft: "border-border bg-muted text-muted-foreground",
  Sent: "border-info/30 bg-info/10 text-info",
  Issued: "border-info/30 bg-info/10 text-info",
  Accepted: "border-primary/35 bg-primary/12 text-primary",
  Paid: "border-primary/35 bg-primary/12 text-primary",
  "Partially Paid": "border-warning/40 bg-warning/15 text-warning-foreground",
  Pending: "border-warning/40 bg-warning/15 text-warning-foreground",
  Overdue: "border-destructive/30 bg-destructive/10 text-destructive",
  Rejected: "border-destructive/30 bg-destructive/10 text-destructive",
  Cancelled: "border-destructive/30 bg-destructive/10 text-destructive",
  Expired: "border-muted-foreground/30 bg-muted text-muted-foreground",
  Active: "border-primary/35 bg-primary/12 text-primary",
  Inactive: "border-muted-foreground/30 bg-muted text-muted-foreground",
};

export function StatusBadge({
  status,
  className,
}: {
  status: LeadStatus | string;
  className?: string;
}) {
  return (
    <span className={cn(base, statusStyles[status] ?? statusStyles["Draft"], className)}>
      <span className="size-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

const sourceIcon = {
  Meta: Share2,
  Facebook: Facebook,
  Instagram: Instagram,
  Manual: PenLine,
};

const sourceStyles: Record<LeadSource, string> = {
  Meta: "border-info/30 bg-info/10 text-info",
  Facebook: "border-deep-teal/30 bg-deep-teal/10 text-deep-teal",
  Instagram: "border-cyan/35 bg-cyan/10 text-cyan",
  Manual: "border-primary/30 bg-primary/10 text-primary",
};

export function SourceBadge({ source }: { source: LeadSource }) {
  const Icon = sourceIcon[source];
  return (
    <span className={cn(base, sourceStyles[source])}>
      <Icon className="size-3" />
      {source}
    </span>
  );
}

const priorityStyles: Record<Priority, string> = {
  High: "border-destructive/30 bg-destructive/10 text-destructive",
  Medium: "border-warning/40 bg-warning/15 text-warning-foreground",
  Low: "border-muted-foreground/25 bg-muted text-muted-foreground",
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  return <span className={cn(base, priorityStyles[priority])}>{priority}</span>;
}
