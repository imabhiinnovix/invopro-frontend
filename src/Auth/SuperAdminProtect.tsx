import { Navigate, Outlet } from "react-router-dom";
import { roleId } from "../utils/constants";
import { getAuthToken, getRoleId } from "../utils/handleLocalStorage";

const SuperAdminProtect = () => {
  const token = getAuthToken();
  const currentRoleId = getRoleId();

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (Number(currentRoleId) !== roleId?.SUPER_ADMIN) {
    return <Navigate to="/dashboard" />;
  }

  return <Outlet />;
};

export default SuperAdminProtect;
