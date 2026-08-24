import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { State } from "../models/State.js";
import { Cluster } from "../models/Cluster.js";
import { Lead } from "../models/Lead.js";
import { Customer } from "../models/Customer.js";
import { Quotation } from "../models/Quotation.js";
import { Proforma } from "../models/Proforma.js";
import { Invoice } from "../models/Invoice.js";
import { Material } from "../models/Material.js";
import { ActivityLog } from "../models/ActivityLog.js";
import { RoleModel } from "../models/Role.js";
import { BASELINE_CREDENTIALS, DEFAULT_SYSTEM_PASSWORD } from "../config/credentials.js";

/* ---------- initial roles ---------- */
const initialRoles = [
  { id: "R-001", name: "HO Admin", code: "ho", description: "Head Office Administrator — Full system permissions" },
  { id: "R-002", name: "State HO / Admin", code: "state", description: "State Administrator — Regional state jurisdiction" },
  { id: "R-003", name: "Cluster Manager", code: "cluster", description: "Cluster Hub Manager — Operations and customer billing" },
  { id: "R-004", name: "Sales Executive", code: "sales", description: "Field sales and lead follow-ups executive" },
  { id: "R-005", name: "Billing Officer", code: "billing", description: "Invoicing and payment collection officer" },
];

/* ---------- states & clusters data ---------- */
const statesData = [
  { id: "TN", name: "Tamil Nadu", code: "TN" },
  { id: "KL", name: "Kerala", code: "KL" },
  { id: "AP", name: "Andhra Pradesh", code: "AP" },
  { id: "KA", name: "Karnataka", code: "KA" },
];

const clusterSeed: [string, string, string][] = [
  ["TN", "Coimbatore Cluster", "Coimbatore"],
  ["KL", "Kochi Cluster", "Kochi"],
  ["AP", "Vijayawada Cluster", "Vijayawada"],
  ["KA", "Bengaluru Cluster", "Bengaluru"],
];

const managers = [
  "Karthik Subramanian",
  "Prakash Menon",
  "Ravi Teja",
  "Manjunath Gowda",
];

const clustersData = clusterSeed.map(([stateId, name, city], i) => ({
  id: `CL-${String(i + 1).padStart(3, "0")}`,
  name,
  code: `${stateId}-${city.slice(0, 3).toUpperCase()}`,
  stateId,
  company: `ROOFI ${city} Roofing Solutions Pvt Ltd`,
  address: `${12 + i} Industrial Estate Road, ${city}`,
  gst: `${29 - i}AABCR${1234 + i}K1Z${i % 9}`,
  phone: `+91 98${400 + i}${String(10000 + i * 137).slice(0, 5)}`,
  email: `${city.toLowerCase()}@roofi.in`,
  manager: managers[i]!,
}));

