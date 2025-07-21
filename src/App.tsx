import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./store";
// import { ThemeProvider } from "@mui/material/styles";
// import { theme } from "./theme/theme";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { NavProvider } from "./context/NavContext";
import AuthProvider from "./context/AuthContext";
import AppRoutes from "./routes";
import UnifiedThemeProvider from "./providers/UnifiedThemeProvider";

function App() {
  return (
    <Provider store={store}>
      <UnifiedThemeProvider>
        {/* <ThemeProvider theme={theme}> */}
        <BrowserRouter>
          <AuthProvider>
            <NavProvider>
                <AppRoutes />
                <ToastContainer />
            </NavProvider>
          </AuthProvider>
        </BrowserRouter>
        {/* </ThemeProvider> */}
      </UnifiedThemeProvider>
    </Provider>
  );
}

export default App;
