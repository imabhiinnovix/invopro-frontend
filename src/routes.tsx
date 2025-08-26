import { Route, Routes, Navigate } from "react-router-dom";
import Login from "./pages/login";
import SendOTP from "./pages/loginOTP/sendOTP";
import VerifyOTP from "./pages/loginOTP/verifyOTP";
import AuthProtect from "./Auth/AuthProtect";
import SuperAdminProtect from "./Auth/SuperAdminProtect";
import AdminSuperAdminProtect from "./Auth/AdminSuperAdminProtect";
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
import Organization from "./pages/organization/organization";
import Permissions from "./pages/permissions";
import NotivixDashboard from "./pages/notivixDashboard";
import AddNotificationTypes from "./pages/notification/AddNotificationTypes";
import Notification from "./pages/notification";
import NotivixDataSource from "./pages/notivixDataSource";
import EditNotificationTypes from "./pages/notification/EditNotificationTypes";
import { ValidationError } from "yup";
import ValidationErrors from "./pages/validationErrors";

const AppRoutes = () => {
  const token = getAuthToken();

  return (
    <Routes>
      {/* Root Route */}
      <Route
        path="/"
        element={<Navigate to={token ? "/dashboard" : "/login"} replace />}
      />

      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/otp-login" element={<SendOTP />} />
      <Route path="/otp-login/otp" element={<VerifyOTP />} />

      {/* User Protected Routes */}
      <Route element={<AuthProtect />}>
        <Route element={<CommonLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/overview" element={<DashboardOverview />} />
          <Route path="/dashboard/analytics" element={<DashboardAnalytics />} />
          <Route path="/dashboard/:id" element={<Dashboard />} />
          <Route path="/reports" element={<Report />} />
          <Route path="/data-source" element={<DataSource />} />
          <Route path="/data-source/:id" element={<DataSources />} />
          <Route path="/entity" element={<Entity />} />
          <Route path="/data-src" element={<DataSource />} />
          <Route path="/data-src-version" element={<DataSourceVersion />} />
          <Route path="/VixAi-Insights" element={<AIInsightPage />} />
          <Route path="/VixAi-Chart" element={<NaturalLanguage />} />
          <Route path="/report-settings" element={<ReportSettings />} />
          {/* // Notivix routes */}
          <Route path="/notivix/dashboard" element={<NotivixDashboard />} />
          <Route path="/notivix/dashboard/:id" element={<NotivixDashboard />} />
          <Route path="/notivix/notification" element={<Notification />} />
          <Route
            path="/notivix/notification-types"
            element={<Notification />}
          />
          <Route
            path="/notivix/notification-types/add"
            element={<AddNotificationTypes />}
          />
          <Route
            path="/notivix/notification-types/edit/:id"
            element={<EditNotificationTypes />}
          />
          <Route path="/notivix/settings/users" element={<Users />} />
          <Route path="/notivix/permissions" element={<Permissions />} />
          <Route path="/notivix/settings/roles" element={<Roles />} />
          <Route
            path="/notivix/settings/organization"
            element={<Organization />}
          />
          <Route
            path="/notivix/data-source/:id"
            element={<NotivixDataSource />}
          />
          <Route
            path="/notivix/validation-errors/:id"
            element={<ValidationErrors />}
          />
        </Route>
      </Route>

      {/* Super Admin Protected Routes */}
      <Route element={<SuperAdminProtect />}>
        <Route element={<CommonLayout />}>
          <Route path="/superadmin/dashboard" element={<Dashboard />} />
          <Route path="/attribute-option" element={<AttributeOption />} />
        </Route>
      </Route>

      {/* Admin and Super Admin Protected Routes */}
      <Route element={<AdminSuperAdminProtect />}>
        <Route element={<CommonLayout />}>
          <Route path="/create-theme" element={<CreateTheme />} />
        </Route>
      </Route>

      <Route element={<AuthProtect />}>
        <Route element={<CommonLayout />}>
          <Route path="/themes" element={<DashboardThemePage />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;
