import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Lead, LeadSource, LeadStatus } from "@/types";
import { api } from "@/services/api";
import { clusterName } from "@/data/mock-data";

interface LeadsContextValue {
  leads: Lead[];
  loading: boolean;
  addLead: (data: Partial<Lead> & { customerName: string; phone: string }) => Promise<Lead>;
  assignLead: (
    leadId: string,
    clusterId: string,
    note?: string,
    assignedBy?: string,
  ) => Promise<Lead>;
  bulkAssignLeads: (leadIds: string[], clusterId: string, assignedBy?: string) => Promise<void>;
  updateLeadStatus: (
    leadId: string,
    newStatus: LeadStatus,
    note?: string,
    updatedBy?: string,
    nextFollowUp?: string,
  ) => Promise<Lead>;
  updateLeadDetails: (
    leadId: string,
    details: Partial<Lead>,
    updatedBy?: string,
  ) => Promise<Lead>;
  refreshLeads: () => Promise<void>;
}

const LeadsContext = createContext<LeadsContextValue | null>(null);

export function LeadsProvider({ children }: { children: ReactNode }) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const data = await api.getLeads();
      if (Array.isArray(data)) {
        setLeads(data);
      }
    } catch (err) {
      console.warn("Could not fetch leads from backend API, using local state.", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const addLead = async (
    data: Partial<Lead> & { customerName: string; phone: string },
  ): Promise<Lead> => {
    const cleanPhoneInput = data.phone.replace(/\D/g, "");
    const duplicate = leads.find((l) => {
      const cleanExisting = (l.phone || "").replace(/\D/g, "");
      return cleanExisting && cleanPhoneInput && cleanExisting === cleanPhoneInput;
    });

    if (duplicate) {
      throw new Error("Already this number is existing.");
    }

    const today = new Date().toISOString().slice(0, 10);
    const maxNum = leads.reduce((max, l) => {
      const match = l.id?.match(/LD-(\d+)/);
      if (match) {
        const val = parseInt(match[1]!, 10);
        return val > max ? val : max;
      }
      return max;
    }, 1000);

    const newId = data.id || `LD-${maxNum + 1}`;
    const assignedBy = data.assignedBy || (data.clusterId ? "Admin" : "—");
    const timeline: Lead["timeline"] = [
      {
        label: "Lead Created",
        at: today,
        by: data.source || "Manual",
      },
    ];

    if (data.clusterId) {
      timeline.push({
        label: `Assigned to ${clusterName(data.clusterId)}`,
        at: today,
        by: assignedBy,
      });
    }

    const newLead: Lead = {
      id: newId,
      customerName: data.customerName,
      phone: data.phone,
      altPhone: data.altPhone || "",
      email: data.email || "",
      address: data.address || "",
      city: data.city || "",
      district: data.district || data.city || "",
      pincode: data.pincode || "",
      stateId: data.stateId || "TN",
      clusterId: data.clusterId,
      source: data.source || "Manual",
      campaign: data.campaign || "Direct Walk-in",
      status: data.status || (data.clusterId ? "Assigned" : "New"),
      priority: data.priority || "Medium",
      product: data.product || "ROOFI Classic Tile",
      quantity: Number(data.quantity) || 1000,
      estValue: Number(data.estValue) || 100000,
      assignedBy,
      assignedDate: data.clusterId ? today : undefined,
      lastContact: undefined,
      nextFollowUp: data.nextFollowUp,
      createdDate: data.createdDate || today,
      notes: data.notes || "",
      timeline,
    };

    // 1. Synchronous optimistic state update — UI reflects change instantly!
    setLeads((prev) => [newLead, ...prev.filter((l) => l.id !== newLead.id)]);

    // 2. Async API background sync
    try {
      const saved = await api.createLead(newLead);
      if (saved && saved.id) {
        setLeads((prev) => prev.map((l) => (l.id === newLead.id ? saved : l)));
      }
    } catch (e: any) {
      console.warn("API createLead failed", e);
      if (e?.message && e.message.includes("Already this number is existing")) {
        setLeads((prev) => prev.filter((l) => l.id !== newLead.id));
        throw e;
      }
    }

    return newLead;
  };

  const assignLead = async (
    leadId: string,
    clusterId: string,
    note?: string,
    assignedBy?: string,
  ): Promise<Lead> => {
    const today = new Date().toISOString().slice(0, 10);
    const targetClusterName = clusterName(clusterId);
    const byUser = assignedBy || "HO Admin";

    let updatedLeadObj: Lead | null = null;

    setLeads((prev) =>
      prev.map((l) => {
        if (l.id !== leadId) return l;

        const newTimeline = [...l.timeline];
        newTimeline.push({
          label: `Assigned to ${targetClusterName}`,
          at: today,
          by: byUser,
          note: note || undefined,
        });

        const updated: Lead = {
          ...l,
          clusterId,
          status: l.status === "New" ? "Assigned" : l.status,
          assignedBy: byUser,
          assignedDate: today,
          timeline: newTimeline,
        };

        updatedLeadObj = updated;
        return updated;
      }),
    );

    if (updatedLeadObj) {
      try {
        await api.updateLead(leadId, updatedLeadObj);
      } catch (e) {
        console.warn("API updateLead failed", e);
      }
    }

    return updatedLeadObj!;
  };

  const bulkAssignLeads = async (
    leadIds: string[],
    clusterId: string,
    assignedBy?: string,
  ): Promise<void> => {
    const today = new Date().toISOString().slice(0, 10);
    const targetClusterName = clusterName(clusterId);
    const byUser = assignedBy || "HO Admin";

    setLeads((prev) =>
      prev.map((l) => {
        if (!leadIds.includes(l.id)) return l;

        const newTimeline = [...l.timeline];
        newTimeline.push({
          label: `Assigned to ${targetClusterName}`,
          at: today,
          by: byUser,
        });

        const updated: Lead = {
          ...l,
          clusterId,
          status: l.status === "New" ? "Assigned" : l.status,
          assignedBy: byUser,
          assignedDate: today,
          timeline: newTimeline,
        };

        api.updateLead(l.id, updated).catch((e) => console.warn("Bulk update lead error", e));

        return updated;
      }),
    );
  };

  const updateLeadStatus = async (
    leadId: string,
    newStatus: LeadStatus,
    note?: string,
    updatedBy?: string,
    nextFollowUp?: string,
  ): Promise<Lead> => {
    const today = new Date().toISOString().slice(0, 10);
    const byUser = updatedBy || "System User";
    let updatedLeadObj: Lead | null = null;

    setLeads((prev) =>
      prev.map((l) => {
        if (l.id !== leadId) return l;

        const newTimeline = [...l.timeline];
        newTimeline.push({
          label: `Status updated to ${newStatus}`,
          at: today,
          by: byUser,
          note: note || undefined,
        });

        const updated: Lead = {
          ...l,
          status: newStatus,
          lastContact: today,
          nextFollowUp: nextFollowUp !== undefined ? nextFollowUp : l.nextFollowUp,
          timeline: newTimeline,
        };

        updatedLeadObj = updated;
        return updated;
      }),
    );

    if (updatedLeadObj) {
      try {
        await api.updateLead(leadId, updatedLeadObj);
      } catch (e) {
        console.warn("API updateLead failed", e);
      }
    }

    return updatedLeadObj!;
  };

  const updateLeadDetails = async (
    leadId: string,
    details: Partial<Lead>,
    updatedBy?: string,
  ): Promise<Lead> => {
    const today = new Date().toISOString().slice(0, 10);
    const byUser = updatedBy || "System User";
    let updatedLeadObj: Lead | null = null;

    setLeads((prev) =>
      prev.map((l) => {
        if (l.id !== leadId) return l;

        const newTimeline = [...l.timeline];
        newTimeline.push({
          label: "Lead Details Updated",
          at: today,
          by: byUser,
          note: "Customer contact details & site location updated.",
        });

        const updated: Lead = {
          ...l,
          ...details,
          timeline: newTimeline,
        };

        updatedLeadObj = updated;
        return updated;
      }),
    );

    if (updatedLeadObj) {
      try {
        await api.updateLead(leadId, updatedLeadObj);
      } catch (e) {
        console.warn("API updateLead failed", e);
      }
    }

    return updatedLeadObj!;
  };

  return (
    <LeadsContext.Provider
      value={{
        leads,
        loading,
        addLead,
        assignLead,
        bulkAssignLeads,
        updateLeadStatus,
        updateLeadDetails,
        refreshLeads: fetchLeads,
      }}
    >
      {children}
    </LeadsContext.Provider>
  );
}

export function useLeads() {
  const ctx = useContext(LeadsContext);
  if (!ctx) {
    throw new Error("useLeads must be used within a LeadsProvider");
  }
  return ctx;
}
