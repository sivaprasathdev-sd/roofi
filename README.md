# ROOFI — Lead Hub & ERP Solution

ROOFI is a stone-coated metal tile lead management, ERP, quotation, and multi-tier network management system.

## 🚀 Features

- **Multi-Role Access Control**: HO Admin, State Admin, Cluster Manager, and Telecaller operations.
- **Lead Tracking & Audit Trail**: Full activity history, call recording notes, status timeline, and lead details editing.
- **Quotations & Invoicing**: Automated quotation, proforma invoice, and tax invoice generation.
- **Network Management**: State and Cluster hub configuration.
- **MongoDB Atlas Integration**: Automated credential seeding and cloud database persistence.

## 💻 Local Development Setup

### 1. Install Dependencies
```bash
# Install root, client, and server dependencies
npm install
cd client && npm install
cd ../server && npm install
```

### 2. Environment Variables
Create `server/.env`:
```env
PORT=5039
BASE_URL=http://localhost:5039
MONGO_URI=mongodb+srv://admin:admin123@sp-proj.0vlarpn.mongodb.net/roofi?retryWrites=true&w=majority&appName=Sp-proj
JWT_SECRET=roofi_super_secret_jwt_key_2026
```

Create `client/.env`:
```env
VITE_API_BASE_URL=/api
```

### 3. Run Locally
```bash
# Start backend server (Port 5039)
npm --prefix server run dev

# Start frontend application (Port 3000)
npm --prefix client run dev
```

---

## 🌐 Deploying to Vercel

1. Import your GitHub repository (`https://github.com/sivaprasathdev-sd/roofi.git`) in Vercel.
2. Set Environment Variables in Vercel Project Settings:
   - `MONGO_URI`: `mongodb+srv://admin:admin123@sp-proj.0vlarpn.mongodb.net/roofi?retryWrites=true&w=majority&appName=Sp-proj`
   - `JWT_SECRET`: `roofi_super_secret_jwt_key_2026`
3. Click **Deploy**. Vercel will automatically build the frontend (`client/dist`) and serve backend API endpoints via `/api/index.js`.
