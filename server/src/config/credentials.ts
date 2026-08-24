export interface UserCredential {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "ho" | "state" | "cluster";
  stateId?: string;
  clusterId?: string;
  status: "Active" | "Inactive";
  lastLogin?: string;
  defaultPassword?: string;
}

export const DEFAULT_SYSTEM_PASSWORD = "roofi@2026";

export const BASELINE_CREDENTIALS: UserCredential[] = [
  // 1. HO Admin (1 User)
  {
    id: "U-001",
    name: "Arun Balaji",
    email: "admin@roofi.in",
    phone: "+91 98400 11223",
    role: "ho",
    status: "Active",
    lastLogin: "2026-08-12 09:12",
    defaultPassword: DEFAULT_SYSTEM_PASSWORD,
  },

  // 2. State Admin (1 User)
  {
    id: "U-101",
    name: "Meenakshi Iyer",
    email: "tn.admin@roofi.in",
    phone: "+91 90300 20000",
    role: "state",
    stateId: "TN",
    status: "Active",
    lastLogin: "2026-08-11 08:20",
    defaultPassword: DEFAULT_SYSTEM_PASSWORD,
  },

  // 3. Cluster Manager (1 User)
  {
    id: "U-201",
    name: "Karthik Subramanian",
    email: "coimbatore@roofi.in",
    phone: "+91 98400 10000",
    role: "cluster",
    stateId: "TN",
    clusterId: "CL-001",
    status: "Active",
    lastLogin: "2026-08-10 10:00",
    defaultPassword: DEFAULT_SYSTEM_PASSWORD,
  },
];
