import { useEffect, useState } from "react";
import { Building2, Filter, Map, Plus, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { PageHeader, SectionCard } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/services/api";
import { states as mockStates, clusters as mockClusters } from "@/data/mock-data";

export function SetupManagementPage() {
  const [states, setStates] = useState<any[]>(mockStates);
  const [clusters, setClusters] = useState<any[]>(mockClusters);
  const [roles, setRoles] = useState<any[]>([]);

  // State Form
  const [stateName, setStateName] = useState("");
  const [stateCode, setStateCode] = useState("");

  // Cluster Form
  const [clusterName, setClusterName] = useState("");
  const [clusterCode, setClusterCode] = useState("");
  const [selectedStateId, setSelectedStateId] = useState("");
  const [company, setCompany] = useState("");
  const [manager, setManager] = useState("");
  const [filterClusterState, setFilterClusterState] = useState<string>("all");

  // Role Form
  const [roleName, setRoleName] = useState("");
  const [roleCode, setRoleCode] = useState("");
  const [roleDesc, setRoleDesc] = useState("");

  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      const [sRes, cRes, rRes] = await Promise.all([
        api.getStates().catch(() => mockStates),
        api.getClusters().catch(() => mockClusters),
        api.getRoles().catch(() => [
          { id: "R-001", name: "HO Admin", code: "ho", description: "Head Office Administrator" },
          {
            id: "R-002",
            name: "State HO / Admin",
            code: "state",
            description: "State Administrator",
          },
          {
            id: "R-003",
            name: "Cluster Manager",
            code: "cluster",
            description: "Cluster Hub Manager",
          },
        ]),
      ]);
      setStates(sRes);
      setClusters(cRes);
      setRoles(rRes);
      if (sRes.length > 0) setSelectedStateId(sRes[0].id);
    } catch (e) {
      console.warn("Using fallback setup data");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const displayedClusters = clusters.filter((c) => {
    if (filterClusterState !== "all" && c.stateId !== filterClusterState) return false;
    return true;
  });

  const handleCreateState = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stateName.trim() || !stateCode.trim()) {
      toast.error("State Name and Code are required.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.createState({ name: stateName.trim(), code: stateCode.trim() });
      toast.success(res.message || "State created in MongoDB!");
      setStateName("");
      setStateCode("");
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to create state");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCluster = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clusterName.trim() || !selectedStateId) {
      toast.error("Cluster Name and State selection are required.");
      return;
    }

    setLoading(true);
    try {
      const payload: {
        name: string;
        stateId: string;
        code?: string;
        company?: string;
        manager?: string;
      } = {
        name: clusterName.trim(),
        stateId: selectedStateId,
      };
      if (clusterCode.trim()) payload.code = clusterCode.trim();
      if (company.trim()) payload.company = company.trim();
      if (manager.trim()) payload.manager = manager.trim();

      const res = await api.createCluster(payload);
      toast.success(res.message || "Cluster created in MongoDB!");
      setClusterName("");
      setClusterCode("");
      setCompany("");
      setManager("");
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to create cluster");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleName.trim()) {
      toast.error("Role Name is required.");
      return;
    }

    setLoading(true);
    try {
      const payload: {
        name: string;
        code?: string;
        description?: string;
      } = {
        name: roleName.trim(),
      };
      if (roleCode.trim()) payload.code = roleCode.trim();
      if (roleDesc.trim()) payload.description = roleDesc.trim();

      const res = await api.createRole(payload);
      toast.success(res.message || "Role created in MongoDB!");
      setRoleName("");
      setRoleCode("");
      setRoleDesc("");
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to create role");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Network & Custom Roles Setup"
        description="HO Admin portal to create and manage States, Operational Clusters, and System Roles stored in MongoDB collections."
      />

      <Tabs defaultValue="states" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 max-w-md bg-muted">
          <TabsTrigger value="states" className="gap-1.5 text-xs">
            <Map className="size-3.5" /> States
          </TabsTrigger>
          <TabsTrigger value="clusters" className="gap-1.5 text-xs">
            <Building2 className="size-3.5" /> Clusters
          </TabsTrigger>
          <TabsTrigger value="roles" className="gap-1.5 text-xs">
            <ShieldCheck className="size-3.5" /> System Roles
          </TabsTrigger>
        </TabsList>

        {/* Create State Tab */}
        <TabsContent value="states" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <SectionCard title="Create New State" className="lg:col-span-1">
              <form onSubmit={handleCreateState} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="sname">State Name *</Label>
                  <Input
                    id="sname"
                    placeholder="e.g. Telangana"
                    value={stateName}
                    onChange={(e) => setStateName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="scode">State Code *</Label>
                  <Input
                    id="scode"
                    placeholder="e.g. TS"
                    value={stateCode}
                    onChange={(e) => setStateCode(e.target.value)}
                    required
                    className="uppercase font-mono"
                  />
                </div>

                <Button type="submit" disabled={loading} className="w-full cursor-pointer">
                  <Plus className="size-4" /> Create State in MongoDB
                </Button>
              </form>
            </SectionCard>

            <SectionCard title="Existing States Collection" className="lg:col-span-2">
              <div className="divide-y divide-border">
                {states.map((s) => (
                  <div key={s.id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{s.name}</p>
                      <p className="text-xs font-mono text-muted-foreground">ID / Code: {s.code}</p>
                    </div>
                    <span className="rounded bg-primary/10 px-2 py-1 text-xs font-bold text-primary">
                      {s.code}
                    </span>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
        </TabsContent>

        {/* Create Cluster Tab */}
        <TabsContent value="clusters" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <SectionCard title="Create New Cluster Hub" className="lg:col-span-1">
              <form onSubmit={handleCreateCluster} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="cstate">Assigned State *</Label>
                  <Select value={selectedStateId} onValueChange={setSelectedStateId}>
                    <SelectTrigger className="bg-card">
                      <SelectValue placeholder="Select State..." />
                    </SelectTrigger>
                    <SelectContent>
                      {states.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name} ({s.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="cname">Cluster Name *</Label>
                  <Input
                    id="cname"
                    placeholder="e.g. Hyderabad Cluster"
                    value={clusterName}
                    onChange={(e) => setClusterName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="ccode">Cluster Code (Optional)</Label>
                  <Input
                    id="ccode"
                    placeholder="e.g. TS-HYD"
                    value={clusterCode}
                    onChange={(e) => setClusterCode(e.target.value)}
                    className="uppercase font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="comp">Company Entity Name</Label>
                  <Input
                    id="comp"
                    placeholder="e.g. ROOFI Hyderabad Roofing Pvt Ltd"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="mgr">Cluster Manager Name</Label>
                  <Input
                    id="mgr"
                    placeholder="e.g. Suresh Kumar"
                    value={manager}
                    onChange={(e) => setManager(e.target.value)}
                  />
                </div>

                <Button type="submit" disabled={loading} className="w-full cursor-pointer">
                  <Plus className="size-4" /> Create Cluster in MongoDB
                </Button>
              </form>
            </SectionCard>

            <SectionCard
              title="Existing Clusters Collection"
              action={
                <div className="flex items-center gap-2">
                  <Filter className="size-3.5 text-muted-foreground" />
                  <Select value={filterClusterState} onValueChange={setFilterClusterState}>
                    <SelectTrigger className="w-40 bg-card h-8 text-xs">
                      <SelectValue placeholder="Filter by State" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All States</SelectItem>
                      {states.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name} ({s.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              }
              className="lg:col-span-2"
            >
              <div className="divide-y divide-border max-h-[600px] overflow-y-auto pr-1">
                {displayedClusters.length === 0 ? (
                  <p className="py-6 text-center text-xs text-muted-foreground">
                    No clusters found for selected state filter.
                  </p>
                ) : (
                  displayedClusters.map((c) => (
                    <div key={c.id} className="flex items-center justify-between py-3">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{c.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {c.company} · Manager: {c.manager || "Unassigned"}
                        </p>
                      </div>
                      <span className="text-xs font-mono text-primary font-bold">{c.code}</span>
                    </div>
                  ))
                )}
              </div>
            </SectionCard>
          </div>
        </TabsContent>

        {/* Create Role Tab */}
        <TabsContent value="roles" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <SectionCard title="Create Custom System Role" className="lg:col-span-1">
              <form onSubmit={handleCreateRole} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="rname">Role Name *</Label>
                  <Input
                    id="rname"
                    placeholder="e.g. Sales Executive"
                    value={roleName}
                    onChange={(e) => setRoleName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="rcode">Role Code / Identifier</Label>
                  <Input
                    id="rcode"
                    placeholder="e.g. sales"
                    value={roleCode}
                    onChange={(e) => setRoleCode(e.target.value)}
                    className="lowercase font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="rdesc">Description</Label>
                  <Textarea
                    id="rdesc"
                    rows={3}
                    placeholder="Field sales executive for lead follow-ups and customer visits."
                    value={roleDesc}
                    onChange={(e) => setRoleDesc(e.target.value)}
                  />
                </div>

                <Button type="submit" disabled={loading} className="w-full cursor-pointer">
                  <Plus className="size-4" /> Create Role in MongoDB
                </Button>
              </form>
            </SectionCard>

            <SectionCard title="Stored System Roles Collection" className="lg:col-span-2">
              <div className="divide-y divide-border">
                {roles.map((r) => (
                  <div key={r.id || r.name} className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{r.name}</p>
                      <p className="text-xs text-muted-foreground">{r.description}</p>
                    </div>
                    <span className="rounded bg-muted px-2 py-1 text-xs font-mono text-foreground font-semibold">
                      {r.code || r.id}
                    </span>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
