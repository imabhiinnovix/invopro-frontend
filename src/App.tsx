import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./store";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "./theme/theme";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { NavProvider } from "./context/NavContext";
import AuthProvider from "./context/AuthContext";
import { DashboardThemeProvider } from "./context/DashboardThemeProvider";
import AppRoutes from "./routes";

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <BrowserRouter>
          <AuthProvider>
            <NavProvider>
              <DashboardThemeProvider>
                <AppRoutes />
                <ToastContainer />
              </DashboardThemeProvider>
            </NavProvider>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
