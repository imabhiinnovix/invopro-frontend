import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Login from './pages/login';
import Header from './components/molecule/header';
import './App.css';
import SendOTP from './pages/loginOTP/sendOTP';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import VerifyOTP from './pages/loginOTP/verifyOTP';
import AuthProtect from './Auth/AuthProtect';
import SuperAdminProtect from './Auth/SuperAdminProtect';
import Dashboard from './pages/dashboard';
import CommonLayout from './components/molecule/layout/commonLayout';
import Entity from './pages/entity';
import AttributeOption from './pages/attributeOption';
import DataSource from './pages/dataSource';

function App() {
  return (
    <>
      <BrowserRouter>
        <Header />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/otp-login" element={<SendOTP />} />
          <Route path="/otp-login/otp" element={<VerifyOTP />} />

          {/* User Protected Routes */}
          <Route element={<AuthProtect />}>
            <Route element={<CommonLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/entity" element={<Entity />} />
              <Route path="/attribute-option" element={<AttributeOption />} />
              <Route path="/data-source" element={<DataSource />} />
            </Route>
          </Route>

          {/* Super Admin Protected Routes */}
          <Route element={<SuperAdminProtect />}>
            <Route element={<CommonLayout />}>
              {/* <Route path='/entity' element={<Entity />}/> */}
              <Route path="/superadmin/dashboard" element={<Dashboard />} />
              <Route path="/attribute-option" element={<AttributeOption />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
      <ToastContainer />
    </>
  );
}

export default App;
