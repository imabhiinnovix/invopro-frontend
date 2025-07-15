import { Route, Routes, Navigate } from 'react-router-dom';
import Login from './pages/login';
import SendOTP from './pages/loginOTP/sendOTP';
import VerifyOTP from './pages/loginOTP/verifyOTP';
import AuthProtect from './Auth/AuthProtect';
import SuperAdminProtect from './Auth/SuperAdminProtect';
import AdminSuperAdminProtect from './Auth/AdminSuperAdminProtect';
import Dashboard from './pages/dashboard';
import CommonLayout from './components/molecule/layout/commonLayout';
import AttributeOption from './pages/attributeOption';
import Report from './pages/report';
import DataSources from './pages/dataSources';
import DashboardOverview from './pages/dashboard/overview';
import DashboardAnalytics from './pages/dashboard/analytics';
import CreateTheme from './pages/createTheme';
import DashboardThemePage from './pages/dashboardTheme';
import { getAuthToken } from './utils/handleLocalStorage';
import NaturalLanguage from './pages/naturalLanguage/NaturalLanguage';
import Entity from './pages/entity';
import DataSource from './pages/dataSource';
import AIInsightPage from './pages/aiInsight';
import ReportSettings from './pages/report-settings';
import NotificationSettings from "./pages/notificationSettings";
import Users from "./pages/users";
import Roles from "./pages/roles";
import Organization from "./pages/organization/organization";
import NotifixDataSource from './pages/notifixDataSource';

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
          <Route path="/VixAi-Insights" element={<AIInsightPage />} />
          <Route path="/VixAi-Chart" element={<NaturalLanguage />} />
          <Route path="/report-settings" element={<ReportSettings />} />
          {/* // Notivix routes */}
          <Route path="/notivix/dashboard" element={<ReportSettings />} />
          <Route
            path="/notivix/notification-settings"
            element={<NotificationSettings />}
          />
           <Route
            path="/notivix/settings/users"
            element={<Users />}
          />
          <Route
            path="/notivix/settings/roles"
            element={<Roles />}
          />
          <Route
            path="/notivix/settings/organization"
            element={<Organization />}
          />
                    <Route path="/notivix/data-source/:id" element={<NotifixDataSource />} />

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
          <Route path="/themes" element={<DashboardThemePage />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;
