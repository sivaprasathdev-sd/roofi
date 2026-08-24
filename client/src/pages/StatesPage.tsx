import { Building2, Map, Plus, Users } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/page-header";
import { DataTable } from "@/components/common/data-table";
import { StatCard } from "@/components/common/stat-card";
import { Button } from "@/components/ui/button";
import { clusters, leads, states, users } from "@/data/mock-data";
import { inrShort } from "@/lib/format";
import type { StateRec } from "@/types";

export function StatesPage() {
  const rows = states.map((s) => {
    const sClusters = clusters.filter((c) => c.stateId === s.id);
    const sLeads = leads.filter((l) => l.stateId === s.id);
    const sUsers = users.filter((u) => u.stateId === s.id);
    const conv = sLeads.filter((l) => l.status === "Converted").length;
    return {
      ...s,
      clusters: sClusters.length,
      leads: sLeads.length,
      users: sUsers.length,
      conv,
      rate: sLeads.length ? Math.round((conv / sLeads.length) * 100) : 0,
    };
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="State Network"
        description="State HOs managing ROOFI operations across Tamil Nadu, Kerala, Andhra Pradesh and Karnataka."
        actions={
          <Button
            size="sm"
            onClick={() => toast.info("Contact HO IT to onboard a new State Admin")}
          >
            <Plus className="size-4" /> Add State HO
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Active States" value={states.length} icon={Map} tone="brand" />
        <StatCard
          label="Total Operational Clusters"
          value={clusters.length}
          icon={Building2}
          tone="teal"
        />
        <StatCard
          label="State Admins"
          value={users.filter((u) => u.role === "state").length}
          icon={Users}
          tone="default"
        />
      </div>

      <DataTable
        columns={[
          {
            key: "code",
            header: "State Code",
            cell: (r) => <span className="font-bold text-primary">{r.code}</span>,
          },
          {
            key: "name",
            header: "State Name",
            cell: (r) => <span className="font-semibold">{r.name}</span>,
          },
          { key: "clusters", header: "Clusters", cell: (r) => `${r.clusters} clusters` },
          { key: "leads", header: "Total Leads", cell: (r) => r.leads },
          { key: "conv", header: "Converted Leads", cell: (r) => `${r.conv} (${r.rate}%)` },
          { key: "users", header: "State HO Team", cell: (r) => `${r.users} members` },
        ]}
        rows={rows}
      />
    </div>
  );
}
