import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Login from './pages/login';
import Header from './components/molecule/header';
import './App.css';
import SendOTP from './pages/loginOTP/sendOTP';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import VerifyOTP from './pages/loginOTP/verifyOTP';

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
        </Routes>
      </BrowserRouter>
      <ToastContainer />
    </>
  );
}

export default App;
