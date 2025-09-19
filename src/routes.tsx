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
import ValidationErrors from "./pages/validationErrors";
import AcknowledgeNotification from "./pages/acknowledgeNotification";
import NotificationLogger from "./pages/notification/NotificationLogger";
import ProfilePage from "./pages/profilePage";

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
      <Route
        path="/notification/send-acknowledge-notification/:id"
        element={<AcknowledgeNotification />}
      />

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
          <Route path="/dashboard" element={<NotivixDashboard />} />
          <Route path="/dashboard/:id" element={<NotivixDashboard />} />
          <Route path="/notification" element={<Notification />} />
          <Route
            path="/notification-types"
            element={<Notification />}
          />
           <Route
            path="/notification-logs"
            element={<NotificationLogger />}
          />
          <Route
            path="/notification-types/add"
            element={<AddNotificationTypes />}
          />
          <Route
            path="/notification-types/edit/:id"
            element={<EditNotificationTypes />}
          />
          <Route path="/settings/users" element={<Users />} />
          <Route path="/permissions" element={<Permissions />} />
          {/* <Route path="/notivix/settings/roles" element={<Roles />} /> */}
                    <Route path="/roles" element={<Roles />} />

          <Route
            path="/organization"
            element={<Organization />}
          />
          <Route
            path="/data-source-new/:id"
            element={<NotivixDataSource />}
          />
          <Route
            path="/validation-errors/:id"
            element={<ValidationErrors />}
          />
           <Route
            path="/profile"
            element={<ProfilePage />}
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
