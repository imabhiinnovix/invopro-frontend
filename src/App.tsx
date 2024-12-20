import { useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Login from './pages/login';
import Header from './components/molecule/header';
import { Box } from '@mui/material';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        {/* <Route path="/otp-login" element={<SendOTP />} />
          <Route path="/otp-login/otp" element={<VerifyOTP />} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
