import { Route, Routes } from "react-router-dom";
import Login from "./pages/login";
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

const AppRoutes = () => {
  return (
    <Routes>
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
          <Route path="/data-source/:id" element={<DataSources />} />
        </Route>
      </Route>

      {/* Super Admin Protected Routes */}
      <Route element={<SuperAdminProtect />}>
        <Route element={<CommonLayout />}>
          <Route path="/superadmin/dashboard" element={<Dashboard />} />
          <Route path="/attribute-option" element={<AttributeOption />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes; 