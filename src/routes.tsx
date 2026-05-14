import { Route, Routes, Navigate } from "react-router-dom";
// import Login from "./pages/login";
import ForgotPassword from "./pages/forgotPassword";
import SendOTP from "./pages/loginOTP/sendOTP";
import VerifyOTP from "./pages/loginOTP/verifyOTP";
import AuthProtect from "./Auth/AuthProtect";
import SuperAdminProtect from "./Auth/SuperAdminProtect";
import Dashboard from "./pages/dashboard";
import CommonLayout from "./components/molecule/layout/commonLayout";
import AttributeOption from "./pages/attributeOption";
import Report from "./pages/report";
import DataSources from "./pages/dataSources";
import DashboardOverview from "./pages/dashboard/overview";
import DashboardAnalytics from "./pages/dashboard/analytics";
import CreateTheme from "./pages/createTheme";
import DashboardThemePage from "./pages/dashboardTheme";
import { getAuthToken } from "./utils/handleLocalStorage";
import NaturalLanguage from "./pages/naturalLanguage/NaturalLanguage";
import Entity from "./pages/entity";
import DataSource from "./pages/dataSource";
import AIInsightPage from "./pages/aiInsight";
import DataSourceVersion from "./pages/dataSourceVersion";
import ReportSettings from "./pages/report-settings";
import Users from "./pages/users";
import Roles from "./pages/roles";
import RolePage from "./pages/roles/RolePage";
import Organization from "./pages/organization/organization";
import Vendor from "./pages/vendor/vendor";
import Permissions from "./pages/permissions";
import NotivixDashboard from "./pages/notivixDashboard";
import AddNotificationTypes from "./pages/notification/AddNotificationTypes";
import Notification from "./pages/notification";
import NotivixDataSource from "./pages/notivixDataSource";
import NotivixDataSourceSummary from "./pages/notivixDataSourceSummary";
import NotivixDataSourceCostAnalysis from "./pages/notivixDataSourceCostAnalysis";
import EditNotificationTypes from "./pages/notification/EditNotificationTypes";
import ValidationErrors from "./pages/validationErrors";
import AcknowledgeNotification from "./pages/acknowledgeNotification";
import NotificationLogger from "./pages/notification/NotificationLogger";
import ProfilePage from "./pages/profilePage";
import Designation from "./pages/designation";
import Department from "./pages/department";
import Template from "./pages/template";
import Jobs from "./pages/jobs";
import SourceList from "./pages/sourceList";
import SourceAttributes from "./pages/sourceList/attributes";
import BusinessUnit from "./pages/businessUnit";
import CentralDataSources from "./pages/centralDataSources";
import NotFound from "./pages/notFound";
import EngagementLetter from "./pages/engagementLetter";
import EngagementLetterCreate from "./pages/engagementLetter/create";
import EngagementLetterEdit from "./pages/engagementLetter/edit";
import EngagementLetterView from "./pages/engagementLetter/view";
import LegalDocument from "./pages/legalDocument";
import VendorInvoicePage from "./pages/vendorInvoice";
import PaymentInfoPage from "./pages/paymentInfo";
import PurchaseOrderPage from "./pages/purchaseOrder";
import ActivityInfoPage from "./pages/activityInfo";
import ReferenceInvoice from "./pages/referenceInvoice";
import { Home } from "./pages/Home";
import { Upload } from "./pages/Upload";
import { InvoiceList } from "./pages/InvoiceList";
import { InvoiceReview } from "./pages/InvoiceReview";
import { InvoiceDetail } from "./pages/InvoiceDetail";
import { Vendors } from "./pages/Vendors";
import { VendorCreate } from "./pages/VendorCreate";
import { UsersRoles } from "./pages/UsersRoles";
import { ExecDashboard } from "./pages/ExecDashboard";
import { VendorBench } from "./pages/VendorBench";
import { Onboarding } from "./pages/Onboarding";
import { AddUser, AddRole } from "./pages/AddRoleAddUser";
import { VendorRateCards } from "./pages/VendorRateCards";
import { AuditTrailPage } from "./pages/AuditTrail";
import { Login } from "./pages/Login";