/* ---------- Sample Leads for All Clusters ---------- */
const sampleLeads = [
  {
    id: "LD-1001",
    customerName: "Suresh Kumar",
    phone: "+91 98410 11223",
    email: "suresh.kumar@gmail.com",
    address: "45 Avinashi Road, Peelamedu",
    city: "Coimbatore",
    district: "Coimbatore",
    pincode: "641004",
    stateId: "TN",
    clusterId: "CL-001",
    source: "Meta",
    campaign: "TN Roofing Summer Promo",
    status: "Contacted",
    priority: "High",
    product: "ROOFI Classic Tile - Charcoal",
    quantity: 450,
    estValue: 345600,
    assignedBy: "Meenakshi Iyer (TN State Admin)",
    assignedDate: "2026-08-14 10:30",
    lastContact: "2026-08-16 11:15",
    nextFollowUp: "2026-08-19",
    createdDate: "2026-08-14 09:00",
    notes: "Customer inquired for 450 tiles villa project. Telecaller discussed product specs.",
    timeline: [
      { label: "Lead Created via Meta Ad", at: "2026-08-14 09:00", by: "System Meta Ads" },
      { label: "Assigned to Coimbatore Cluster", at: "2026-08-14 10:30", by: "Meenakshi Iyer" },
      { label: "Telecaller Call Completed", at: "2026-08-16 11:15", by: "Karthik Subramanian", note: "Discussed stone coated metal tile durability & warranty." }
    ]
  },
  {
    id: "LD-1002",
    customerName: "Ramachandran Nair",
    phone: "+91 98410 22334",
    email: "ramachandran.nair@yahoo.com",
    address: "78 Trichy Road, Singanallur",
    city: "Coimbatore",
    district: "Coimbatore",
    pincode: "641005",
    stateId: "TN",
    clusterId: "CL-001",
    source: "Facebook",
    campaign: "Coimbatore Commercial Roofing",
    status: "Converted",
    priority: "High",
    product: "ROOFI Heritage Tile - Chestnut Brown",
    quantity: 600,
    estValue: 480000,
    assignedBy: "Arun Balaji (HO Admin)",
    assignedDate: "2026-08-12 11:00",
    lastContact: "2026-08-15 14:20",
    createdDate: "2026-08-12 10:00",
    notes: "Commercial showroom roofing. Deal closed and converted to customer.",
    timeline: [
      { label: "Lead Created", at: "2026-08-12 10:00", by: "FB Campaign" },
      { label: "Assigned to Coimbatore Cluster", at: "2026-08-12 11:00", by: "Arun Balaji" },
      { label: "Site Visit Completed", at: "2026-08-14 15:00", by: "Karthik Subramanian" },
      { label: "Converted to Customer CUST-1001", at: "2026-08-15 14:20", by: "Karthik Subramanian", note: "Advance payment received." }
    ]
  },
  {
    id: "LD-1003",
    customerName: "Dr. Mathew Varghese",
    phone: "+91 98411 33445",
    email: "mathew.varghese@healthmail.in",
    address: "12 MG Road, Edappally",
    city: "Kochi",
    district: "Ernakulam",
    pincode: "682024",
    stateId: "KL",
    clusterId: "CL-002",
    source: "Instagram",
    campaign: "Kerala Monsoon Villa Roofing",
    status: "Qualified",
    priority: "Medium",
    product: "ROOFI Shingle Tile - Terracotta",
    quantity: 380,
    estValue: 288000,
    assignedBy: "Thomas Varghese (KL State Admin)",
    assignedDate: "2026-08-15 09:30",
    lastContact: "2026-08-16 16:00",
    nextFollowUp: "2026-08-20",
    createdDate: "2026-08-15 08:30",
    notes: "Doctor constructing luxury home. Interested in leak-proof stone coated tiles.",
    timeline: [
      { label: "Lead Created via Instagram", at: "2026-08-15 08:30", by: "Instagram Lead Form" },
      { label: "Assigned to Kochi Cluster", at: "2026-08-15 09:30", by: "Thomas Varghese" },
      { label: "Telecaller Follow-up", at: "2026-08-16 16:00", by: "Prakash Menon", note: "Qualified budget & architect drawings received." }
    ]
  },
  {
    id: "LD-1004",
    customerName: "Anjali Menon",
    phone: "+91 98411 44556",
    email: "anjali.menon@outlook.com",
    address: "88 Marine Drive",
    city: "Kochi",
    district: "Ernakulam",
    pincode: "682031",
    stateId: "KL",
    clusterId: "CL-002",
    source: "Manual",
    campaign: "Kochi Builder Expo 2026",
    status: "Quotation",
    priority: "High",
    product: "ROOFI Roman Tile - Forest Green",
    quantity: 520,
    estValue: 416000,
    assignedBy: "Prakash Menon (Cluster Manager)",
    assignedDate: "2026-08-13 14:00",
    lastContact: "2026-08-16 12:30",
    nextFollowUp: "2026-08-18",
    createdDate: "2026-08-13 13:30",
    notes: "Resort roofing project in Fort Kochi. Quotation QT-2026-0002 issued.",
    timeline: [
      { label: "Lead Created from Expo", at: "2026-08-13 13:30", by: "Prakash Menon" },
      { label: "Quotation Generated QT-2026-0002", at: "2026-08-16 12:30", by: "Prakash Menon" }
    ]
  },
  {
    id: "LD-1005",
    customerName: "K. Venkateswara Rao",
    phone: "+91 98412 55667",
    email: "kv.rao@solarcorp.com",
    address: "24 Benz Circle, MG Road",
    city: "Vijayawada",
    district: "Krishna",
    pincode: "520010",
    stateId: "AP",
    clusterId: "CL-003",
    source: "Meta",
    campaign: "AP Industrial Roofing",
    status: "Follow-up",
    priority: "High",
    product: "ROOFI Shake Tile - Charcoal",
    quantity: 500,
    estValue: 412000,
    assignedBy: "Lakshmi Prasad (AP State Admin)",
    assignedDate: "2026-08-14 11:45",
    lastContact: "2026-08-16 15:10",
    nextFollowUp: "2026-08-21",
    createdDate: "2026-08-14 10:15",
    notes: "Factory office roof replacement. Requested sample stone tile display.",
    timeline: [
      { label: "Lead Created", at: "2026-08-14 10:15", by: "Meta Ads" },
      { label: "Assigned to Vijayawada Cluster", at: "2026-08-14 11:45", by: "Lakshmi Prasad" },
      { label: "Telecaller Call Recorded", at: "2026-08-16 15:10", by: "Ravi Teja", note: "Sent product catalog & pricing sheet." }
    ]
  },
  {
    id: "LD-1006",
    customerName: "Chandra Sekhar Reddy",
    phone: "+91 98412 66778",
    email: "cs.reddy@reddyconstructions.in",
    address: "105 Bandar Road",
    city: "Vijayawada",
    district: "Krishna",
    pincode: "520002",
    stateId: "AP",
    clusterId: "CL-003",
    source: "Facebook",
    campaign: "AP Premium Villa Roofing",
    status: "Converted",
    priority: "High",
    product: "ROOFI Classic Tile - Burgundy Red",
    quantity: 750,
    estValue: 600000,
    assignedBy: "Arun Balaji (HO Admin)",
    assignedDate: "2026-08-11 12:00",
    lastContact: "2026-08-15 16:45",
    createdDate: "2026-08-11 11:00",
    notes: "Gated community clubhouse roof. Converted to Customer CUST-1002.",
    timeline: [
      { label: "Lead Created", at: "2026-08-11 11:00", by: "Facebook" },
      { label: "Assigned to Vijayawada Cluster", at: "2026-08-11 12:00", by: "Arun Balaji" },
      { label: "Converted to Customer CUST-1002", at: "2026-08-15 16:45", by: "Ravi Teja" }
    ]
  },
  {
    id: "LD-1007",
    customerName: "Siddharth Hegde",
    phone: "+91 98413 77889",
    email: "siddharth.hegde@techvalley.com",
    address: "56 Indiranagar 100ft Road",
    city: "Bengaluru",
    district: "Bengaluru Urban",
    pincode: "560038",
    stateId: "KA",
    clusterId: "CL-004",
    source: "Instagram",
    campaign: "KA Bengaluru Eco Roofing",
    status: "Proforma Invoice",
    priority: "High",
    product: "ROOFI Shingle Tile - Charcoal Grey",
    quantity: 650,
    estValue: 520000,
    assignedBy: "Deepak Shetty (KA State Admin)",
    assignedDate: "2026-08-13 16:20",
    lastContact: "2026-08-16 17:00",
    nextFollowUp: "2026-08-19",
    createdDate: "2026-08-13 15:00",
    notes: "Villa in Whitefield. Proforma Invoice PI-2026-0004 sent.",
    timeline: [
      { label: "Lead Created", at: "2026-08-13 15:00", by: "Instagram" },
      { label: "Assigned to Bengaluru Cluster", at: "2026-08-13 16:20", by: "Deepak Shetty" },
      { label: "Proforma Invoice PI-2026-0004 Issued", at: "2026-08-16 17:00", by: "Manjunath Gowda" }
    ]
  },
  {
    id: "LD-1008",
    customerName: "B. S. Ramesh Gowda",
    phone: "+91 98413 88990",
    email: "ramesh.gowda@gowdagroup.com",
    address: "89 Hebbal Outer Ring Road",
    city: "Bengaluru",
    district: "Bengaluru Urban",
    pincode: "560024",
    stateId: "KA",
    clusterId: "CL-004",
    source: "Manual",
    campaign: "KA Architect Tie-up Program",
    status: "Converted",
    priority: "High",
    product: "ROOFI Classic Tile - Slate Black",
    quantity: 800,
    estValue: 640000,
    assignedBy: "Manjunath Gowda (Cluster Manager)",
    assignedDate: "2026-08-10 10:00",
    lastContact: "2026-08-14 11:30",
    createdDate: "2026-08-10 09:30",
    notes: "Farmhouse roofing in Yelahanka. Converted to Customer CUST-1003.",
    timeline: [
      { label: "Lead Created", at: "2026-08-10 09:30", by: "Manjunath Gowda" },
      { label: "Converted to Customer CUST-1003", at: "2026-08-14 11:30", by: "Manjunath Gowda" }
    ]
  }
];

