// import { useState } from "react";
// import type { PageId } from "./types";

// import { Sidebar } from "./components/Sidebar";
// import { Topbar } from "./components/Topbar";
// import { AIAssistant } from "./components/AIAssistant";
// // import { Toast } from "./components/ui/Toast";
// import { ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import { Home } from "./pages/Home";
// import { InvoiceReview } from "./pages/InvoiceReview";
// import { InvoiceDetail } from "./pages/InvoiceDetail";
// import { VendorCreate } from "./pages/VendorCreate";
// import { UsersRoles } from "./pages/UsersRoles";
// import { Onboarding } from "./pages/Onboarding";
// import { ExecDashboard } from "./pages/ExecDashboard";
// import { VendorBench } from "./pages/VendorBench";
// import { AddUser, AddRole } from "./pages/AddRoleAddUser"; // ✅ ADD

// import { InvoiceList } from "./pages/InvoiceList";
// import { Upload } from "./pages/Upload";
// import { Vendors } from "./pages/Vendors";
// import { VendorRateCards } from "./pages/VendorRateCards";
// import { Login } from "./pages/Login";
// import { getAuthToken } from "./utils/handleLocalStorage";

// // ✅ ADDED
// import { AuditTrailPage } from "./pages/AuditTrail";

// const PAGE_TITLES: Record<PageId, string> = {
//   home: "Home",
//   upload: "Data Upload",
//   "inv-list": "Invoice List",
//   "inv-review": "Invoice Review & Audit",
//   "inv-detail": "Invoice Detail — INV-1021",
//   vendors: "Vendors",
//   "vendor-create": "Create Vendor",
//   roles: "Users & Roles",
//   exec: "Executive Dashboard",
//   activity: "Activity Analytics",
//   bench: "Vendor Benchmarking",
//   onboard: "Client Onboarding",
//   "add-user": "Invite User", 
//   "add-role": "Create Role",
//   "vendor-rate-card": "Vendor Rate Card",
// };

// export default function App() {
//   const [page, setPage] = useState<PageId>("home");

//   // ✅ ADDED
//   const [params, setParams] = useState<any>(null);

//   const [collapsed, setCollapsed] = useState(false);
//   const [aiOpen, setAiOpen] = useState(false);
//   // const [toast, setToast] = useState("");
//   const [isLoggedIn, setIsLoggedIn] = useState(() => !!getAuthToken());

//   // ✅ UPDATED navigate (supports params)
//   const navigate = (p: PageId, params?: any) => {
//     setPage(p);
//     setParams(params || null);
//   };

// return (
//     <>
//       {!isLoggedIn ? (
//         <Login onLogin={() => setIsLoggedIn(true)} />
//       ) : (
//         <div
//           style={{
//             display: "flex",
//             minHeight: "100vh",
//             background: "#F4F6FB",
//             fontFamily: "'Segoe UI',system-ui,sans-serif",
//             color: "#1A1D2E",
//           }}
//         >
//            <Sidebar
//         active={page}
//         onNav={navigate}
//         collapsed={collapsed}
//         onToggle={() => setCollapsed((c) => !c)}
//       />

//       <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
//         <Topbar title={PAGE_TITLES[page]} onAIToggle={() => setAiOpen((o) => !o)} />

//         <div style={{ flex: 1, overflowY: "auto" }}>
//           {page === "home" && <Home onNavigate={navigate} />}
//           {page === "upload" && <Upload onNavigate={navigate} />}
//           {page === "inv-list" && <InvoiceList onNavigate={navigate} />}
//           {page === "inv-review" && <InvoiceReview onNavigate={navigate} />}
//           {page === "inv-detail" && <InvoiceDetail onNavigate={navigate} />}
//           {page === "vendors" && <Vendors onNavigate={navigate} />}
//           {page === "vendor-create" && <VendorCreate onNavigate={navigate} />}
//           {page === "roles" && <UsersRoles onNavigate={navigate} />}
//           {page === "exec" && <ExecDashboard onNavigate={navigate} />}
//           {page === "activity" && <VendorBench onNavigate={navigate} />}
//           {page === "bench" && <VendorBench onNavigate={navigate} />}
//           {page === "onboard" && <Onboarding onNavigate={navigate} />}
//           {page === "add-user" && (
//   <AddUser onBack={() => navigate("roles")} />
// )}

// {page === "add-role" && (
//   <AddRole onBack={() => navigate("roles")} />
// )}
// {page === "vendor-rate-card" && (
//   <VendorRateCards
//     onBack={() => navigate("vendors")}   // ✅ REQUIRED
//   />
// )}

//           {/* ✅ ADDED AUDIT TRAIL PAGE */}
//           {page === "audit-trail" && (
//             <AuditTrailPage onNavigate={navigate} params={params} />
//           )}
//         </div>
//       </div>

//       <AIAssistant open={aiOpen} onClose={() => setAiOpen(false)} />
//       {/* <Toast message={toast} visible={Boolean(toast)} onHide={() => setToast("")} /> */}
//         </div>
//       )}

//       <ToastContainer
//         position="top-right"
//         autoClose={3000}
//         hideProgressBar={false}
//         newestOnTop
//         closeOnClick
//         pauseOnHover
//         style={{ zIndex: 999999 }}
//       />
//     </>
//   );
// }


import { useState } from "react";
import { useLocation, Navigate } from "react-router-dom";

import { Sidebar } from "./components/Sidebar";
import { Topbar } from "./components/Topbar";
import { AIAssistant } from "./components/AIAssistant";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import AppRoutes from "./routes";
import { getAuthToken } from "./utils/handleLocalStorage";

const PAGE_TITLES: Record<string, string> = {
  "/home": "Home",
  "/upload": "Data Upload",
  "/invoice-list": "Invoice List",
  "/invoice-review": "Invoice Review & Audit",
  "/invoice-detail": "Invoice Detail",
  "/vendors": "Vendors",
  "/vendor-create": "Create Vendor",
  "/roles": "Users & Roles",
  "/exec": "Executive Dashboard",
  "/activity": "Activity Analytics",
  "/bench": "Vendor Benchmarking",
  "/onboarding": "Client Onboarding",
  "/add-user": "Invite User",
  "/add-role": "Create Role",
  "/vendor-rate-card": "Vendor Rate Card",
  "/audit-trail": "Audit Trail",
};

export default function App() {
  const location = useLocation();

  const [collapsed, setCollapsed] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);

  const isLoggedIn = !!getAuthToken();

  if (!isLoggedIn && location.pathname !== "/login") {
    return <Navigate to="/login" replace />;
  }

  if (location.pathname === "/login") {
    return (
      <>
        <AppRoutes />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnHover
          style={{ zIndex: 999999 }}
        />
      </>
    );
  }

  return (
    <>
      <div
        style={{
          display: "flex",
          minHeight: "100vh",
          background: "#F4F6FB",
          fontFamily: "'Segoe UI',system-ui,sans-serif",
          color: "#1A1D2E",
        }}
      >
        <Sidebar
          active={location.pathname}
          collapsed={collapsed}
          onToggle={() => setCollapsed((c) => !c)}
        />

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            minWidth: 0,
          }}
        >
          <Topbar
            title={PAGE_TITLES[location.pathname] || "Dashboard"}
            onAIToggle={() => setAiOpen((o) => !o)}
          />

          <div style={{ flex: 1, overflowY: "auto" }}>
            <AppRoutes />
          </div>
        </div>

        <AIAssistant
          open={aiOpen}
          onClose={() => setAiOpen(false)}
        />
      </div>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        style={{ zIndex: 999999 }}
      />
    </>
  );
}