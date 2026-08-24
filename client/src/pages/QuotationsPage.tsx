import { Link, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { Download, FileText, Plus, Search, Settings } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/page-header";
import { DataTable } from "@/components/common/data-table";
import { StatCard } from "@/components/common/stat-card";
import { DocStatusBadge } from "@/components/common/doc-common";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { clusterName, customers, docTotals, quotations as mockQuotations } from "@/data/mock-data";
import { fmtDate, inr, inrShort } from "@/lib/format";
import { useScope } from "@/context/session-context";
import { api } from "@/services/api";
import type { Quotation } from "@/types";

export function QuotationsPage() {
  const { scope, visibleClusters, role } = useScope();
  const navigate = useNavigate();

  const [quotationList, setQuotationList] = useState<Quotation[]>(mockQuotations);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [clusterFilter, setClusterFilter] = useState("all");

  const fetchQuotations = async () => {
    try {
      const data = await api.getQuotations();
      if (Array.isArray(data)) {
        setQuotationList(data);
      }
    } catch (e) {
      console.warn("Could not fetch quotations from API");
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, []);

  const scopedQuotations = useMemo(() => scope(quotationList), [scope, quotationList]);

  const filtered = useMemo(() => {
    return scopedQuotations.filter((q) => {
      if (query.trim()) {
        const text = query.toLowerCase();
        const customer = customers.find((c) => c.id === q.customerId);
        const match =
          q.id.toLowerCase().includes(text) ||
          (customer && customer.name.toLowerCase().includes(text)) ||
          (q.companyTitle && q.companyTitle.toLowerCase().includes(text));
        if (!match) return false;
      }
      if (statusFilter !== "all" && q.status !== statusFilter) return false;
      if (clusterFilter !== "all" && q.clusterId !== clusterFilter) return false;
      return true;
    });
  }, [scopedQuotations, query, statusFilter, clusterFilter]);

  const totalValue = scopedQuotations.reduce(
    (s, q) => s + (q.items ? docTotals(q.items).total : 0),
    0,
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={role === "ho" ? "All States & Clusters Quotations" : "Quotations"}
        description={
          role === "ho"
            ? "Central HO view of all state and cluster quotations generated across Tamil Nadu, Kerala, Andhra Pradesh, and Karnataka."
            : "State/Cluster roofing estimates with custom header formats, line-item pricing and auto-calculated 18% GST."
        }
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.success("Exporting quotations to CSV")}
            >
              <Download className="size-4" /> Export CSV
            </Button>
            <Link to="/quotations/new">
              <Button size="sm">
                <Plus className="size-4" /> New Quotation
              </Button>
            </Link>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Total Quotations"
          value={scopedQuotations.length}
          icon={FileText}
          tone="brand"
        />
        <StatCard
          label="Accepted Quotations"
          value={scopedQuotations.filter((q) => q.status === "Accepted").length}
          tone="teal"
        />
        <StatCard label="Total Quotation Value" value={inrShort(totalValue)} tone="default" />
      </div>

      <div className="card-elevated p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by quotation ID, header title, or customer..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36 bg-card">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {["Draft", "Sent", "Accepted", "Rejected", "Expired"].map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

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
        </div>
      </div>

      <DataTable
        columns={[
          {
            key: "id",
            header: "Quotation ID",
            cell: (r) => (
              <Link
                to={`/quotations/${r.id}`}
                className="font-semibold text-primary hover:underline"
              >
                {r.id}
              </Link>
            ),
          },
          {
            key: "customer",
            header: "Customer / Header Title",
            cell: (r) => {
              const cust = customers.find((c) => c.id === r.customerId);
              return (
                <div>
                  <p className="font-semibold text-foreground">
                    {r.companyTitle || (cust ? cust.name : r.customerId)}
                  </p>
                  {cust && <p className="text-xs text-muted-foreground">Customer: {cust.name}</p>}
                </div>
              );
            },
          },
          { key: "cluster", header: "Servicing Cluster", cell: (r) => clusterName(r.clusterId) },
          {
            key: "items",
            header: "Line Items",
            cell: (r) => `${r.items ? r.items.length : 0} items`,
          },
          {
            key: "total",
            header: "Grand Total",
            cell: (r) => (
              <span className="font-semibold">{inr(r.items ? docTotals(r.items).total : 0)}</span>
            ),
          },
          { key: "status", header: "Status", cell: (r) => <DocStatusBadge status={r.status} /> },
          { key: "date", header: "Date", cell: (r) => fmtDate(r.date) },
          { key: "valid", header: "Valid Until", cell: (r) => fmtDate(r.validUntil) },
        ]}
        rows={filtered}
        onRowClick={(r) => navigate(`/quotations/${r.id}`)}
      />
    </div>
  );
}