/* ---------- Sample Converted Customers ---------- */
const sampleCustomers = [
  {
    id: "CUST-1001",
    name: "Ramachandran Nair",
    phone: "+91 98410 22334",
    email: "ramachandran.nair@yahoo.com",
    location: "Coimbatore",
    address: "78 Trichy Road, Singanallur, Coimbatore",
    stateId: "TN",
    clusterId: "CL-001",
    leadId: "LD-1002",
    quotations: 1,
    invoices: 1,
    purchaseValue: 480000,
    status: "Active",
    createdDate: "2026-08-15"
  },
  {
    id: "CUST-1002",
    name: "Chandra Sekhar Reddy",
    phone: "+91 98412 66778",
    email: "cs.reddy@reddyconstructions.in",
    location: "Vijayawada",
    address: "105 Bandar Road, Vijayawada",
    stateId: "AP",
    clusterId: "CL-003",
    leadId: "LD-1006",
    quotations: 1,
    invoices: 1,
    purchaseValue: 600000,
    status: "Active",
    createdDate: "2026-08-15"
  },
  {
    id: "CUST-1003",
    name: "B. S. Ramesh Gowda",
    phone: "+91 98413 88990",
    email: "ramesh.gowda@gowdagroup.com",
    location: "Bengaluru",
    address: "89 Hebbal Outer Ring Road, Bengaluru",
    stateId: "KA",
    clusterId: "CL-004",
    leadId: "LD-1008",
    quotations: 1,
    invoices: 1,
    purchaseValue: 640000,
    status: "Active",
    createdDate: "2026-08-14"
  }
];

