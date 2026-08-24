import { useState } from "react";
import { Download, Search } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/page-header";
import { DataTable } from "@/components/common/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { activityLogs } from "@/data/mock-data";
import { roleLabel } from "@/context/session-context";

export function ActivityLogsPage() {
  const [query, setQuery] = useState("");
  const [moduleFilter, setModuleFilter] = useState("all");

  const filtered = activityLogs.filter((l) => {
    if (moduleFilter !== "all" && l.module !== moduleFilter) return false;
    if (query.trim()) {
      const q = query.toLowerCase();
      return (
        l.user.toLowerCase().includes(q) ||
        l.action.toLowerCase().includes(q) ||
        l.record.toLowerCase().includes(q) ||
        l.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Activity Audit Logs"
        description="Immutable audit trail of all system actions: user creation, lead assignments, quotation generation and invoice updates."
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.success("Exporting audit trail to CSV")}
          >
            <Download className="size-4" /> Export Logs
          </Button>
        }
      />

      <div className="card-elevated p-4 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[240px] flex-1 max-w-md">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search audit trail by user, action, record ID..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={moduleFilter} onValueChange={setModuleFilter}>
          <SelectTrigger className="w-44 bg-card">
            <SelectValue placeholder="Module" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Modules</SelectItem>
            {["Leads", "Quotations", "Invoices", "Customers", "Materials", "Users"].map((m) => (
              <SelectItem key={m} value={m}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={[
          {
            key: "at",
            header: "Timestamp",
            cell: (r) => <span className="text-xs text-muted-foreground">{r.at}</span>,
          },
          {
            key: "user",
            header: "User",
            cell: (r) => <span className="font-semibold text-foreground">{r.user}</span>,
          },
          {
            key: "role",
            header: "Role",
            cell: (r) => (
              <Badge variant="outline">
                {roleLabel[r.role as keyof typeof roleLabel] || r.role}
              </Badge>
            ),
          },
          {
            key: "action",
            header: "Action",
            cell: (r) => <Badge variant="secondary">{r.action}</Badge>,
          },
          { key: "module", header: "Module", cell: (r) => r.module },
          {
            key: "record",
            header: "Record ID",
            cell: (r) => <span className="font-mono text-xs text-primary">{r.record}</span>,
          },
          { key: "desc", header: "Description", cell: (r) => r.description },
          {
            key: "ip",
            header: "IP Address",
            cell: (r) => <span className="text-xs font-mono text-muted-foreground">{r.ip}</span>,
          },
        ]}
        rows={filtered}
      />
    </div>
  );
}
