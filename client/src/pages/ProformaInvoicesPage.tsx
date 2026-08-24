import { Link, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { Download, Plus, ReceiptText, Search } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/page-header";
import { DataTable } from "@/components/common/data-table";
import { StatCard } from "@/components/common/stat-card";
import { DocStatusBadge } from "@/components/common/doc-common";
import { InvoiceSettingsDialog } from "@/components/dialogs/invoice-settings-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { clusterName, customers, docTotals, proformas as mockProformas } from "@/data/mock-data";
import { fmtDate, inr, inrShort } from "@/lib/format";
import { useScope } from "@/context/session-context";
import { api } from "@/services/api";
import type { Proforma } from "@/types";

export function ProformaInvoicesPage() {
  const { scope, visibleClusters, role } = useScope();
  const navigate = useNavigate();

  const [proformaList, setProformaList] = useState<Proforma[]>(mockProformas);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [clusterFilter, setClusterFilter] = useState("all");

  const fetchProformas = async () => {
    try {
      const data = await api.getProformas();
      if (Array.isArray(data)) {
        setProformaList(data);
      }
    } catch (e) {
      console.warn("Could not fetch proformas from API");
    }
  };

  useEffect(() => {
    fetchProformas();
  }, []);

  const scopedProformas = useMemo(() => scope(proformaList), [scope, proformaList]);

  const filtered = useMemo(() => {
    return scopedProformas.filter((p) => {
      if (query.trim()) {
        const text = query.toLowerCase();
        const customer = customers.find((c) => c.id === p.customerId);
        const match =
          p.id.toLowerCase().includes(text) ||
          (customer && customer.name.toLowerCase().includes(text)) ||
          (p.companyTitle && p.companyTitle.toLowerCase().includes(text));
        if (!match) return false;
      }
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      if (clusterFilter !== "all" && p.clusterId !== clusterFilter) return false;
      return true;
    });
  }, [scopedProformas, query, statusFilter, clusterFilter]);

  const totalValue = scopedProformas.reduce(
    (s, p) => s + (p.items ? docTotals(p.items).total : 0),
    0,
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={role === "ho" ? "All States & Clusters Invoices" : "Invoices"}
        description={
          role === "ho"
            ? "Central HO view of all state and cluster invoices issued across Tamil Nadu, Kerala, Andhra Pradesh, and Karnataka."
            : "Manage state and cluster invoices issued for ROOFI stone coated metal roofing projects."
        }
        actions={
          <div className="flex items-center gap-2">
            <InvoiceSettingsDialog />
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.success("Exporting invoices to CSV")}
            >
              <Download className="size-4" /> Export CSV
            </Button>
            <Link to="/proforma-invoices/new">
              <Button size="sm">
                <Plus className="size-4" /> New Invoice
              </Button>
            </Link>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Total Invoices"
          value={scopedProformas.length}
          icon={ReceiptText}
          tone="brand"
        />
        <StatCard
          label="Issued / Converted"
          value={scopedProformas.filter((p) => ["Issued", "Converted"].includes(p.status)).length}
          tone="teal"
        />
        <StatCard label="Total Invoice Value" value={inrShort(totalValue)} tone="default" />
      </div>

      <div className="card-elevated p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by invoice ID, header title, or customer..."
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
              {["Draft", "Issued", "Converted", "Cancelled"].map((s) => (
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
            header: "Invoice ID",
            cell: (r) => (
              <Link
                to={`/proforma-invoices/${r.id}`}
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
            header: "Amount",
            cell: (r) => (
              <span className="font-semibold">{inr(r.items ? docTotals(r.items).total : 0)}</span>
            ),
          },
          { key: "status", header: "Status", cell: (r) => <DocStatusBadge status={r.status} /> },
          { key: "date", header: "Date", cell: (r) => fmtDate(r.date) },
          { key: "dueDate", header: "Due Date", cell: (r) => fmtDate(r.dueDate) },
        ]}
        rows={filtered}
        onRowClick={(r) => navigate(`/proforma-invoices/${r.id}`)}
      />
    </div>
  );
}
