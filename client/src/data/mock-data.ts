import type {
  ActivityLog,
  Cluster,
  Customer,
  DocItem,
  Invoice,
  Lead,
  LeadSource,
  LeadStatus,
  Material,
  Priority,
  Proforma,
  Quotation,
  StateRec,
  UserRec,
} from "@/types";

/* ---------- deterministic pseudo random ---------- */
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}
const pick = <T>(r: () => number, arr: T[]) => arr[Math.floor(r() * arr.length)]!;
const int = (r: () => number, a: number, b: number) => a + Math.floor(r() * (b - a + 1));

/* ---------- states & clusters ---------- */
export const states: StateRec[] = [
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

const managers = ["Karthik Subramanian", "Prakash Menon", "Ravi Teja", "Manjunath Gowda"];

export const clusters: Cluster[] = clusterSeed.map(([stateId, name, city], i) => ({
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

export const stateName = (id: string) => states.find((s) => s.id === id)?.name ?? "—";
export const clusterName = (id?: string) => clusters.find((c) => c.id === id)?.name ?? "Unassigned";
export const clusterById = (id?: string) => clusters.find((c) => c.id === id);

/* ---------- users ---------- */
export const users: UserRec[] = [
  {
    id: "U-001",
    name: "Arun Balaji",
    email: "admin@roofi.in",
    phone: "+91 98400 11223",
    role: "ho",
    status: "Active",
    lastLogin: "2026-08-12 09:12",
  },
  ...states.map((s, i) => ({
    id: `U-1${String(i + 1).padStart(2, "0")}`,
    name: ["Meenakshi Iyer", "Thomas Varghese", "Lakshmi Prasad", "Deepak Shetty"][i]!,
    email: `${s.code.toLowerCase()}.admin@roofi.in`,
    phone: `+91 90${300 + i} ${20000 + i}`,
    role: "state" as const,
    stateId: s.id,
    status: "Active" as const,
    lastLogin: `2026-08-1${1 - (i % 2)} 0${8 + i}:2${i}`,
  })),
  ...clusters.map((c, i) => ({
    id: `U-2${String(i + 1).padStart(2, "0")}`,
    name: c.manager,
    email: c.email,
    phone: c.phone,
    role: "cluster" as const,
    stateId: c.stateId,
    clusterId: c.id,
    status: "Active" as const,
    lastLogin: `2026-08-${10 + (i % 3)} 1${i % 9}:0${i % 6}`,
  })),
];

/* ---------- leads ---------- */
const firstNames = [
  "Ramesh",
  "Suresh",
  "Priya",
  "Vinoth",
  "Divya",
  "Arjun",
  "Kavitha",
  "Hari",
  "Sundar",
  "Anitha",
  "Bala",
  "Jeeva",
  "Nandini",
  "Praveen",
  "Sanjay",
  "Lakshmanan",
  "Revathi",
  "Muthu",
  "Gopal",
  "Shalini",
];
const lastNames = [
  "Krishnan",
  "Pillai",
  "Reddy",
  "Nair",
  "Sharma",
  "Raj",
  "Iyer",
  "Menon",
  "Naidu",
  "Gowda",
];
const cityByState: Record<string, string[]> = {
  TN: ["Coimbatore", "Chennai", "Madurai", "Salem", "Tiruppur", "Erode"],
  KL: ["Kochi", "Kozhikode", "Thrissur", "Kollam", "Alappuzha"],
  AP: ["Vijayawada", "Visakhapatnam", "Guntur", "Tirupati"],
  KA: ["Bengaluru", "Mysuru", "Hubballi", "Mangaluru"],
};
const products = [
  "ROOFI Classic Tile",
  "ROOFI Shingle Tile",
  "ROOFI Bond Tile",
  "ROOFI Milano Tile",
  "ROOFI Shake Tile",
];
const sources: LeadSource[] = ["Meta", "Facebook", "Instagram", "Manual"];
const statuses: LeadStatus[] = [
  "New",
  "Assigned",
  "Contacted",
  "Qualified",
  "Follow-up",
  "Quotation",
  "Proforma Invoice",
  "Converted",
  "Lost",
];
const priorities: Priority[] = ["High", "Medium", "Low"];
const campaigns = [
  "Monsoon Roofing 2026",
  "Villa Owners TN",
  "Summer Metal Tile Push",
  "Dealer Referral Drive",
  "Instagram Reels Q3",
  "Direct Walk-in",
];

const d = (day: number) => {
  const base = new Date(Date.UTC(2026, 4, 1));
  base.setUTCDate(base.getUTCDate() + day);
  return base.toISOString().slice(0, 10);
};
export const leads: Lead[] = [];

/* ---------- customers ---------- */
export const customers: Customer[] = [];

/* ---------- documents ---------- */
const sizes = ["1340 x 420 mm", "1250 x 400 mm", "1300 x 415 mm"];
const colors = ["Charcoal", "Terracotta", "Forest Green", "Slate Grey", "Antique Red"];

export const lineTotal = (it: DocItem) => {
  const gross = it.qty * it.price;
  const afterDisc = gross - (gross * it.discount) / 100;
  return afterDisc;
};
export const docTotals = (items: DocItem[], stateId: string = "TN") => {
  const subtotal = items.reduce((s, i) => s + i.qty * i.price, 0);
  const discount = items.reduce((s, i) => s + (i.qty * i.price * i.discount) / 100, 0);
  const taxable = subtotal - discount;
  const gst = items.reduce((s, i) => s + (lineTotal(i) * i.tax) / 100, 0);
  const isTN =
    !stateId || stateId.toUpperCase() === "TN" || stateId.toLowerCase().includes("tamil");
  const sgst = isTN ? gst / 2 : 0;
  const cgst = isTN ? gst / 2 : gst;
  return { subtotal, discount, taxable, gst, sgst, cgst, isTN, total: Math.round(taxable + gst) };
};

export const quotations: Quotation[] = [];

export const proformas: Proforma[] = [];

export const invoices: Invoice[] = [];

export const materialCategories = [
  "Product Catalog",
  "Brochures",
  "Marketing Materials",
  "Product Videos",
  "Price Lists",
  "Technical Documents",
  "Training Materials",
  "Company Documents",
  "Other",
];

export const materials: Material[] = [
  ["ROOFI Product Catalogue 2026.pdf", "PDF", "Product Catalog", "8.4 MB"],
  ["Stone Coated Tile Brochure.pdf", "PDF", "Brochures", "4.1 MB"],
  ["Milano Profile Installation.mp4", "Video", "Product Videos", "84 MB"],
  ["Colour Chart - Full Range.jpg", "Image", "Marketing Materials", "2.2 MB"],
  ["Dealer Price List Q3 2026.pdf", "PDF", "Price Lists", "620 KB"],
  ["Technical Datasheet - Classic.pdf", "PDF", "Technical Documents", "1.1 MB"],
  ["Site Installation Guide.pdf", "PDF", "Technical Documents", "3.7 MB"],
  ["Sales Training Deck.pptx", "Document", "Training Materials", "12 MB"],
  ["ROOFI Company Profile.pdf", "PDF", "Company Documents", "5.9 MB"],
  ["Instagram Creatives Pack.zip", "Document", "Marketing Materials", "38 MB"],
  ["Villa Project Showcase.jpg", "Image", "Marketing Materials", "3.4 MB"],
  ["Warranty Terms 2026.pdf", "PDF", "Company Documents", "410 KB"],
].map(([name, type, category, size], i) => ({
  id: `MT-${String(1 + i).padStart(3, "0")}`,
  name: name as string,
  type: type as Material["type"],
  category: category as string,
  uploadedBy: "HO Admin",
  uploadDate: d(70 + i),
  size: size as string,
}));

export const activityLogs: ActivityLog[] = Array.from({ length: 26 }, (_, i) => {
  const r = rng(7000 + i * 53);
  const u = pick(r, users);
  const action = pick(r, ["Created", "Updated", "Assigned", "Deleted", "Exported", "Logged in"]);
  const module = pick(r, ["Leads", "Quotations", "Invoices", "Customers", "Materials", "Users"]);
  return {
    id: `AL-${String(1 + i).padStart(4, "0")}`,
    at: `2026-08-${String(int(r, 1, 12)).padStart(2, "0")} ${String(int(r, 8, 19)).padStart(2, "0")}:${String(int(r, 10, 59))}`,
    user: u.name,
    role: u.role,
    action,
    module,
    record: pick(r, [
      ...leads.slice(0, 8).map((l) => l.id),
      ...quotations.slice(0, 4).map((q) => q.id),
    ]),
    description: `${action} record in ${module} module`,
    ip: `10.${int(r, 0, 40)}.${int(r, 0, 255)}.${int(r, 2, 250)}`,
  };
});

/* ---------- chart series ---------- */
export const monthlyTrend = [
  { month: "Jan", received: 42, assigned: 38, converted: 12, invoice: 1850000 },
  { month: "Feb", received: 51, assigned: 47, converted: 16, invoice: 2240000 },
  { month: "Mar", received: 63, assigned: 58, converted: 21, invoice: 3010000 },
  { month: "Apr", received: 58, assigned: 55, converted: 19, invoice: 2680000 },
  { month: "May", received: 72, assigned: 68, converted: 26, invoice: 3620000 },
  { month: "Jun", received: 81, assigned: 76, converted: 31, invoice: 4180000 },
  { month: "Jul", received: 77, assigned: 71, converted: 28, invoice: 3940000 },
  { month: "Aug", received: 89, assigned: 82, converted: 34, invoice: 4720000 },
];
