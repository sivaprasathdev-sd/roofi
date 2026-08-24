# ROOFI System User Credentials

All system user credentials are archived in [`server/src/config/credentials.ts`](file:///e:/NIT/Project/roofi/server/src/config/credentials.ts) and automatically seeded into the MongoDB `users` collection upon database connection (`connectDB()`).

Default System Password for all accounts: `roofi@2026`

---

## 1. Head Office (HO) Administrator (1 User)
| User ID | Name | Email | Role | Jurisdiction | Default Password |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `U-001` | Arun Balaji | `admin@roofi.in` | `ho` (HO Admin) | Head Office All India | `roofi@2026` |

---

## 2. State Administrators (4 Users — 1 per State)
| User ID | Name | Email | Role | State | Default Password |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `U-101` | Meenakshi Iyer | `tn.admin@roofi.in` | `state` | Tamil Nadu (`TN`) | `roofi@2026` |
| `U-102` | Thomas Varghese | `kl.admin@roofi.in` | `state` | Kerala (`KL`) | `roofi@2026` |
| `U-103` | Lakshmi Prasad | `ap.admin@roofi.in` | `state` | Andhra Pradesh (`AP`) | `roofi@2026` |
| `U-104` | Deepak Shetty | `ka.admin@roofi.in` | `state` | Karnataka (`KA`) | `roofi@2026` |

---

## 3. Cluster Managers (4 Users — 1 per State Cluster)
| User ID | Name | Email | Role | Cluster Destination | Default Password |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `U-201` | Karthik Subramanian | `coimbatore@roofi.in` | `cluster` | Coimbatore Cluster (`CL-001` · `TN`) | `roofi@2026` |
| `U-202` | Prakash Menon | `kochi@roofi.in` | `cluster` | Kochi Cluster (`CL-002` · `KL`) | `roofi@2026` |
| `U-203` | Ravi Teja | `vijayawada@roofi.in` | `cluster` | Vijayawada Cluster (`CL-003` · `AP`) | `roofi@2026` |
| `U-204` | Manjunath Gowda | `bengaluru@roofi.in` | `cluster` | Bengaluru Cluster (`CL-004` · `KA`) | `roofi@2026` |
