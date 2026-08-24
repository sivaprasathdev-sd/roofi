import { useMemo, useState } from "react";
import { Building2, MapPin, TrendingUp, Users } from "lucide-react";
import { toast } from "sonner";

import { PageHeader, SectionCard } from "@/components/layout/page-header";
import { DataTable } from "@/components/common/data-table";
import { SourceBadge, StatusBadge } from "@/components/common/badges";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useScope } from "@/context/session-context";
import { useLeads } from "@/context/leads-context";
import { clusterName, stateName } from "@/data/mock-data";
import { fmtDate } from "@/lib/format";
import type { Lead } from "@/types";
import { cn } from "@/lib/utils";

export function AssignmentsPage() {
  const { visibleClusters, visibleStates, role, stateId } = useScope();
  const { leads, bulkAssignLeads } = useLeads();

  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [targetCluster, setTargetCluster] = useState<string>("");
  const [filterState, setFilterState] = useState<string>(
    role === "state" && stateId ? stateId : "all",
  );

  const pendingLeads = useMemo(() => {
    return leads.filter((l) => {
      if (l.status === "Converted" || l.status === "Lost") return false;
      if (filterState !== "all" && l.stateId !== filterState) return false;
      return true;
    });
  }, [leads, filterState]);

  const toggleSelect = (id: string) => {
    setSelectedLeads((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const toggleSelectAll = () => {
    if (selectedLeads.length === pendingLeads.length) setSelectedLeads([]);
    else setSelectedLeads(pendingLeads.map((l) => l.id));
  };

  const bulkAssign = async () => {
    if (!selectedLeads.length) {
      toast.error("Select at least one lead to assign");
      return;
    }
    if (!targetCluster) {
      toast.error("Select a target cluster");
      return;
    }
    const cluster = visibleClusters.find((c) => c.id === targetCluster);
    const assignedBy =
      role === "ho"
        ? "HO Admin"
        : role === "state"
          ? `${stateName(stateId || "")} State Admin`
          : "Cluster Admin";

    try {
      await bulkAssignLeads(selectedLeads, targetCluster, assignedBy);
      toast.success(`Assigned ${selectedLeads.length} leads to ${cluster?.name}`);
      setSelectedLeads([]);
    } catch (e) {
      console.error(e);
      toast.error("Failed to assign leads");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lead Assignment Hub"
        description="Distribute incoming digital campaign leads to operational clusters across Tamil Nadu, Kerala, Andhra Pradesh and Karnataka."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <SectionCard title="Target Cluster Destination" className="lg:col-span-1">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Select Target Cluster
              </label>
              <Select value={targetCluster} onValueChange={setTargetCluster}>
                <SelectTrigger className="mt-1 bg-card">
                  <SelectValue placeholder="Choose cluster..." />
                </SelectTrigger>
                <SelectContent>
                  {visibleClusters.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name} ({stateName(c.stateId)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-lg border border-border p-3 space-y-2 bg-muted/30 text-xs">
              <p className="font-semibold text-foreground">Assignment Rules Summary:</p>
              <p className="text-muted-foreground">
                • HO Admin can assign leads to any cluster in any state.
              </p>
              <p className="text-muted-foreground">
                • State Admin assigns leads exclusively within their assigned state.
              </p>
              <p className="text-muted-foreground">
                • Clusters are operational endpoints and cannot reassign leads.
              </p>
            </div>

            <Button
              className="w-full cursor-pointer"
              disabled={!selectedLeads.length || !targetCluster}
              onClick={bulkAssign}
            >
              Assign {selectedLeads.length} Selected Leads
            </Button>
          </div>
        </SectionCard>

        <SectionCard title="Pending / Actionable Leads" className="lg:col-span-2">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              {role === "ho" && (
                <Select value={filterState} onValueChange={setFilterState}>
                  <SelectTrigger className="w-44 bg-card">
                    <SelectValue placeholder="Filter by State" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All States</SelectItem>
                    {visibleStates.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <span className="text-xs text-muted-foreground">
                Showing {pendingLeads.length} leads available for assignment
              </span>
            </div>

            <DataTable
              columns={[
                {
                  key: "select",
                  header: "",
                  cell: (r) => (
                    <Checkbox
                      checked={selectedLeads.includes(r.id)}
                      onCheckedChange={() => toggleSelect(r.id)}
                    />
                  ),
                },
                {
                  key: "id",
                  header: "Lead ID",
                  cell: (r) => <span className="font-semibold text-primary">{r.id}</span>,
                },
                { key: "customer", header: "Customer", cell: (r) => r.customerName },
                { key: "state", header: "State", cell: (r) => stateName(r.stateId) },
                {
                  key: "cluster",
                  header: "Current Cluster",
                  cell: (r) => clusterName(r.clusterId),
                },
                { key: "source", header: "Source", cell: (r) => <SourceBadge source={r.source} /> },
                { key: "status", header: "Status", cell: (r) => <StatusBadge status={r.status} /> },
              ]}
              rows={pendingLeads}
            />
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
