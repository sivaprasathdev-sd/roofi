const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

export async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("roofi.session.token");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string>),
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API request failed with status ${response.status}`);
  }

  return response.json();
}

export const api = {
  // Auth
  login: (credentials: { email: string; password?: string; role?: string }) =>
    apiRequest<{ token: string; user: any }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),

  getMe: () => apiRequest<{ user: any }>("/auth/me"),

  // Entity Data
  getLeads: () => apiRequest<any[]>("/leads"),
  createLead: (data: any) =>
    apiRequest<any>("/leads", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateLead: (id: string, data: any) =>
    apiRequest<any>(`/leads/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  getLeadLogs: (id: string) => apiRequest<any[]>(`/leads/${id}/logs`),
  deleteLeads: () =>
    apiRequest<{ message: string }>("/leads", {
      method: "DELETE",
    }),

  getCustomers: () => apiRequest<any[]>("/customers"),
  getQuotations: () => apiRequest<any[]>("/quotations"),
  createQuotation: (data: any) =>
    apiRequest<any>("/quotations", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getProformas: () => apiRequest<any[]>("/proformas"),
  createProforma: (data: any) =>
    apiRequest<any>("/proformas", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getInvoices: () => apiRequest<any[]>("/invoices"),

  // Network & Roles Setup
  getStates: () => apiRequest<any[]>("/states"),
  createState: (data: { name: string; code: string }) =>
    apiRequest<{ message: string; state: any }>("/states", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getClusters: () => apiRequest<any[]>("/clusters"),
  createCluster: (data: {
    name: string;
    code?: string;
    stateId: string;
    company?: string;
    address?: string;
    gst?: string;
    phone?: string;
    email?: string;
    manager?: string;
  }) =>
    apiRequest<{ message: string; cluster: any }>("/clusters", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getRoles: () => apiRequest<any[]>("/roles"),
  createRole: (data: { name: string; code?: string; description?: string }) =>
    apiRequest<{ message: string; role: any }>("/roles", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Settings & Uploads
  getSettings: (params?: { stateId?: string | undefined; clusterId?: string | undefined }) => {
    const queryObj: Record<string, string> = {};
    if (params && params["stateId"]) queryObj["stateId"] = params["stateId"];
    if (params && params["clusterId"]) queryObj["clusterId"] = params["clusterId"];
    const query = new URLSearchParams(queryObj).toString();
    return apiRequest<any>(`/settings${query ? `?${query}` : ""}`);
  },
  updateSettings: (data: any) =>
    apiRequest<{ message: string; settings: any }>("/settings", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  uploadSettingsFile: (data: { fileName: string; fileData: string; type: "logo" | "ico" }) =>
    apiRequest<{ message: string; url: string; fileName: string }>("/settings/upload", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Materials Management
  getMaterials: () => apiRequest<any[]>("/materials"),
  createMaterial: (data: {
    name: string;
    category: string;
    fileData?: string;
    fileName?: string;
    uploadedBy?: string;
  }) =>
    apiRequest<{ message: string; material: any }>("/materials", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateMaterial: (id: string, data: { name?: string; category?: string }) =>
    apiRequest<{ message: string; material: any }>(`/materials/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteMaterial: (id: string) =>
    apiRequest<{ message: string }>(`/materials/${id}`, {
      method: "DELETE",
    }),

  getActivityLogs: () => apiRequest<any[]>("/activity-logs"),

  // User Management
  getUsers: (params?: { stateId?: string | undefined }) => {
    const queryObj: Record<string, string> = {};
    if (params && params["stateId"]) queryObj["stateId"] = params["stateId"];
    const query = new URLSearchParams(queryObj).toString();
    return apiRequest<any[]>(`/users${query ? `?${query}` : ""}`);
  },
  createUser: (userData: {
    name: string;
    email: string;
    password: string;
    phone: string;
    role: string;
    stateId?: string;
    clusterId?: string;
  }) =>
    apiRequest<{ message: string; user: any }>("/users", {
      method: "POST",
      body: JSON.stringify(userData),
    }),

  updateProfile: (profileData: {
    userId: string;
    name?: string;
    phone?: string;
    password?: string;
  }) =>
    apiRequest<{ message: string; user: any }>("/users/profile", {
      method: "PUT",
      body: JSON.stringify(profileData),
    }),
};