/* ---------- Sample Activity Logs for Audit Trail ---------- */
const sampleActivityLogs = sampleLeads.flatMap((l) => [
  {
    id: `LOG-SEED-${l.id}-1`,
    at: l.createdDate,
    user: l.assignedBy,
    role: "ho",
    action: "Lead Created",
    module: "Leads",
    record: l.id,
    description: `Lead ${l.id} (${l.customerName}) created via ${l.source}.`,
    ip: "127.0.0.1",
    leadId: l.id,
    stateId: l.stateId,
    clusterId: l.clusterId
  },
  {
    id: `LOG-SEED-${l.id}-2`,
    at: l.assignedDate,
    user: l.assignedBy,
    role: l.assignedBy.includes("Admin") ? "state" : "cluster",
    action: "Assigned Lead to Cluster",
    module: "Leads",
    record: l.id,
    description: `Lead ${l.id} assigned to cluster ${l.clusterId}.`,
    ip: "127.0.0.1",
    leadId: l.id,
    stateId: l.stateId,
    clusterId: l.clusterId
  },
  {
    id: `LOG-SEED-${l.id}-3`,
    at: l.lastContact || l.createdDate,
    user: managers[Number(l.clusterId.slice(-1)) - 1] || "Cluster Telecaller",
    role: "cluster",
    action: l.status === "Converted" ? "Converted to Customer" : `Updated Lead Status to ${l.status}`,
    module: "Leads",
    record: l.id,
    description: l.notes,
    ip: "127.0.0.1",
    leadId: l.id,
    stateId: l.stateId,
    clusterId: l.clusterId
  }
]);

