import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import type { LeadSource, LeadStatus } from "@/types";

const products = [
  "ROOFI Classic Tile",
  "ROOFI Shingle Tile",
  "ROOFI Bond Tile",
  "ROOFI Milano Tile",
  "ROOFI Shake Tile",
];

function Field({
  label,
  children,
  required,
}: {
  label: string;
  children: ReactNode;
  required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      {children}
    </div>
  );
}

export function AddLeadDialog({ trigger }: { trigger: ReactNode }) {
  const { role, visibleClusters, visibleStates, clusterId, stateId } = useScope();
  const { leads, addLead } = useLeads();

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [altPhone, setAltPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [district, setDistrict] = useState("");
  const [city, setCity] = useState("");
  const [selectedState, setSelectedState] = useState(stateId || "TN");
  const [pincode, setPincode] = useState("");
  const [source, setSource] = useState<LeadSource>(role === "cluster" ? "Manual" : "Meta");
  const [campaign, setCampaign] = useState("Monsoon Roofing 2026");
  const [product, setProduct] = useState(products[0]!);
  const [quantity, setQuantity] = useState("1200");
  const [estValue, setEstValue] = useState("850000");
  const [priority, setPriority] = useState<"High" | "Medium" | "Low">("Medium");
  const [status, setStatus] = useState<LeadStatus>("New");
  const [targetCluster, setTargetCluster] = useState<string>(
    role === "cluster" && clusterId ? clusterId : "",
  );
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  const cleanPhoneInput = phone.replace(/\D/g, "");
  const isDuplicatePhone = Boolean(
    cleanPhoneInput &&
      leads.some((l) => {
        const cleanExisting = (l.phone || "").replace(/\D/g, "");
        return cleanExisting && cleanExisting === cleanPhoneInput;
      }),
  );

  const resetForm = () => {
    setName("");
    setPhone("");
    setAltPhone("");
    setEmail("");
    setAddress("");
    setDistrict("");
    setCity("");
    setPincode("");
    setNotes("");
    setError(null);
  };

  const save = async (assign: boolean) => {
    if (!name.trim() || phone.trim().length < 10) {
      setError("Customer name and a valid 10-digit mobile number are required.");
      return;
    }
    if (isDuplicatePhone) {
      setError("Already this number is existing.");
      toast.error("Already this number is existing.");
      return;
    }
    setError(null);

    const finalCluster = assign
      ? targetCluster || visibleClusters[0]?.id
      : role === "cluster"
        ? clusterId
        : targetCluster;

    const assignedBy =
      role === "ho"
        ? "HO Admin"
        : role === "state"
          ? `${stateName(stateId || "TN")} State Admin`
          : clusterName(clusterId);

    try {
      await addLead({
        customerName: name.trim(),
        phone: phone.trim(),
        altPhone: altPhone.trim(),
        email: email.trim(),
        address: address.trim(),
        city: city.trim() || "Coimbatore",
        district: district.trim() || city.trim() || "Coimbatore",
        stateId: selectedState,
        pincode: pincode.trim(),
        source,
        campaign,
        product,
        quantity: Number(quantity) || 1000,
        estValue: Number(estValue) || 500000,
        priority,
        status: finalCluster ? "Assigned" : status,
        clusterId: finalCluster || undefined,
        assignedBy: finalCluster ? assignedBy : "—",
        notes,
      });

      toast.success(
        finalCluster
          ? `Lead saved and assigned to ${clusterName(finalCluster)}`
          : "Lead saved as unassigned",
      );

      resetForm();
      setOpen(false);
    } catch (err: any) {
      console.error(err);
      const errMsg = err?.message || "Failed to save lead. Please try again.";
      setError(errMsg);
      toast.error(errMsg);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Add New Lead</DialogTitle>
          <DialogDescription>
            Capture customer details, lead source and follow-up plan.
            {role === "cluster" && " This lead is automatically assigned to your cluster."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <section>
            <h3 className="mb-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Customer Information
            </h3>
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="Customer Name" required>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ramesh Krishnan"
                />
              </Field>
              <Field label="Mobile Number" required>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98400 12345"
                  className={isDuplicatePhone ? "border-destructive focus-visible:ring-destructive" : ""}
                />
                {isDuplicatePhone && (
                  <p className="text-[11px] font-semibold text-destructive mt-1">
                    Already this number is existing.
                  </p>
                )}
              </Field>
              <Field label="Alternate Mobile">
                <Input
                  value={altPhone}
                  onChange={(e) => setAltPhone(e.target.value)}
                  placeholder="Optional"
                />
              </Field>
              <Field label="Email">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="customer@email.com"
                />
              </Field>
              <Field label="Address">
                <Input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Door no, street"
                />
              </Field>
              <Field label="District">
                <Input
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="District"
                />
              </Field>
              <Field label="City">
                <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" />
              </Field>
              <Field label="State">
                <Select value={selectedState} onValueChange={setSelectedState}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {visibleStates.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Pincode">
                <Input
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="641001"
                />
              </Field>
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Lead Information
            </h3>
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="Lead Source" required>
                <Select value={source} onValueChange={(val: LeadSource) => setSource(val)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Meta", "Facebook", "Instagram", "Manual"].map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Source Campaign">
                <Input
                  value={campaign}
                  onChange={(e) => setCampaign(e.target.value)}
                  placeholder="Monsoon Roofing 2026"
                />
              </Field>
              <Field label="Product Interest">
                <Select value={product} onValueChange={setProduct}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Estimated Quantity">
                <Input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="1200"
                />
              </Field>
              <Field label="Estimated Value">
                <Input
                  type="number"
                  value={estValue}
                  onChange={(e) => setEstValue(e.target.value)}
                  placeholder="850000"
                />
              </Field>
              <Field label="Priority">
                <Select
                  value={priority}
                  onValueChange={(val: "High" | "Medium" | "Low") => setPriority(val)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["High", "Medium", "Low"].map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Lead Status">
                <Select value={status} onValueChange={(val: LeadStatus) => setStatus(val)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["New", "Assigned", "Contacted", "Qualified", "Follow-up"].map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Assignment
            </h3>
            {role === "cluster" ? (
              <p className="rounded-lg border border-primary/25 bg-primary/5 px-3 py-2 text-sm text-primary">
                Auto-assigned to {clusterName(clusterId)} — clusters cannot assign leads to other
                clusters.
              </p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Target Cluster">
                  <Select value={targetCluster} onValueChange={setTargetCluster}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select cluster (Optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {visibleClusters.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name} · {stateName(c.stateId)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>
            )}
          </section>

          <section>
            <h3 className="mb-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Notes &amp; Details
            </h3>
            <div>
              <Field label="Notes">
                <Textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Site details, roof area, colour preference…"
                />
              </Field>
            </div>
          </section>

          {error && (
            <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {error}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant="outline" onClick={() => save(false)}>
            Save Lead
          </Button>
          {role !== "cluster" && <Button onClick={() => save(true)}>Save &amp; Assign</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
