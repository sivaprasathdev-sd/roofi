import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { Download, Search, UserCheck, UserPlus, Wallet } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/page-header";
import { DataTable } from "@/components/common/data-table";
import { StatCard } from "@/components/common/stat-card";
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
import { clusterName, customers as mockCustomers, stateName } from "@/data/mock-data";
import { fmtDate, inr, inrShort } from "@/lib/format";
import { useScope } from "@/context/session-context";
import { api } from "@/services/api";
import type { Customer } from "@/types";

export function CustomersPage() {
  const { scope, visibleClusters, visibleStates, role } = useScope();
  const navigate = useNavigate();

  const [customerList, setCustomerList] = useState<Customer[]>(mockCustomers);
  const [query, setQuery] = useState("");
  const [stateFilter, setStateFilter] = useState("all");
  const [clusterFilter, setClusterFilter] = useState("all");

  const fetchCustomers = async () => {
    try {
      const data = await api.getCustomers();
      if (Array.isArray(data)) {
        setCustomerList(data);
      }
    } catch (e) {
      console.warn("Could not fetch customers from backend API, using fallback data");
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const scopedCustomers = useMemo(() => scope(customerList), [scope, customerList]);

  const filtered = useMemo(() => {
    return scopedCustomers.filter((c) => {
      if (query.trim()) {
        const q = query.toLowerCase();
        const match =
          c.id.toLowerCase().includes(q) ||
          c.name.toLowerCase().includes(q) ||
          c.phone.includes(q) ||
          c.location.toLowerCase().includes(q);
        if (!match) return false;
      }
      if (stateFilter !== "all" && c.stateId !== stateFilter) return false;
      if (clusterFilter !== "all" && c.clusterId !== clusterFilter) return false;
      return true;
    });
  }, [scopedCustomers, query, stateFilter, clusterFilter]);

  const totalValue = scopedCustomers.reduce((s, c) => s + (c.purchaseValue || 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Converted Customers"
        description="Directory of accounts converted from leads across ROOFI clusters with purchase value and transaction history."
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.success("Exporting customer directory to CSV")}
          >
            <Download className="size-4" /> Export CSV
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Total Converted Customers"
          value={scopedCustomers.length}
          icon={UserCheck}
          tone="brand"
        />
        <StatCard
          label="Active Accounts"
          value={scopedCustomers.filter((c) => c.status === "Active").length}
          icon={UserPlus}
          tone="teal"
        />
        <StatCard
          label="Total Purchase Value"
          value={inrShort(totalValue)}
          icon={Wallet}
          tone="default"
        />
      </div>

      <div className="card-elevated p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by customer ID, name, phone, city..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
            />
          </div>

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
        </div>
      </div>

      <DataTable
        columns={[
          {
            key: "id",
            header: "Customer ID",
            cell: (r) => <span className="font-semibold text-primary">{r.id}</span>,
          },
          {
            key: "name",
            header: "Name & Contact",
            cell: (r) => (
              <div>
                <p className="font-semibold text-foreground">{r.name}</p>
                <p className="text-xs text-muted-foreground">{r.phone}</p>
              </div>
            ),
          },
          {
            key: "location",
            header: "Location",
            cell: (r) => `${r.location}, ${stateName(r.stateId)}`,
          },
          { key: "cluster", header: "Servicing Cluster", cell: (r) => clusterName(r.clusterId) },
          {
            key: "value",
            header: "Total Value",
            cell: (r) => <span className="font-semibold">{inr(r.purchaseValue || 0)}</span>,
          },
          {
            key: "status",
            header: "Status",
            cell: (r) => (
              <Badge
                variant="outline"
                className={
                  r.status === "Active" ? "border-primary/40 bg-primary/10 text-primary" : ""
                }
              >
                {r.status}
              </Badge>
            ),
          },
          { key: "date", header: "Converted Date", cell: (r) => fmtDate(r.createdDate) },
        ]}
        rows={filtered}
      />
    </div>
  );
}