/* ---------- Sample Quotations for All Clusters ---------- */
const sampleQuotations = [
  {
    id: "QT-2026-0001",
    customerId: "CUST-1001",
    stateId: "TN",
    clusterId: "CL-001",
    leadId: "LD-1001",
    date: "2026-08-14",
    validUntil: "2026-08-29",
    companyTitle: "ROOFI Coimbatore Roofing Solutions Pvt Ltd",
    companyAddress: "12 Industrial Estate Road, Peelamedu, Coimbatore",
    companyGst: "33AABCR1234K1Z0",
    companyPhone: "+91 98400 10000",
    companyEmail: "coimbatore@roofi.in",
    footerTerms: "1. 50% Advance with PO, 50% before dispatch.\n2. 18% GST included.\n3. 50-year tile warranty.",
    items: [
      { product: "ROOFI Classic Tile", description: "Stone coated metal tile - Charcoal", size: "1340 x 420 mm", color: "Charcoal", qty: 450, unit: "Nos", price: 640, discount: 2, tax: 18 }
    ],
    status: "Sent",
    createdBy: "Karthik Subramanian"
  },
  {
    id: "QT-2026-0002",
    customerId: "CUST-1002",
    stateId: "KL",
    clusterId: "CL-002",
    leadId: "LD-1004",
    date: "2026-08-15",
    validUntil: "2026-08-30",
    companyTitle: "ROOFI Kochi Roofing Solutions Pvt Ltd",
    companyAddress: "13 Industrial Estate Road, Edappally, Kochi",
    companyGst: "32AABCR1235K1Z1",
    companyPhone: "+91 98401 10137",
    companyEmail: "kochi@roofi.in",
    footerTerms: "1. Advance 50%, Balance on site delivery.\n2. Marine climate corrosion warranty.",
    items: [
      { product: "ROOFI Shingle Tile", description: "Stone coated metal tile - Terracotta", size: "1250 x 400 mm", color: "Terracotta", qty: 380, unit: "Nos", price: 620, discount: 0, tax: 18 }
    ],
    status: "Accepted",
    createdBy: "Prakash Menon"
  },
  {
    id: "QT-2026-0003",
    customerId: "CUST-1002",
    stateId: "AP",
    clusterId: "CL-003",
    leadId: "LD-1006",
    date: "2026-08-13",
    validUntil: "2026-08-28",
    companyTitle: "ROOFI Vijayawada Roofing Solutions Pvt Ltd",
    companyAddress: "14 Industrial Estate Road, Benz Circle, Vijayawada",
    companyGst: "37AABCR1236K1Z2",
    companyPhone: "+91 98402 10274",
    companyEmail: "vijayawada@roofi.in",
    footerTerms: "1. Payment in 2 installments.\n2. Free installation supervision.",
    items: [
      { product: "ROOFI Shake Tile", description: "Stone coated metal tile - Charcoal", size: "1300 x 410 mm", color: "Charcoal", qty: 500, unit: "Nos", price: 680, discount: 5, tax: 18 }
    ],
    status: "Accepted",
    createdBy: "Ravi Teja"
  },
  {
    id: "QT-2026-0004",
    customerId: "CUST-1003",
    stateId: "KA",
    clusterId: "CL-004",
    leadId: "LD-1007",
    date: "2026-08-14",
    validUntil: "2026-08-29",
    companyTitle: "ROOFI Bengaluru Roofing Solutions Pvt Ltd",
    companyAddress: "15 Industrial Estate Road, Peenya, Bengaluru",
    companyGst: "29AABCR1237K1Z3",
    companyPhone: "+91 98403 10411",
    companyEmail: "bengaluru@roofi.in",
    footerTerms: "1. 50% Advance with order, 50% upon dispatch.\n2. 50-Year Structural Warranty.",
    items: [
      { product: "ROOFI Shingle Tile", description: "Stone coated tile - Slate Black", size: "1250 x 400 mm", color: "Slate Black", qty: 650, unit: "Nos", price: 660, discount: 2, tax: 18 }
    ],
    status: "Accepted",
    createdBy: "Manjunath Gowda"
  }
];

