import { useState } from "react";
import { Building2, Plus, Search } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/page-header";
import { DataTable } from "@/components/common/data-table";
import { StatCard } from "@/components/common/stat-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { clusters, leads, stateName } from "@/data/mock-data";
import { inrShort, pct } from "@/lib/format";
import { useScope } from "@/context/session-context";
import type { Cluster } from "@/types";

export function ClustersPage() {
  const { scope, role } = useScope();
  const [query, setQuery] = useState("");

  const scopedClusters = scope(clusters);

  const filtered = scopedClusters.filter((c) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      c.id.toLowerCase().includes(q) ||
      c.name.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q) ||
      c.manager.toLowerCase().includes(q)
    );
  });

  const rows = filtered.map((c) => {
    const cLeads = leads.filter((l) => l.clusterId === c.id);
    const conv = cLeads.filter((l) => l.status === "Converted").length;
    return {
      ...c,
      totalLeads: cLeads.length,
      convLeads: conv,
      rate: pct(conv, cLeads.length),
    };
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cluster Directory"
        description="Operational cluster hubs: final destination for lead conversion, quotation generation, proforma invoices and final tax billing."
        actions={
          role === "ho" && (
            <Button size="sm" onClick={() => toast.info("Onboarding new cluster setup form")}>
              <Plus className="size-4" /> Add Cluster Hub
            </Button>
          )
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Total Clusters"
          value={scopedClusters.length}
          icon={Building2}
          tone="brand"
        />
        <StatCard label="Active Leads Serviced" value={leads.length} tone="teal" />
        <StatCard label="Avg Conversion Rate" value="38%" tone="default" />
      </div>

      <div className="card-elevated p-4">
        <div className="relative min-w-[240px] max-w-md">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by cluster name, code, manager…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <DataTable
        columns={[
          {
            key: "code",
            header: "Cluster Code",
            cell: (r) => <span className="font-bold text-primary">{r.code}</span>,
          },
          {
            key: "name",
            header: "Cluster Name & Company",
            cell: (r) => (
              <div>
                <p className="font-semibold text-foreground">{r.name}</p>
                <p className="text-xs text-muted-foreground">{r.company}</p>
              </div>
            ),
          },
          { key: "state", header: "State", cell: (r) => stateName(r.stateId) },
          { key: "manager", header: "Cluster Manager", cell: (r) => r.manager },
          {
            key: "gst",
            header: "GSTIN",
            cell: (r) => <span className="text-xs font-mono">{r.gst}</span>,
          },
          { key: "leads", header: "Active Leads", cell: (r) => r.totalLeads },
          { key: "conv", header: "Converted Rate", cell: (r) => `${r.convLeads} (${r.rate})` },
        ]}
        rows={rows}
      />
    </div>
  );
}
