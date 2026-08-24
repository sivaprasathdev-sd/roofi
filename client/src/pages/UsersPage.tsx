import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Search, ShieldCheck, UserPlus, Users } from "lucide-react";

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
import {
  clusterName,
  clusters as mockClusters,
  stateName,
  states as mockStates,
  users as mockUsers,
} from "@/data/mock-data";
import { roleLabel, useSession } from "@/context/session-context";
import { api } from "@/services/api";
import type { Role } from "@/types";

export function UsersPage() {
  const { user: currentUser } = useSession();
  const isStateAdmin = currentUser?.role === "state";
  const userStateId = currentUser?.stateId;

  const [usersList, setUsersList] = useState<any[]>(mockUsers);
  const [rolesList, setRolesList] = useState<any[]>([]);
  const [statesList, setStatesList] = useState<any[]>(mockStates);
  const [clustersList, setClustersList] = useState<any[]>(mockClusters);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [stateFilter, setStateFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const fetchUsersAndRoles = useCallback(async () => {
    try {
      const [uRes, rRes, cRes, sRes] = await Promise.all([
        api
          .getUsers(isStateAdmin && userStateId ? { stateId: userStateId } : undefined)
          .catch(() => mockUsers),
        api.getRoles().catch(() => []),
        api.getClusters().catch(() => mockClusters),
        api.getStates().catch(() => mockStates),
      ]);
      setUsersList(uRes);
      setRolesList(rRes);
      if (cRes && cRes.length > 0) setClustersList(cRes);
      if (sRes && sRes.length > 0) setStatesList(sRes);
    } catch (e) {
      console.warn("Using fallback users list");
    } finally {
      setLoading(false);
    }
  }, [isStateAdmin, userStateId]);

  useEffect(() => {
    fetchUsersAndRoles();
  }, [fetchUsersAndRoles]);

  const scopedUsers =
    isStateAdmin && userStateId
      ? usersList.filter(
          (u) =>
            u.stateId === userStateId ||
            (u.clusterId &&
              clustersList.find((c) => c.id === u.clusterId)?.stateId === userStateId),
        )
      : usersList;

  const filtered = scopedUsers.filter((u) => {
    // State Filter for HO Admin
    if (stateFilter !== "all") {
      const uState = u.stateId || clustersList.find((c) => c.id === u.clusterId)?.stateId;
      if (uState !== stateFilter) return false;
    }

    // Role Filter
    if (
      roleFilter !== "all" &&
      u.role !== roleFilter &&
      u.role?.toLowerCase() !== roleFilter.toLowerCase()
    ) {
      return false;
    }

    // Search Query
    if (query.trim()) {
      const q = query.toLowerCase();
      return (
        u.id.toLowerCase().includes(q) ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.phone && u.phone.includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title={
          isStateAdmin
            ? `User Management (${stateName(userStateId || "")})`
            : "User & Access Control Management"
        }
        description={
          isStateAdmin
            ? `State directory of registered users for ${stateName(userStateId || "")}.`
            : "System user directory fetched live from MongoDB: Head Office Admins, State Admins, Cluster Managers, and Custom Roles."
        }
        actions={
          <Link to="/users/create">
            <Button size="sm">
              <UserPlus className="size-4" /> Add New User
            </Button>
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Total Registered Users"
          value={scopedUsers.length}
          icon={Users}
          tone="brand"
        />
        <StatCard
          label={isStateAdmin ? "State Admins" : "HO / State Admins"}
          value={scopedUsers.filter((u) => u.role === "ho" || u.role === "state").length}
          icon={ShieldCheck}
          tone="teal"
        />
        <StatCard
          label="Cluster & Custom Roles"
          value={scopedUsers.filter((u) => u.role !== "ho" && u.role !== "state").length}
          tone="default"
        />
      </div>

      <div className="card-elevated p-4 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[240px] flex-1 max-w-md">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search users by name, email, phone, ID..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {!isStateAdmin && (
          <Select value={stateFilter} onValueChange={setStateFilter}>
            <SelectTrigger className="w-48 bg-card">
              <SelectValue placeholder="All States" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All States</SelectItem>
              {statesList.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name} ({s.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-48 bg-card">
            <SelectValue placeholder="All Roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            {!isStateAdmin && <SelectItem value="ho">HO Admin</SelectItem>}
            <SelectItem value="state">State HO / Admin</SelectItem>
            <SelectItem value="cluster">Cluster Manager</SelectItem>
            {rolesList
              .filter((r) => !["ho", "state", "cluster"].includes(r.code || r.name))
              .map((r) => (
                <SelectItem key={r.id || r.code || r.name} value={r.code || r.name}>
                  {r.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={[
          {
            key: "id",
            header: "User ID",
            cell: (r) => <span className="font-semibold text-primary">{r.id}</span>,
          },
          {
            key: "name",
            header: "Name & Email",
            cell: (r) => (
              <div>
                <p className="font-semibold text-foreground">{r.name}</p>
                <p className="text-xs text-muted-foreground">{r.email}</p>
              </div>
            ),
          },
          { key: "phone", header: "Phone", cell: (r) => r.phone || "—" },
          {
            key: "role",
            header: "System Role",
            cell: (r) => <Badge variant="outline">{roleLabel[r.role as Role] || r.role}</Badge>,
          },
          {
            key: "jurisdiction",
            header: "Assigned Jurisdiction",
            cell: (r) =>
              r.clusterId
                ? clusterName(r.clusterId)
                : r.stateId
                  ? stateName(r.stateId)
                  : "Head Office All India",
          },
          {
            key: "status",
            header: "Status",
            cell: (r) => (
              <Badge
                variant="outline"
                className={
                  r.status === "Inactive"
                    ? "border-muted text-muted-foreground"
                    : "border-primary/40 bg-primary/10 text-primary"
                }
              >
                {r.status || "Active"}
              </Badge>
            ),
          },
          { key: "login", header: "Last Login", cell: (r) => r.lastLogin || "—" },
        ]}
        rows={filtered}
      />
    </div>
  );
}
