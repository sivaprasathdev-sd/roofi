import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";

import { PageHeader, SectionCard } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSession } from "@/context/session-context";
import { api } from "@/services/api";
import { clusters as mockClusters, states as mockStates } from "@/data/mock-data";

export function CreateUserPage() {
  const navigate = useNavigate();
  const { user: currentUser } = useSession();
  const isStateAdmin = currentUser?.role === "state";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("roofi@2026");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<string>(isStateAdmin ? "cluster" : "ho");
  const [stateId, setStateId] = useState<string>(
    isStateAdmin && currentUser?.stateId ? currentUser.stateId : "TN",
  );
  const [clusterId, setClusterId] = useState<string>("CL-001");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Dynamic dropdown lists fetched from MongoDB
  const [rolesList, setRolesList] = useState<any[]>([
    { id: "R-001", name: "HO Admin", code: "ho" },
    { id: "R-002", name: "State HO / Admin", code: "state" },
    { id: "R-003", name: "Cluster Manager", code: "cluster" },
  ]);
  const [statesList, setStatesList] = useState<any[]>(mockStates);
  const [clustersList, setClustersList] = useState<any[]>(mockClusters);

  useEffect(() => {
    async function fetchSetupData() {
      try {
        const [rRes, sRes, cRes] = await Promise.all([
          api.getRoles().catch(() => []),
          api.getStates().catch(() => []),
          api.getClusters().catch(() => []),
        ]);

        if (rRes && rRes.length > 0) setRolesList(rRes);

        let targetStateId = isStateAdmin && currentUser?.stateId ? currentUser.stateId : "TN";
        if (sRes && sRes.length > 0) {
          setStatesList(sRes);
          if (isStateAdmin && currentUser?.stateId) {
            targetStateId = currentUser.stateId;
          } else {
            targetStateId = sRes[0].id;
          }
          setStateId(targetStateId);
        }

        const effectiveClusters = cRes && cRes.length > 0 ? cRes : mockClusters;
        if (cRes && cRes.length > 0) {
          setClustersList(cRes);
        }

        const matching = effectiveClusters.filter((c: any) => c.stateId === targetStateId);
        if (matching.length > 0) {
          setClusterId(matching[0].id);
        }
      } catch (e) {
        console.warn("Using fallback static setup data");
      }
    }
    fetchSetupData();
  }, [isStateAdmin, currentUser?.stateId]);

  // Filter out HO Admin for State Admin
  const displayedRoles = isStateAdmin
    ? rolesList.filter(
        (r) =>
          r.code !== "ho" &&
          r.code?.toLowerCase() !== "ho" &&
          r.name !== "HO Admin" &&
          !r.name?.toLowerCase().includes("ho admin"),
      )
    : rolesList;

  const filteredClusters = clustersList.filter((c) => c.stateId === stateId);

  // Update cluster selection when state changes
  const handleStateChange = (newStatId: string) => {
    setStateId(newStatId);
    const matching = clustersList.filter((c) => c.stateId === newStatId);
    if (matching.length > 0) {
      setClusterId(matching[0].id);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim() || !phone.trim() || !role) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    try {
      const payload: {
        name: string;
        email: string;
        password: string;
        phone: string;
        role: string;
        stateId?: string;
        clusterId?: string;
      } = {
        name: name.trim(),
        email: email.trim(),
        password: password.trim(),
        phone: phone.trim(),
        role,
        stateId,
        clusterId,
      };

      const res = await api.createUser(payload);

      toast.success(res.message || `User ${name} created successfully in MongoDB!`);
      navigate("/users");
    } catch (err: any) {
      toast.error(err.message || "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link to="/users" className="flex items-center gap-1 hover:text-primary">
          <ArrowLeft className="size-3" /> Back to Users Directory
        </Link>
      </div>

      <PageHeader
        title="Create New System User"
        description="Onboard a new team member with dynamic Role, State, and Cluster fetched from MongoDB collections."
      />

      <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
        <SectionCard title="User Personal & Contact Information">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                placeholder="e.g. Ramesh Kumar"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                placeholder="e.g. ramesh@roofi.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password *</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pr-10 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                placeholder="e.g. +91 98400 12345"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
          </div>
        </SectionCard>

        <SectionCard title="System Access & Role Jurisdiction (Fetched from MongoDB)">
          <div className="grid gap-4 sm:grid-cols-3">
            {/* Role Field */}
            <div className="space-y-1.5">
              <Label>System Role *</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger className="bg-card">
                  <SelectValue placeholder="Select Role..." />
                </SelectTrigger>
                <SelectContent>
                  {displayedRoles.map((r) => (
                    <SelectItem key={r.id || r.code || r.name} value={r.code || r.name}>
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* State Field (Fetched from MongoDB) */}
            <div className="space-y-1.5">
              <Label>Assigned State *</Label>
              <Select value={stateId} onValueChange={handleStateChange} disabled={isStateAdmin}>
                <SelectTrigger className="bg-card">
                  <SelectValue placeholder="Select State..." />
                </SelectTrigger>
                <SelectContent>
                  {statesList.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name} ({s.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Cluster Field (Fetched & Filtered from MongoDB) */}
            <div className="space-y-1.5">
              <Label>Assigned Cluster *</Label>
              <Select value={clusterId} onValueChange={setClusterId}>
                <SelectTrigger className="bg-card">
                  <SelectValue placeholder="Select Cluster..." />
                </SelectTrigger>
                <SelectContent>
                  {filteredClusters.length === 0 ? (
                    <SelectItem value="none" disabled>
                      No clusters found for selected state
                    </SelectItem>
                  ) : (
                    filteredClusters.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name} ({c.company || c.code})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        </SectionCard>

        <div className="flex justify-end gap-3">
          <Link to="/users">
            <Button variant="outline" type="button">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={loading} className="cursor-pointer">
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <UserPlus className="size-4" />
            )}
            {loading ? "Saving to MongoDB…" : "Save User to MongoDB"}
          </Button>
        </div>
      </form>
    </div>
  );
}