const AppRoutes = () => {
  const token = getAuthToken();

  return (
    <Routes>
      {/* Root Route */}
      <Route
        path="/"
        element={<Navigate to={token ? "/home" : "/login"} replace />}
      />

      <Route path="/login" element={<Login />} />
      <Route path="/home" element={<Home />} />
      <Route path="/upload" element={<Upload />} />
      <Route path="/invoice-list" element={<InvoiceList />} />
      <Route path="/invoice-review" element={<InvoiceReview />} />
      <Route path="/inv-detail/:id" element={<InvoiceDetail />} />
      <Route path="/vendors" element={<Vendors />} />
      <Route path="/vendor-create" element={<VendorCreate />} />
      <Route path="/roles" element={<UsersRoles />} />
      <Route path="/exec" element={<ExecDashboard />} />
      <Route path="/bench" element={<VendorBench />} />
      <Route path="/onboard" element={<Onboarding />} />
      <Route path="/add-user" element={<AddUser />} />
      <Route path="/add-role" element={<AddRole />} />
      <Route path="/vendor-rate-card" element={<VendorRateCards />} />
      <Route path="/audit-trail" element={<AuditTrailPage />} />
      <Route path="/entity" element={<Entity />} />
      <Route path="/data-src" element={<DataSource />} />
      <Route path="/jobs" element={<Jobs />} />

      {/* Public Routes */}
      {/* <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/otp-login" element={<SendOTP />} />
      <Route path="/otp-login/otp" element={<VerifyOTP />} />
      <Route
        path="/notification/send-acknowledge-notification/:id"
        element={<AcknowledgeNotification />}
      /> */}

      {/* User Protected Routes */}
      {/* <Route element={<AuthProtect />}>
        <Route element={<CommonLayout />}> */}
          {/* <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/create" element={<Dashboard />} />
          <Route path="/dashboard/overview" element={<DashboardOverview />} />
          <Route path="/dashboard/analytics" element={<DashboardAnalytics />} />
          <Route path="/dashboard/:id" element={<Dashboard />} />
          <Route path="/reports" element={<Report />} /> */}
          {/* <Route path="/data-source" element={<DataSource />} /> */}
          {/* <Route path="/data-source/:id" element={<DataSources />} /> */}
          {/* <Route path="/entity" element={<Entity />} />
          <Route path="/data-src" element={<DataSource />} /> */}
          {/* <Route path="/data-src-version" element={<DataSourceVersion />} /> */}
          {/* <Route path="/data-src-version/:dataSourceId" element={<DataSourceVersion />} /> */}
          {/* <Route path="/reference-invoice" element={<ReferenceInvoice />} />
          <Route path="/VixAi-Insights" element={<AIInsightPage />} />
          <Route path="/VixAi-Chart" element={<NaturalLanguage />} />
          <Route path="/report-settings" element={<ReportSettings />} /> */}
          {/* // Notivix routes */}
          {/* <Route path="/dashboard" element={<NotivixDashboard />} />
          <Route path="/dashboard/create" element={<NotivixDashboard />} />
          <Route path="/dashboard/:id" element={<NotivixDashboard />} />
          <Route path="/notification" element={<Notification />} />
          <Route path="/notification-types" element={<Notification />} />
          <Route path="/notification-logs" element={<NotificationLogger />} />
          <Route
            path="/notification-types/add"
            element={<AddNotificationTypes />}
          /> */}
          {/* <Route
            path="/notification-types/edit/:id"
            element={<EditNotificationTypes />}
          />
          <Route path="/settings/users" element={<Users />} />
          <Route path="/permissions" element={<Permissions />} /> */}
          {/* <Route path="/notivix/settings/roles" element={<Roles />} /> */}
          {/* <Route path="/roles" element={<Roles />} />
          <Route path="/roles/add" element={<RolePage mode="add" />} />
          <Route path="/roles/edit/:id" element={<RolePage mode="edit" />} />
          <Route path="/roles/view/:id" element={<RolePage mode="view" />} />

          <Route path="/organization" element={<Organization />} />

          <Route path="/vendor" element={<Vendor />} />

          <Route path="/engagement-letter" element={<EngagementLetter />} />

          <Route
            path="/engagement-letter/create"
            element={<EngagementLetterCreate />}
          />

          <Route
            path="/engagement-letter/edit/:id"
            element={<EngagementLetterEdit />}
          />

          <Route
            path="/engagement-letter/view/:id"
            element={<EngagementLetterView />}
          /> */}

          {/* <Route path="/legal-document" element={<LegalDocument />} />

          <Route path="/vendor-invoice" element={<VendorInvoicePage />} />

          <Route path="/payment-info" element={<PaymentInfoPage />} />

           <Route path="/purchase-order" element={<PurchaseOrderPage />} />

           <Route path="/activity-info" element={<ActivityInfoPage />} />

          <Route path="/data-source-new/:id" element={<NotivixDataSource />} />
          <Route path="/data-source-new-summary/:id" element={<NotivixDataSourceSummary />} />
          <Route path="/cost-analysis/:id" element={<NotivixDataSourceCostAnalysis />} />

          <Route path="/validation-errors/:id" element={<ValidationErrors />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/create-theme" element={<CreateTheme />} />
          <Route path="/attribute-option" element={<AttributeOption />} />
          <Route path="/designation" element={<Designation />} />
          <Route path="/department" element={<Department />} />
          <Route path="/business-unit" element={<BusinessUnit />} />
          <Route path="/data-sources" element={<CentralDataSources />} />
          <Route path="/template" element={<Template />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route
            path="/system-settings/charts/source-list"
            element={<SourceList />}
          />
          <Route
            path="/system-settings/charts/source-list/attributes/:id"
            element={<SourceAttributes />}
          /> */}
        {/* </Route>
      </Route> */}

      {/* Super Admin Protected Routes */}
      {/* <Route element={<SuperAdminProtect />}>
        <Route element={<CommonLayout />}>
          <Route path="/superadmin/dashboard" element={<Dashboard />} />
          <Route path="/attribute-option" element={<AttributeOption />} />
        </Route>
      </Route> */}

      {/* Admin and Super Admin Protected Routes */}
      {/* <Route element={<AdminSuperAdminProtect />}>
        <Route element={<CommonLayout />}>
          <Route path="/create-theme" element={<CreateTheme />} />
        </Route>
      </Route> */}

      {/* <Route element={<AuthProtect />}>
        <Route element={<CommonLayout />}>
          <Route path="/themes" element={<DashboardThemePage />} />
        </Route>
      </Route> */}

      {/* 404 - Page Not Found */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
