export type Role = "ho" | "state" | "cluster";

export type LeadSource = "Meta" | "Facebook" | "Instagram" | "Manual";

export type LeadStatus =
  | "New"
  | "Assigned"
  | "Contacted"
  | "Qualified"
  | "Follow-up"
  | "Quotation"
  | "Proforma Invoice"
  | "Converted"
  | "Lost";

export type Priority = "High" | "Medium" | "Low";

export interface StateRec {
  id: string;
  name: string;
  code: string;
}

export interface Cluster {
  id: string;
  name: string;
  code: string;
  stateId: string;
  company: string;
  address: string;
  gst: string;
  phone: string;
  email: string;
  manager: string;
}

export interface UserRec {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  stateId?: string | undefined;
  clusterId?: string | undefined;
  status: "Active" | "Inactive";
  lastLogin: string;
}

export interface TimelineEntry {
  label: string;
  at: string;
  by: string;
  note?: string | undefined;
}

export interface Lead {
  id: string;
  customerName: string;
  phone: string;
  altPhone?: string | undefined;
  email: string;
  address: string;
  city: string;
  district: string;
  pincode: string;
  stateId: string;
  clusterId?: string | undefined;
  source: LeadSource;
  campaign: string;
  status: LeadStatus;
  priority: Priority;
  product: string;
  quantity: number;
  estValue: number;
  assignedBy: string;
  assignedDate?: string | undefined;
  lastContact?: string | undefined;
  nextFollowUp?: string | undefined;
  createdDate: string;
  notes: string;
  timeline: TimelineEntry[];
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  location: string;
  address: string;
  stateId: string;
  clusterId: string;
  leadId: string;
  quotations: number;
  invoices: number;
  purchaseValue: number;
  status: "Active" | "Inactive";
  createdDate: string;
}

export interface DocItem {
  product: string;
  description: string;
  size: string;
  color: string;
  qty: number;
  unit: string;
  price: number;
  discount: number;
  tax: number;
}

export interface Quotation {
  id: string;
  customerId: string;
  stateId?: string;
  clusterId: string;
  leadId: string;
  date: string;
  validUntil: string;
  companyTitle?: string;
  companyAddress?: string;
  companyGst?: string;
  companyPhone?: string;
  companyEmail?: string;
  logo?: string;
  footerTerms?: string;
  items: DocItem[];
  status: "Draft" | "Sent" | "Accepted" | "Rejected" | "Expired";
  createdBy: string;
  createdByRole?: string;
}

export interface Proforma {
  id: string;
  customerId: string;
  stateId?: string;
  clusterId: string;
  quotationId: string;
  date: string;
  dueDate: string;
  companyTitle?: string;
  companyAddress?: string;
  companyGst?: string;
  companyPhone?: string;
  companyEmail?: string;
  logo?: string;
  footerTerms?: string;
  items: DocItem[];
  status: "Draft" | "Issued" | "Converted" | "Cancelled";
  createdBy: string;
  createdByRole?: string;
}

export interface Invoice {
  id: string;
  customerId: string;
  stateId?: string | undefined;
  clusterId: string;
  proformaId: string;
  date: string;
  dueDate: string;
  companyTitle?: string;
  companyAddress?: string;
  companyGst?: string;
  companyPhone?: string;
  companyEmail?: string;
  logo?: string;
  footerTerms?: string;
  items: DocItem[];
  paid: number;
  status: "Draft" | "Issued" | "Paid" | "Partially Paid" | "Pending" | "Cancelled";
  createdBy: string;
  createdByRole?: string;
}

export interface Material {
  id: string;
  name: string;
  type: "PDF" | "Image" | "Video" | "Document";
  category: string;
  uploadedBy: string;
  uploadDate: string;
  size: string;
}

export interface ActivityLog {
  id: string;
  at: string;
  user: string;
  role: Role;
  action: string;
  module: string;
  record: string;
  description: string;
  ip: string;
}
