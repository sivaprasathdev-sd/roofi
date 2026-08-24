import { useState } from "react";
import { toast } from "sonner";
import { Building2, MapPin, TrendingUp } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useScope } from "@/context/session-context";
import { useLeads } from "@/context/leads-context";
import { stateName } from "@/data/mock-data";
import type { Lead } from "@/types";
import { cn } from "@/lib/utils";

export function AssignLeadDialog({
  lead,
  onOpenChange,
}: {
  lead: Lead | null;
  onOpenChange: (open: boolean) => void;
}) {
  const { visibleClusters, role, stateId } = useScope();
  const { leads, assignLead } = useLeads();

  const [selected, setSelected] = useState<string | null>(null);
  const [note, setNote] = useState("");

  const options = lead
    ? visibleClusters.filter((c) => (role === "ho" ? true : c.stateId === lead.stateId))
    : [];

  const handleAssign = async () => {
    if (!lead || !selected) return;

    const c = options.find((o) => o.id === selected);
    const assignedBy =
      role === "ho"
        ? "HO Admin"
        : role === "state"
          ? `${stateName(stateId || "")} State Admin`
          : "Cluster Admin";

    try {
      await assignLead(lead.id, selected, note, assignedBy);
      toast.success(`${lead.id} assigned to ${c?.name}`);
      onOpenChange(false);
      setSelected(null);
      setNote("");
    } catch (e) {
      console.error(e);
      toast.error("Failed to assign lead");
    }
  };

  return (
    <Dialog open={!!lead} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Assign lead {lead?.id}</DialogTitle>
          <DialogDescription>
            {lead?.customerName} · {stateName(lead?.stateId ?? "")} — select the receiving cluster.
            Clusters are the final destination and cannot forward leads further.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-2 sm:grid-cols-2">
          {options.map((c) => {
            const active = leads.filter(
              (l) => l.clusterId === c.id && l.status !== "Converted",
            ).length;
            const conv = leads.filter(
              (l) => l.clusterId === c.id && l.status === "Converted",
            ).length;
            const total = leads.filter((l) => l.clusterId === c.id).length || 1;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelected(c.id)}
                className={cn(
                  "rounded-lg border p-3 text-left transition-colors cursor-pointer",
                  selected === c.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:bg-accent",
                )}
              >
                <div className="flex items-center gap-2">
                  <Building2 className="size-4 text-primary" />
                  <span className="text-sm font-semibold">{c.name}</span>
                </div>
                <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="size-3" /> {stateName(c.stateId)} · {c.code}
                </p>
                <p className="mt-2 flex items-center gap-3 text-xs">
                  <span className="text-muted-foreground">Active leads: {active}</span>
                  <span className="flex items-center gap-1 text-primary">
                    <TrendingUp className="size-3" /> {Math.round((conv / total) * 100)}%
                  </span>
                </p>
              </button>
            );
          })}
        </div>

        <Textarea
          rows={2}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Assignment note for the cluster (optional)"
        />

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={!selected} onClick={handleAssign}>
            Assign Lead
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
