import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./store";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { NavProvider } from "./context/NavContext";
import AuthProvider from "./context/AuthContext";
import AppRoutes from "./routes";
import UnifiedThemeProvider from "./providers/UnifiedThemeProvider";
import { GlobalPollingManager } from "./components/common/importFile/ImportFile";
import "./App.css";

function App() {
  return (
    <Provider store={store}>
      <UnifiedThemeProvider>
        <BrowserRouter>
          <GlobalPollingManager />
          <AuthProvider>
            <NavProvider>
              <AppRoutes />
              <ToastContainer />
            </NavProvider>
          </AuthProvider>
        </BrowserRouter>
      </UnifiedThemeProvider>
    </Provider>
  );
}

export default App;
