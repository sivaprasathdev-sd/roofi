import { useMemo, useState, useEffect } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { PageHeader, SectionCard } from "@/components/layout/page-header";
import { StatCard } from "@/components/common/stat-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  clusterName,
  clusters,
  docTotals,
  leads as mockLeads,
  monthlyTrend,
  quotations as mockQuotations,
  proformas as mockProformas,
  stateName,
  states,
} from "@/data/mock-data";
import { inr, inrShort } from "@/lib/format";
import { useScope } from "@/context/session-context";
import { api } from "@/services/api";

export function ReportsPage() {
  const { user, role, stateId: userStateId, clusterId: userClusterId } = useScope();
  const [period, setPeriod] = useState("ytd");

  // Filter states
  const [selectedState, setSelectedState] = useState<string>(
    role === "ho" ? "all" : userStateId || "TN",
  );
  const [selectedCluster, setSelectedCluster] = useState<string>(
    role === "cluster" ? userClusterId || "CL-001" : "all",
  );

  const [leadList, setLeadList] = useState<any[]>(mockLeads);
  const [quotationList, setQuotationList] = useState<any[]>(mockQuotations);

  useEffect(() => {
    Promise.all([
      api.getLeads().catch(() => mockLeads),
      api.getQuotations().catch(() => mockQuotations),
    ]).then(([lData, qData]) => {
      if (Array.isArray(lData) && lData.length > 0) setLeadList(lData);
      if (Array.isArray(qData) && qData.length > 0) setQuotationList(qData);
    });
  }, []);

  // Available clusters for dropdowns based on role & selected state
  const availableClusters = useMemo(() => {
    if (role === "cluster") return clusters.filter((c) => c.id === userClusterId);
    if (role === "state") return clusters.filter((c) => c.stateId === userStateId);
    if (selectedState !== "all") return clusters.filter((c) => c.stateId === selectedState);
    return clusters;
  }, [role, userStateId, userClusterId, selectedState]);

  // Scoped Data Filtering for Reports
  const filteredLeads = useMemo(() => {
    return leadList.filter((l) => {
      if (role === "cluster") return l.clusterId === userClusterId;
      if (role === "state") {
        if (l.stateId !== userStateId) return false;
        if (selectedCluster !== "all" && l.clusterId !== selectedCluster) return false;
        return true;
      }
      // HO Admin
      if (selectedState !== "all" && l.stateId !== selectedState) return false;
      if (selectedCluster !== "all" && l.clusterId !== selectedCluster) return false;
      return true;
    });
  }, [leadList, role, userStateId, userClusterId, selectedState, selectedCluster]);

  const filteredQuotations = useMemo(() => {
    return quotationList.filter((q) => {
      if (role === "cluster") return q.clusterId === userClusterId;
      if (role === "state") {
        if (q.stateId !== userStateId) return false;
        if (selectedCluster !== "all" && q.clusterId !== selectedCluster) return false;
        return true;
      }
      // HO Admin
      if (selectedState !== "all" && q.stateId !== selectedState) return false;
      if (selectedCluster !== "all" && q.clusterId !== selectedCluster) return false;
      return true;
    });
  }, [quotationList, role, userStateId, userClusterId, selectedState, selectedCluster]);

  const totalQuotationValue = filteredQuotations.reduce(
    (s, q) => s + (q.items ? docTotals(q.items).total : 0),
    0,
  );
  const convertedLeads = filteredLeads.filter((l) => l.status === "Converted").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title={
          role === "ho"
            ? "Central HO Analytics & Executive Reports"
            : role === "state"
              ? `${stateName(userStateId || "TN")} State Analytics & Reports`
              : `${clusterName(userClusterId || "CL-001")} Performance Reports`
        }
        description="Comprehensive analysis of lead volumes, state/cluster conversion velocity, and quotation values."
        actions={
          <div className="flex items-center gap-2">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-32 bg-card">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="q3">Q3 2026</SelectItem>
                <SelectItem value="ytd">Year to Date</SelectItem>
                <SelectItem value="full">Full Year 2026</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
      />

      {/* Role-Based Filter Toolbar */}
      <div className="card-elevated p-4 flex flex-wrap items-center justify-between gap-4 bg-card">
        <div className="flex flex-wrap items-center gap-3">
          {/* HO Admin State Filter */}
          {role === "ho" && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground">State:</span>
              <Select
                value={selectedState}
                onValueChange={(val) => {
                  setSelectedState(val);
                  setSelectedCluster("all");
                }}
              >
                <SelectTrigger className="w-44 bg-background">
                  <SelectValue placeholder="All States" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All States (India)</SelectItem>
                  {states.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* HO Admin & State Admin Cluster Filter */}
          {role !== "cluster" && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground">Cluster:</span>
              <Select value={selectedCluster} onValueChange={setSelectedCluster}>
                <SelectTrigger className="w-48 bg-background">
                  <SelectValue placeholder="All Clusters" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {role === "state"
                      ? `All ${stateName(userStateId || "TN")} Clusters`
                      : "All Clusters"}
                  </SelectItem>
                  {availableClusters.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Cluster Locked Scope Badge */}
          {role === "cluster" && (
            <div className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20">
              Cluster Scope: {clusterName(userClusterId)}
            </div>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          Showing data for{" "}
          <span className="font-semibold text-foreground">{filteredLeads.length} leads</span> &amp;{" "}
          <span className="font-semibold text-foreground">
            {filteredQuotations.length} quotations
          </span>
          .
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total Leads Received" value={filteredLeads.length} tone="brand" />
        <StatCard label="Converted Customers" value={convertedLeads} tone="teal" />
        <StatCard
          label="Total Quotation Pipeline Value"
          value={inrShort(totalQuotationValue)}
          tone="default"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Monthly Sales & Quotation Volume (₹)">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="month" stroke="var(--color-muted-foreground)" fontSize={12} />
                <YAxis
                  stroke="var(--color-muted-foreground)"
                  fontSize={12}
                  tickFormatter={(v) => `₹${v / 100000}L`}
                />
                <Tooltip
                  formatter={(v: any) => inr(Number(v))}
                  contentStyle={{
                    backgroundColor: "var(--color-card)",
                    borderColor: "var(--color-border)",
                    color: "var(--color-foreground)",
                    borderRadius: "var(--radius-md)",
                    fontSize: "12px",
                  }}
                  itemStyle={{ color: "var(--color-foreground)" }}
                />
                <Area
                  type="monotone"
                  dataKey="invoice"
                  name="Quotation Volume"
                  stroke="var(--color-primary)"
                  fill="var(--color-primary)"
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Lead Conversion Velocity">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="month" stroke="var(--color-muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-card)",
                    borderColor: "var(--color-border)",
                    color: "var(--color-foreground)",
                    borderRadius: "var(--radius-md)",
                    fontSize: "12px",
                  }}
                  itemStyle={{ color: "var(--color-foreground)" }}
                />
                <Bar
                  dataKey="received"
                  name="Received"
                  fill="var(--color-info)"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="assigned"
                  name="Assigned"
                  fill="var(--color-warning)"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="converted"
                  name="Converted"
                  fill="var(--color-primary)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
