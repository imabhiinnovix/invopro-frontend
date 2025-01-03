import { Navigate, Outlet } from 'react-router-dom';
import { roleId } from '../utils/constants';
import { getAuthToken, getRoleId } from '../utils/handleLocalStorage';

const AdminProtect = () => {
  const token = getAuthToken();
  const currentRoleId = getRoleId();

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (Number(currentRoleId) !== roleId?.ADMIN) {
    return <Navigate to="/dashboard" />;
  }

  return <Outlet />;
};

export default AdminProtect;
