import { Link, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { CalendarClock, Download, Filter, Plus, Search, Share2 } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/page-header";
import { MiniStat } from "@/components/common/stat-card";
import { DataTable } from "@/components/common/data-table";
import { PriorityBadge, SourceBadge, StatusBadge } from "@/components/common/badges";
import { AddLeadDialog } from "@/components/dialogs/add-lead-dialog";
import { AssignLeadDialog } from "@/components/dialogs/assign-lead-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

export function LeadsPage() {
  const { scope, visibleClusters, visibleStates, role, canAssign } = useScope();
  const { leads } = useLeads();
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [followUpFilter, setFollowUpFilter] = useState("all");
  const [stateFilter, setStateFilter] = useState("all");
  const [clusterFilter, setClusterFilter] = useState("all");
  const [assignLead, setAssignLead] = useState<Lead | null>(null);

  const scopedLeads = useMemo(() => scope(leads), [scope, leads]);
  const todayStr = new Date().toISOString().slice(0, 10);

  const filtered = useMemo(() => {
    return scopedLeads.filter((l) => {
      if (query.trim()) {
        const q = query.toLowerCase();
        const match =
          l.id.toLowerCase().includes(q) ||
          l.customerName.toLowerCase().includes(q) ||
          l.phone.includes(q) ||
          l.city.toLowerCase().includes(q) ||
          l.product.toLowerCase().includes(q);
        if (!match) return false;
      }
      if (sourceFilter !== "all" && l.source !== sourceFilter) return false;
      if (statusFilter !== "all" && l.status !== statusFilter) return false;
      if (stateFilter !== "all" && l.stateId !== stateFilter) return false;
      if (clusterFilter !== "all" && l.clusterId !== clusterFilter) return false;

      // Next Follow-up Filter
      if (followUpFilter === "scheduled" && !l.nextFollowUp) return false;
      if (followUpFilter === "today" && l.nextFollowUp !== todayStr) return false;
      if (followUpFilter === "overdue" && (!l.nextFollowUp || l.nextFollowUp >= todayStr))
        return false;
      if (followUpFilter === "upcoming" && (!l.nextFollowUp || l.nextFollowUp <= todayStr))
        return false;

      return true;
    });
  }, [
    scopedLeads,
    query,
    sourceFilter,
    statusFilter,
    followUpFilter,
    stateFilter,
    clusterFilter,
    todayStr,
  ]);

  const countByStatus = (status?: string) =>
    status ? scopedLeads.filter((l) => l.status === status).length : scopedLeads.length;

  const followUpCount = scopedLeads.filter((l) => Boolean(l.nextFollowUp)).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title={role === "cluster" ? "My Cluster Leads" : "Leads Directory"}
        description={
          role === "cluster"
            ? "View and manage all leads assigned to your cluster. Update statuses, track follow-ups, and convert into customers."
            : "Central repository of all leads received across channels and assigned to state HOs and clusters."
        }
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.success("Exporting leads data to CSV")}
            >
              <Download className="size-4" /> Export CSV
            </Button>
            <AddLeadDialog
              trigger={
                <Button size="sm">
                  <Plus className="size-4" /> Add Lead
                </Button>
              }
            />
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
        <button onClick={() => setStatusFilter("all")} className="text-left cursor-pointer">
          <MiniStat
            label="All Leads"
            value={countByStatus()}
            active={statusFilter === "all" && followUpFilter === "all"}
          />
        </button>
        <button onClick={() => setStatusFilter("New")} className="text-left cursor-pointer">
          <MiniStat label="New" value={countByStatus("New")} active={statusFilter === "New"} />
        </button>
        <button onClick={() => setStatusFilter("Assigned")} className="text-left cursor-pointer">
          <MiniStat
            label="Assigned"
            value={countByStatus("Assigned")}
            active={statusFilter === "Assigned"}
          />
        </button>
        <button onClick={() => setStatusFilter("Contacted")} className="text-left cursor-pointer">
          <MiniStat
            label="Contacted"
            value={countByStatus("Contacted")}
            active={statusFilter === "Contacted"}
          />
        </button>
        <button onClick={() => setStatusFilter("Quotation")} className="text-left cursor-pointer">
          <MiniStat
            label="Quotation"
            value={countByStatus("Quotation")}
            active={statusFilter === "Quotation"}
          />
        </button>
        <button onClick={() => setStatusFilter("Converted")} className="text-left cursor-pointer">
          <MiniStat
            label="Converted"
            value={countByStatus("Converted")}
            active={statusFilter === "Converted"}
          />
        </button>
        <button
          onClick={() => {
            setStatusFilter("all");
            setFollowUpFilter("scheduled");
          }}
          className="text-left cursor-pointer"
        >
          <MiniStat
            label="Next Follow-ups"
            value={followUpCount}
            active={followUpFilter !== "all"}
          />
        </button>
      </div>

      <div className="card-elevated p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by ID, customer name, phone, city…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Next Follow-up Filter */}
          <Select value={followUpFilter} onValueChange={setFollowUpFilter}>
            <SelectTrigger className="w-48 bg-card">
              <div className="flex items-center gap-1.5 truncate">
                <CalendarClock className="size-3.5 text-primary shrink-0" />
                <SelectValue placeholder="Next Follow-up" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Follow-ups</SelectItem>
              <SelectItem value="scheduled">Has Scheduled Follow-up</SelectItem>
              <SelectItem value="today">Today's Follow-ups</SelectItem>
              <SelectItem value="overdue">Overdue Follow-ups</SelectItem>
              <SelectItem value="upcoming">Upcoming Follow-ups</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sourceFilter} onValueChange={setSourceFilter}>
            <SelectTrigger className="w-36 bg-card">
              <SelectValue placeholder="Source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              <SelectItem value="Meta">Meta</SelectItem>
              <SelectItem value="Facebook">Facebook</SelectItem>
              <SelectItem value="Instagram">Instagram</SelectItem>
              <SelectItem value="Manual">Manual</SelectItem>
            </SelectContent>
          </Select>

          {role === "ho" && (
            <Select value={stateFilter} onValueChange={setStateFilter}>
              <SelectTrigger className="w-40 bg-card">
                <SelectValue placeholder="State" />
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

          {role !== "cluster" && (
            <Select value={clusterFilter} onValueChange={setClusterFilter}>
              <SelectTrigger className="w-44 bg-card">
                <SelectValue placeholder="Cluster" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Clusters</SelectItem>
                {visibleClusters.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {(query ||
            sourceFilter !== "all" ||
            statusFilter !== "all" ||
            followUpFilter !== "all" ||
            stateFilter !== "all" ||
            clusterFilter !== "all") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setQuery("");
                setSourceFilter("all");
                setStatusFilter("all");
                setFollowUpFilter("all");
                setStateFilter("all");
                setClusterFilter("all");
              }}
            >
              <Filter className="size-4" /> Reset Filters
            </Button>
          )}
        </div>
      </div>

      <DataTable
        columns={[
          {
            key: "id",
            header: "Lead ID",
            cell: (r) => (
              <Link to={`/leads/${r.id}`} className="font-semibold text-primary hover:underline">
                {r.id}
              </Link>
            ),
          },
          {
            key: "customer",
            header: "Customer Name",
            cell: (r) => (
              <div>
                <p className="font-semibold text-foreground">{r.customerName}</p>
                <p className="text-xs text-muted-foreground">{r.phone}</p>
              </div>
            ),
          },
          {
            key: "location",
            header: "City / State",
            cell: (r) => (
              <div>
                <p className="text-xs font-medium">{r.city}</p>
                <p className="text-[11px] text-muted-foreground">{stateName(r.stateId)}</p>
              </div>
            ),
          },
          { key: "source", header: "Source", cell: (r) => <SourceBadge source={r.source} /> },
          {
            key: "cluster",
            header: "Assigned Cluster",
            cell: (r) => (
              <span className="text-xs font-medium text-foreground">
                {clusterName(r.clusterId)}
              </span>
            ),
          },
          { key: "product", header: "Product", cell: (r) => r.product },
          {
            key: "priority",
            header: "Priority",
            cell: (r) => <PriorityBadge priority={r.priority} />,
          },
          { key: "status", header: "Status", cell: (r) => <StatusBadge status={r.status} /> },
          {
            key: "nextFollowUp",
            header: "Next Follow-up",
            cell: (r) =>
              r.nextFollowUp ? (
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded ${
                    r.nextFollowUp === todayStr
                      ? "bg-amber-500/10 text-amber-600 font-bold border border-amber-500/30"
                      : r.nextFollowUp < todayStr
                        ? "bg-rose-500/10 text-rose-600 font-bold border border-rose-500/30"
                        : "bg-muted text-foreground"
                  }`}
                >
                  {fmtDate(r.nextFollowUp)}
                  {r.nextFollowUp === todayStr && " (Today)"}
                  {r.nextFollowUp < todayStr && " (Overdue)"}
                </span>
              ) : (
                <span className="text-xs text-muted-foreground">—</span>
              ),
          },
          { key: "created", header: "Created", cell: (r) => fmtDate(r.createdDate) },
          {
            key: "actions",
            header: "",
            cell: (r) =>
              canAssign && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setAssignLead(r);
                  }}
                >
                  <Share2 className="size-3.5" /> Reassign
                </Button>
              ),
          },
        ]}
        rows={filtered}
        onRowClick={(r) => navigate(`/leads/${r.id}`)}
      />

      <AssignLeadDialog lead={assignLead} onOpenChange={(open) => !open && setAssignLead(null)} />
    </div>
  );
}
