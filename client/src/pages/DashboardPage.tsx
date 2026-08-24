import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import {
  ArrowUpRight,
  CalendarClock,
  CheckCircle2,
  FileSpreadsheet,
  FileText,
  IndianRupee,
  Percent,
  Plus,
  Receipt,
  Share2,
  Target,
  UserPlus,
  Users,
} from "lucide-react";

import { PageHeader, SectionCard } from "@/components/layout/page-header";
import { StatCard } from "@/components/common/stat-card";
import { SourceBadge, StatusBadge } from "@/components/common/badges";
import { DataTable } from "@/components/common/data-table";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useScope } from "@/context/session-context";
import { useLeads } from "@/context/leads-context";
import {
  clusterName,
  clusters,
  customers,
  docTotals,
  invoices,
  monthlyTrend,
  proformas,
  quotations,
  stateName,
  states,
} from "@/data/mock-data";
import { fmtDate, inrShort, num } from "@/lib/format";
import type { Lead } from "@/types";

export function DashboardPage() {
  const { role, user, scope, visibleClusters, visibleStates } = useScope();
  const { leads } = useLeads();
  const [selectedState, setSelectedState] = useState<string>("all");
  const [selectedCluster, setSelectedCluster] = useState<string>("all");

  const scopedLeads = useMemo(() => {
    let rows = scope(leads);
    if (selectedState !== "all") rows = rows.filter((r) => r.stateId === selectedState);
    if (selectedCluster !== "all") rows = rows.filter((r) => r.clusterId === selectedCluster);
    return rows;
  }, [scope, leads, selectedState, selectedCluster]);

  const totalLeads = scopedLeads.length;
  const newLeads = scopedLeads.filter((l) => l.status === "New").length;
  const assignedLeads = scopedLeads.filter((l) => l.status === "Assigned").length;
  const inProgressLeads = scopedLeads.filter((l) =>
    ["Contacted", "Qualified", "Follow-up", "Quotation", "Proforma Invoice"].includes(l.status),
  ).length;
  const convertedLeads = scopedLeads.filter((l) => l.status === "Converted").length;
  const lostLeads = scopedLeads.filter((l) => l.status === "Lost").length;
  const convRate = totalLeads ? Math.round((convertedLeads / totalLeads) * 100) : 0;

  const scopedInvoices = scope(invoices);
  const totalBilled = scopedInvoices.reduce((s, i) => s + docTotals(i.items).total, 0);
  const totalCollected = scopedInvoices.reduce((s, i) => s + i.paid, 0);

  const statusDistribution = useMemo(
    () => [
      { name: "New", count: newLeads, color: "var(--color-info)" },
      { name: "Assigned", count: assignedLeads, color: "var(--color-deep-teal)" },
      { name: "In Progress", count: inProgressLeads, color: "var(--color-warning)" },
      { name: "Converted", count: convertedLeads, color: "var(--color-primary)" },
      { name: "Lost", count: lostLeads, color: "var(--color-destructive)" },
    ],
    [newLeads, assignedLeads, inProgressLeads, convertedLeads, lostLeads],
  );

  const sourceDistribution = useMemo(() => {
    const counts = { Meta: 0, Facebook: 0, Instagram: 0, Manual: 0 };
    scopedLeads.forEach((l) => counts[l.source]++);
    return [
      { name: "Meta", value: counts.Meta, color: "var(--color-info)" },
      { name: "Facebook", value: counts.Facebook, color: "var(--color-deep-teal)" },
      { name: "Instagram", value: counts.Instagram, color: "var(--color-cyan)" },
      { name: "Manual", value: counts.Manual, color: "var(--color-primary)" },
    ];
  }, [scopedLeads]);

  const statePerformance = useMemo(
    () =>
      states.map((s) => {
        const stateL = leads.filter((l) => l.stateId === s.id);
        const conv = stateL.filter((l) => l.status === "Converted").length;
        const total = stateL.length || 1;
        return {
          state: s.name,
          received: stateL.length,
          converted: conv,
          rate: Math.round((conv / total) * 100),
        };
      }),
    [leads],
  );

  const clusterPerformance = useMemo(
    () =>
      visibleClusters.map((c) => {
        const cLeads = leads.filter((l) => l.clusterId === c.id);
        const conv = cLeads.filter((l) => l.status === "Converted").length;
        return {
          name: c.name.replace(" Cluster", ""),
          leads: cLeads.length,
          converted: conv,
          target: 15,
        };
      }),
    [visibleClusters, leads],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${user?.name.split(" ")[0]}`}
        description={
          role === "ho"
            ? "Overview of lead generation, distribution and sales performance across all states and clusters."
            : role === "state"
              ? `State performance overview for ${stateName(user?.stateId ?? "")}.`
              : `Operational dashboard for ${clusterName(user?.clusterId)}.`
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {role === "ho" && (
              <Select value={selectedState} onValueChange={setSelectedState}>
                <SelectTrigger className="w-40 bg-card">
                  <SelectValue placeholder="All States" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All States</SelectItem>
                  {states.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {role !== "cluster" && (
              <Select value={selectedCluster} onValueChange={setSelectedCluster}>
                <SelectTrigger className="w-44 bg-card">
                  <SelectValue placeholder="All Clusters" />
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
            <Link to="/leads">
              <Button size="sm">
                <Plus className="size-4" /> Add Lead
              </Button>
            </Link>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Leads"
          value={num(totalLeads)}
          sub={`${newLeads} new · ${assignedLeads} assigned`}
          icon={Users}
          tone="brand"
        />
        <StatCard
          label="In Progress"
          value={num(inProgressLeads)}
          sub="Follow-up & Quotations"
          icon={CalendarClock}
          tone="warning"
        />
        <StatCard
          label="Converted Leads"
          value={num(convertedLeads)}
          sub={`${convRate}% conversion rate`}
          icon={CheckCircle2}
          tone="teal"
        />
        <StatCard
          label="Total Invoiced"
          value={inrShort(totalBilled)}
          sub={`Collected: ${inrShort(totalCollected)}`}
          icon={IndianRupee}
          tone="default"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <SectionCard title="Lead Acquisition & Conversion Trend" className="lg:col-span-2">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrend}>
                <defs>
                  <linearGradient id="gradReceived" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradConv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-teal)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--color-teal)" stopOpacity={0} />
                  </linearGradient>
                </defs>
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
                <Area
                  type="monotone"
                  dataKey="received"
                  name="Leads Received"
                  stroke="var(--color-primary)"
                  fillOpacity={1}
                  fill="url(#gradReceived)"
                />
                <Area
                  type="monotone"
                  dataKey="converted"
                  name="Leads Converted"
                  stroke="var(--color-teal)"
                  fillOpacity={1}
                  fill="url(#gradConv)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Leads by Source">
          <div className="flex h-72 flex-col justify-between">
            <ResponsiveContainer width="100%" height="55%">
              <PieChart>
                <Pie
                  data={sourceDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={55}
                >
                  {sourceDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
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
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5 pt-2">
              {sourceDistribution.map((s) => (
                <div key={s.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="size-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                    <span className="text-muted-foreground">{s.name}</span>
                  </div>
                  <span className="font-semibold text-foreground">
                    {s.value} ({totalLeads ? Math.round((s.value / totalLeads) * 100) : 0}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Cluster Lead Conversion Performance">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={clusterPerformance.slice(0, 6)}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="name" stroke="var(--color-muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={11} />
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
                  dataKey="leads"
                  name="Total Leads"
                  fill="var(--color-muted)"
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

        {role === "ho" ? (
          <SectionCard title="Statewise Summary">
            <div className="space-y-3">
              {statePerformance.map((s) => (
                <div key={s.state} className="rounded-lg border border-border p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-foreground">{s.state}</span>
                    <span className="text-xs font-medium text-primary">
                      {s.converted} converted ({s.rate}%)
                    </span>
                  </div>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div className="h-full bg-primary" style={{ width: `${s.rate}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        ) : (
          <SectionCard title="Quick Action Center">
            <div className="grid gap-3 sm:grid-cols-2">
              <Link
                to="/leads"
                className="rounded-lg border border-border p-4 hover:bg-accent transition-colors"
              >
                <Users className="size-5 text-primary" />
                <h3 className="mt-2 text-sm font-semibold">Manage Leads</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  View, assign and update follow-up logs.
                </p>
              </Link>
              <Link
                to="/quotations/new"
                className="rounded-lg border border-border p-4 hover:bg-accent transition-colors"
              >
                <FileText className="size-5 text-primary" />
                <h3 className="mt-2 text-sm font-semibold">New Quotation</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Build line-item quotation with GST calculation.
                </p>
              </Link>
            </div>
          </SectionCard>
        )}
      </div>

      <SectionCard
        title="Recent Lead Activity"
        action={
          <Link
            to="/leads"
            className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
          >
            View All <ArrowUpRight className="size-3" />
          </Link>
        }
      >
        <DataTable
          columns={[
            {
              key: "id",
              header: "Lead ID",
              cell: (r) => <span className="font-semibold text-primary">{r.id}</span>,
            },
            { key: "name", header: "Customer", cell: (r) => r.customerName },
            { key: "source", header: "Source", cell: (r) => <SourceBadge source={r.source} /> },
            {
              key: "state",
              header: "State / Cluster",
              cell: (r) => `${stateName(r.stateId)} · ${clusterName(r.clusterId)}`,
            },
            { key: "product", header: "Product", cell: (r) => r.product },
            { key: "status", header: "Status", cell: (r) => <StatusBadge status={r.status} /> },
            { key: "created", header: "Created", cell: (r) => fmtDate(r.createdDate) },
          ]}
          rows={scopedLeads.slice(0, 5)}
        />
      </SectionCard>
    </div>
  );
}
