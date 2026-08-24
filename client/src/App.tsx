import { Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { LoginPage } from "@/pages/LoginPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { LeadsPage } from "@/pages/LeadsPage";
import { LeadDetailPage } from "@/pages/LeadDetailPage";
import { AssignmentsPage } from "@/pages/AssignmentsPage";
import { CustomersPage } from "@/pages/CustomersPage";
import { QuotationsPage } from "@/pages/QuotationsPage";
import { QuotationDetailPage } from "@/pages/QuotationDetailPage";
import { NewQuotationPage } from "@/pages/NewQuotationPage";
import { QuotationSettingsPage } from "@/pages/QuotationSettingsPage";
import { ProformaInvoicesPage } from "@/pages/ProformaInvoicesPage";
import { ProformaDetailPage } from "@/pages/ProformaDetailPage";
import { NewProformaPage } from "@/pages/NewProformaPage";
import { InvoicesPage } from "@/pages/InvoicesPage";
import { InvoiceDetailPage } from "@/pages/InvoiceDetailPage";
import { StatesPage } from "@/pages/StatesPage";
import { ClustersPage } from "@/pages/ClustersPage";
import { MaterialsPage } from "@/pages/MaterialsPage";
import { ReportsPage } from "@/pages/ReportsPage";
import { UsersPage } from "@/pages/UsersPage";
import { CreateUserPage } from "@/pages/CreateUserPage";
import { SetupManagementPage } from "@/pages/SetupManagementPage";
import { ActivityLogsPage } from "@/pages/ActivityLogsPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { NotificationsPage } from "@/pages/NotificationsPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { NotFoundPage } from "@/pages/NotFoundPage";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />

      {/* Authenticated Layout Shell */}
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/leads" element={<LeadsPage />} />
        <Route path="/leads/:leadId" element={<LeadDetailPage />} />
        <Route path="/assignments" element={<AssignmentsPage />} />
        <Route path="/customers" element={<CustomersPage />} />
        <Route path="/quotations" element={<QuotationsPage />} />
        <Route path="/quotations/new" element={<NewQuotationPage />} />
        <Route path="/quotations/settings" element={<QuotationSettingsPage />} />
        <Route path="/quotations/:docId" element={<QuotationDetailPage />} />
        <Route path="/proforma-invoices" element={<ProformaInvoicesPage />} />
        <Route path="/proforma-invoices/new" element={<NewProformaPage />} />
        <Route path="/proforma-invoices/:docId" element={<ProformaDetailPage />} />
        <Route path="/invoices" element={<ProformaInvoicesPage />} />
        <Route path="/invoices/new" element={<NewProformaPage />} />
        <Route path="/invoices/:docId" element={<ProformaDetailPage />} />
        <Route path="/states" element={<StatesPage />} />
        <Route path="/clusters" element={<ClustersPage />} />
        <Route path="/materials" element={<MaterialsPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/users/create" element={<CreateUserPage />} />
        <Route path="/network/setup" element={<SetupManagementPage />} />
        <Route path="/activity-logs" element={<ActivityLogsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
