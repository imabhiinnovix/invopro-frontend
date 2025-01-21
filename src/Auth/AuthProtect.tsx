import { Navigate, Outlet } from 'react-router-dom';
// import { roleId } from '../utils/constants';
import { getAuthToken } from '../utils/handleLocalStorage';

const AuthProtect = () => {
  const token = getAuthToken();
  // const currentRoleId = getRoleId();

  if (!token) {
    return <Navigate to="/login" />;
  }

  // if (Number(currentRoleId) === roleId?.SUPER_ADMIN) {
  //   return <Navigate to="/superadmin/dashboard" />;
  // }

  return <Outlet />;
};

export default AuthProtect;