/* ---------- Sample Proforma Invoices for All Clusters ---------- */
const sampleProformas = [
  {
    id: "PI-2026-0001",
    customerId: "CUST-1001",
    stateId: "TN",
    clusterId: "CL-001",
    quotationId: "QT-2026-0001",
    date: "2026-08-15",
    dueDate: "2026-08-25",
    companyTitle: "ROOFI Coimbatore Roofing Solutions Pvt Ltd",
    companyAddress: "12 Industrial Estate Road, Peelamedu, Coimbatore",
    companyGst: "33AABCR1234K1Z0",
    companyPhone: "+91 98400 10000",
    companyEmail: "coimbatore@roofi.in",
    footerTerms: "Advance Payment Proforma Invoice for Villa Project.",
    items: [
      { product: "ROOFI Classic Tile", description: "Stone coated metal tile - Charcoal", size: "1340 x 420 mm", color: "Charcoal", qty: 450, unit: "Nos", price: 640, discount: 2, tax: 18 }
    ],
    status: "Issued",
    createdBy: "Karthik Subramanian"
  },
  {
    id: "PI-2026-0002",
    customerId: "CUST-1002",
    stateId: "KL",
    clusterId: "CL-002",
    quotationId: "QT-2026-0002",
    date: "2026-08-16",
    dueDate: "2026-08-26",
    companyTitle: "ROOFI Kochi Roofing Solutions Pvt Ltd",
    companyAddress: "13 Industrial Estate Road, Edappally, Kochi",
    companyGst: "32AABCR1235K1Z1",
    companyPhone: "+91 98401 10137",
    companyEmail: "kochi@roofi.in",
    footerTerms: "Proforma Invoice for Kochi Resort Project.",
    items: [
      { product: "ROOFI Shingle Tile", description: "Stone coated metal tile - Terracotta", size: "1250 x 400 mm", color: "Terracotta", qty: 380, unit: "Nos", price: 620, discount: 0, tax: 18 }
    ],
    status: "Issued",
    createdBy: "Prakash Menon"
  },
  {
    id: "PI-2026-0003",
    customerId: "CUST-1002",
    stateId: "AP",
    clusterId: "CL-003",
    quotationId: "QT-2026-0003",
    date: "2026-08-14",
    dueDate: "2026-08-24",
    companyTitle: "ROOFI Vijayawada Roofing Solutions Pvt Ltd",
    companyAddress: "14 Industrial Estate Road, Benz Circle, Vijayawada",
    companyGst: "37AABCR1236K1Z2",
    companyPhone: "+91 98402 10274",
    companyEmail: "vijayawada@roofi.in",
    footerTerms: "Proforma Invoice for Gated Community Clubhouse.",
    items: [
      { product: "ROOFI Shake Tile", description: "Stone coated metal tile - Charcoal", size: "1300 x 410 mm", color: "Charcoal", qty: 500, unit: "Nos", price: 680, discount: 5, tax: 18 }
    ],
    status: "Converted",
    createdBy: "Ravi Teja"
  },
  {
    id: "PI-2026-0004",
    customerId: "CUST-1003",
    stateId: "KA",
    clusterId: "CL-004",
    quotationId: "QT-2026-0004",
    date: "2026-08-16",
    dueDate: "2026-08-26",
    companyTitle: "ROOFI Bengaluru Roofing Solutions Pvt Ltd",
    companyAddress: "15 Industrial Estate Road, Peenya, Bengaluru",
    companyGst: "29AABCR1237K1Z3",
    companyPhone: "+91 98403 10411",
    companyEmail: "bengaluru@roofi.in",
    footerTerms: "Proforma Invoice for Whitefield Villa Roofing.",
    items: [
      { product: "ROOFI Shingle Tile", description: "Stone coated tile - Slate Black", size: "1250 x 400 mm", color: "Slate Black", qty: 650, unit: "Nos", price: 660, discount: 2, tax: 18 }
    ],
    status: "Issued",
    createdBy: "Manjunath Gowda"
  }
];

export async function seedDatabase(cleanOnly = false) {
  console.log("🧹 Resetting MongoDB database with clean network setup and sample cluster data...");

  // 1. Reset Roles
  await RoleModel.deleteMany({});
  await RoleModel.insertMany(initialRoles);

  // 2. Reset States
  await State.deleteMany({});
  await State.insertMany(statesData);

  // 3. Reset Clusters
  await Cluster.deleteMany({});
  await Cluster.insertMany(clustersData);

  // 4. Reset Users from BASELINE_CREDENTIALS (hashed with default password)
  const defaultPasswordHash = await bcrypt.hash(DEFAULT_SYSTEM_PASSWORD, 10);
  const usersWithHash = BASELINE_CREDENTIALS.map((u) => ({
    ...u,
    password: defaultPasswordHash,
  }));
  await User.deleteMany({});
  await User.insertMany(usersWithHash);

  // 5. Populate Sample Leads, Customers, Quotations, Proformas, and Activity Logs for all Clusters
  await Lead.deleteMany({});
  await Customer.deleteMany({});
  await Quotation.deleteMany({});
  await Proforma.deleteMany({});
  await Invoice.deleteMany({});
  await Material.deleteMany({});
  await ActivityLog.deleteMany({});

  if (!cleanOnly) {
    await Lead.insertMany(sampleLeads);
    await Customer.insertMany(sampleCustomers);
    await Quotation.insertMany(sampleQuotations);
    await Proforma.insertMany(sampleProformas);
    await ActivityLog.insertMany(sampleActivityLogs);
    console.log("✨ Seeded sample leads, customers, history activity logs, quotations, and proforma invoices across ALL 4 clusters!");
  }

  console.log("✨ Database successfully seeded!");
}
