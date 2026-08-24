import { Link, useNavigate, useParams } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import {
  ArrowLeft,
  CalendarPlus,
  CheckCircle2,
  FileText,
  History,
  Pencil,
  PhoneCall,
  RefreshCcw,
  Share2,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader, SectionCard } from "@/components/layout/page-header";
import { PriorityBadge, SourceBadge, StatusBadge } from "@/components/common/badges";
import { AssignLeadDialog } from "@/components/dialogs/assign-lead-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  invoices,
  proformas,
  quotations,
  stateName,
  states,
} from "@/data/mock-data";
import { fmtDate, inr, num } from "@/lib/format";
import { useScope, roleLabel } from "@/context/session-context";
import { useLeads } from "@/context/leads-context";
import { api } from "@/services/api";

import type { LeadStatus, Priority, Role } from "@/types";

export function LeadDetailPage() {
  const { leadId } = useParams<{ leadId: string }>();
  const navigate = useNavigate();
  const { role, canAssign, user } = useScope();
  const { leads, updateLeadStatus, updateLeadDetails } = useLeads();

  const lead = leads.find((l) => l.id === leadId);

  const [status, setStatus] = useState<LeadStatus>("New");
  const [note, setNote] = useState("");
  const [showAssign, setShowAssign] = useState(false);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [nextFollowUp, setNextFollowUp] = useState("");

  // Edit Lead Details Modal State
  const [editOpen, setEditOpen] = useState(false);
  const [editCustomerName, setEditCustomerName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editAltPhone, setEditAltPhone] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editDistrict, setEditDistrict] = useState("");
  const [editCity, setEditCity] = useState("");
  const [editStateId, setEditStateId] = useState("TN");
  const [editPincode, setEditPincode] = useState("");
  const [editProduct, setEditProduct] = useState("");
  const [editPriority, setEditPriority] = useState<Priority>("Medium");
  const [editQuantity, setEditQuantity] = useState(1000);
  const [editEstValue, setEditEstValue] = useState(100000);
  const [savingDetails, setSavingDetails] = useState(false);

  const fetchLogs = useCallback(async () => {
    if (!leadId) return;
    try {
      const logs = await api.getLeadLogs(leadId).catch(() => []);
      setActivityLogs(logs);
    } catch (e) {
      console.warn("Could not fetch lead logs", e);
    }
  }, [leadId]);

  useEffect(() => {
    if (lead) {
      setStatus(lead.status);
      setNextFollowUp(lead.nextFollowUp || "");
      setEditCustomerName(lead.customerName || "");
      setEditPhone(lead.phone || "");
      setEditAltPhone(lead.altPhone || "");
      setEditEmail(lead.email || "");
      setEditAddress(lead.address || "");
      setEditDistrict(lead.district || "");
      setEditCity(lead.city || "");
      setEditStateId(lead.stateId || "TN");
      setEditPincode(lead.pincode || "");
      setEditProduct(lead.product || "ROOFI Classic Tile");
      setEditPriority(lead.priority || "Medium");
      setEditQuantity(lead.quantity || 1000);
      setEditEstValue(lead.estValue || 100000);
      fetchLogs();
    }
  }, [lead, fetchLogs]);

  if (!lead) {
    return (
      <div className="space-y-4 text-center py-12">
        <h2 className="text-xl font-bold">Lead Not Found</h2>
        <p className="text-sm text-muted-foreground">The lead ID {leadId} does not exist.</p>
        <Link to="/leads">
          <Button variant="outline">Back to Leads</Button>
        </Link>
      </div>
    );
  }

  const leadQuotations = quotations.filter((q) => q.leadId === lead.id);
  const leadProformas = proformas.filter((p) => leadQuotations.some((q) => q.id === p.quotationId));
  const leadInvoices = invoices.filter((i) => leadProformas.some((p) => p.id === i.proformaId));

  const handleSaveFollowUp = async () => {
    try {
      await updateLeadStatus(lead.id, status, note, user?.name || "System User", nextFollowUp);
      if (status === "Converted") {
        toast.success("Lead converted to Customer successfully! Registered on Customers page.");
      } else {
        toast.success("Call activity and status updated successfully.");
      }
      setNote("");
      fetchLogs();
    } catch (e) {
      console.error(e);
      toast.error("Failed to update lead status");
    }
  };

  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCustomerName.trim() || !editPhone.trim()) {
      toast.error("Customer Name and Mobile Number are required.");
      return;
    }

    setSavingDetails(true);
    try {
      await updateLeadDetails(
        lead.id,
        {
          customerName: editCustomerName.trim(),
          phone: editPhone.trim(),
          altPhone: editAltPhone.trim(),
          email: editEmail.trim(),
          address: editAddress.trim(),
          district: editDistrict.trim(),
          city: editCity.trim(),
          stateId: editStateId,
          pincode: editPincode.trim(),
          product: editProduct,
          priority: editPriority,
          quantity: Number(editQuantity) || 0,
          estValue: Number(editEstValue) || 0,
        },
        user?.name || "System User",
      );

      toast.success("Lead details updated successfully!");
      setEditOpen(false);
      fetchLogs();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Failed to update lead details");
    } finally {
      setSavingDetails(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link to="/leads" className="flex items-center gap-1 hover:text-primary">
          <ArrowLeft className="size-3" /> Back to Leads
        </Link>
      </div>

      <PageHeader
        title={`${lead.id} — ${lead.customerName}`}
        description={`${lead.city}, ${stateName(lead.stateId)} · Source: ${lead.source}`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {lead.status === "Converted" && (
              <Badge className="bg-emerald-600 text-white flex items-center gap-1 px-3 py-1.5 text-xs font-semibold">
                <UserCheck className="size-4" /> Converted Customer
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditOpen(true)}
              className="cursor-pointer"
            >
              <Pencil className="size-4" /> Edit Details
            </Button>
            {canAssign && (
              <Button variant="outline" size="sm" onClick={() => setShowAssign(true)}>
                <Share2 className="size-4" /> Reassign Cluster
              </Button>
            )}
            <Link to="/quotations/new">
              <Button size="sm">
                <FileText className="size-4" /> Create Quotation
              </Button>
            </Link>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <SectionCard
            title="Lead Overview"
            action={
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditOpen(true)}
                className="h-7 text-xs gap-1.5 cursor-pointer text-primary hover:text-primary hover:bg-primary/10"
              >
                <Pencil className="size-3.5" /> Edit Details
              </Button>
            }
          >
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-xs text-muted-foreground">Current Status</p>
                <div className="mt-1">
                  <StatusBadge status={lead.status} />
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Lead Source</p>
                <div className="mt-1">
                  <SourceBadge source={lead.source} />
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Priority</p>
                <div className="mt-1">
                  <PriorityBadge priority={lead.priority} />
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Product Interest</p>
                <p className="mt-1 text-sm font-semibold">{lead.product}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Est. Quantity</p>
                <p className="mt-1 text-sm font-semibold">{num(lead.quantity)} Nos</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Est. Deal Value</p>
                <p className="mt-1 text-sm font-semibold text-primary">{inr(lead.estValue)}</p>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Lead Call & Status Update (Telecaller / Cluster)">
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">
                    Update Lead Status
                  </label>
                  <Select value={status} onValueChange={(v) => setStatus(v as LeadStatus)}>
                    <SelectTrigger className="mt-1 bg-card">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        "New",
                        "Assigned",
                        "Contacted",
                        "Qualified",
                        "Follow-up",
                        "Quotation",
                        "Proforma Invoice",
                        "Converted",
                        "Lost",
                      ].map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">
                    Next Follow-up Date
                  </label>
                  <input
                    type="date"
                    className="mt-1 flex h-9 w-full rounded-md border border-input bg-card px-3 py-1 text-sm shadow-sm"
                    value={nextFollowUp}
                    onChange={(e) => setNextFollowUp(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  Call & Discussion Notes
                </label>
                <Textarea
                  rows={3}
                  className="mt-1"
                  placeholder="Record telecaller call discussion, site visit notes, or customer preference..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>

              <div className="flex justify-between items-center gap-2 pt-1">
                <span className="text-xs text-muted-foreground">
                  {status === "Converted"
                    ? "⚡ Converting lead will add customer to Customer Registry"
                    : ""}
                </span>
                <Button size="sm" onClick={handleSaveFollowUp}>
                  <PhoneCall className="size-4" /> Save Call &amp; Update Status
                </Button>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Complete Activity Timeline & History Logs (Audit Trail)">
            <div className="space-y-4">
              <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                {lead.timeline.map((t, idx) => (
                  <div key={idx} className="relative">
                    <span className="absolute -left-6 top-1 grid size-4 place-items-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                      ✓
                    </span>
                    <p className="text-xs font-semibold text-foreground">{t.label}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {fmtDate(t.at)} by <span className="font-medium">{t.by}</span>
                    </p>
                    {t.note && (
                      <p className="mt-1 rounded bg-muted/50 p-2 text-xs text-muted-foreground">
                        {t.note}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {activityLogs.length > 0 && (
                <div className="mt-6 border-t pt-4">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-3 flex items-center gap-1.5">
                    <History className="size-3.5 text-primary" /> Full Audit Logs History (
                    {activityLogs.length})
                  </h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {activityLogs.map((log) => (
                      <div
                        key={log._id || log.id}
                        className="rounded-lg border p-2.5 bg-muted/20 text-xs"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-primary">{log.action}</span>
                          <span className="text-[10px] text-muted-foreground">{log.at}</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          By <span className="font-medium text-foreground">{log.user}</span> (
                          {roleLabel[log.role as Role] || log.role})
                        </p>
                        {log.description && (
                          <p className="text-xs text-foreground mt-1 bg-background/50 p-1.5 rounded border border-border/50">
                            {log.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </SectionCard>
        </div>

        <div className="space-y-6">
          <SectionCard
            title="Customer Contact Details"
            action={
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditOpen(true)}
                className="h-7 text-xs gap-1.5 cursor-pointer text-primary hover:text-primary hover:bg-primary/10"
              >
                <Pencil className="size-3.5" /> Edit Details
              </Button>
            }
          >
            <div className="space-y-3 text-xs">
              <div>
                <p className="text-muted-foreground">Customer Name</p>
                <p className="font-semibold text-sm text-foreground">{lead.customerName}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Mobile Number</p>
                <p className="font-medium text-foreground">{lead.phone}</p>
                {lead.altPhone && (
                  <p className="text-[11px] text-muted-foreground">Alt: {lead.altPhone}</p>
                )}
              </div>
              <div>
                <p className="text-muted-foreground">Email Address</p>
                <p className="font-medium text-foreground">{lead.email || "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Site Address</p>
                <p className="font-medium text-foreground">
                  {lead.address || "—"}
                  {lead.district ? `, ${lead.district}` : ""}
                  {lead.city ? `, ${lead.city}` : ""}, {stateName(lead.stateId)} -{" "}
                  {lead.pincode || "—"}
                </p>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Assignment Information">
            <div className="space-y-3 text-xs">
              <div>
                <p className="text-muted-foreground">Assigned Cluster</p>
                <p className="font-semibold text-sm text-foreground">
                  {clusterName(lead.clusterId)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Assigned By</p>
                <p className="font-medium text-foreground">{lead.assignedBy}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Assigned Date</p>
                <p className="font-medium text-foreground">{fmtDate(lead.assignedDate)}</p>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Linked Documents">
            <div className="space-y-2 text-xs">
              {leadQuotations.length === 0 ? (
                <p className="text-muted-foreground py-2 text-center">
                  No quotations generated yet.
                </p>
              ) : (
                leadQuotations.map((q) => (
                  <Link
                    key={q.id}
                    to={`/quotations/${q.id}`}
                    className="flex items-center justify-between rounded border border-border p-2 hover:bg-accent"
                  >
                    <span className="font-semibold text-primary">{q.id}</span>
                    <span className="text-muted-foreground">{q.status}</span>
                  </Link>
                ))
              )}
            </div>
          </SectionCard>
        </div>
      </div>

      <AssignLeadDialog
        lead={showAssign ? lead : null}
        onOpenChange={(open) => setShowAssign(open)}
      />

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Lead Details — {lead.id}</DialogTitle>
            <DialogDescription>
              Update customer contact information, site location, and lead requirement details.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveDetails} className="space-y-4 py-2">
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Customer Contact Details
              </h4>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label className="text-xs">
                    Customer Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    value={editCustomerName}
                    onChange={(e) => setEditCustomerName(e.target.value)}
                    placeholder="Ramesh Krishnan"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">
                    Mobile Number <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="+91 98400 12345"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Alternate Mobile</Label>
                  <Input
                    value={editAltPhone}
                    onChange={(e) => setEditAltPhone(e.target.value)}
                    placeholder="Optional"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Email</Label>
                  <Input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    placeholder="customer@email.com"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Site & Location Details
              </h4>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1 sm:col-span-2">
                  <Label className="text-xs">Address</Label>
                  <Input
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    placeholder="Door no, street"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">District</Label>
                  <Input
                    value={editDistrict}
                    onChange={(e) => setEditDistrict(e.target.value)}
                    placeholder="District"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">City</Label>
                  <Input
                    value={editCity}
                    onChange={(e) => setEditCity(e.target.value)}
                    placeholder="City"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">State</Label>
                  <Select value={editStateId} onValueChange={setEditStateId}>
                    <SelectTrigger className="bg-card">
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {states.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Pincode</Label>
                  <Input
                    value={editPincode}
                    onChange={(e) => setEditPincode(e.target.value)}
                    placeholder="641001"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Lead Requirements & Deal Estimation
              </h4>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label className="text-xs">Product Interest</Label>
                  <Select value={editProduct} onValueChange={setEditProduct}>
                    <SelectTrigger className="bg-card">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        "ROOFI Classic Tile",
                        "ROOFI Shingle Tile",
                        "ROOFI Bond Tile",
                        "ROOFI Milano Tile",
                        "ROOFI Shake Tile",
                      ].map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Priority</Label>
                  <Select
                    value={editPriority}
                    onValueChange={(v) => setEditPriority(v as Priority)}
                  >
                    <SelectTrigger className="bg-card">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Est. Quantity (Nos)</Label>
                  <Input
                    type="number"
                    value={editQuantity}
                    onChange={(e) => setEditQuantity(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Est. Deal Value (₹)</Label>
                  <Input
                    type="number"
                    value={editEstValue}
                    onChange={(e) => setEditEstValue(Number(e.target.value))}
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={savingDetails}>
                {savingDetails ? "Saving..." : "Save Lead Details"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
