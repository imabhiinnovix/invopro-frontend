import { ReactNode } from "react";
import AuthProvider from "./AuthContext";
import GeneralProvider from "./GeneralContext";
import ExpandScreenProvider from "./ExpandScreenContext";

interface MainProviderProps {
  children: ReactNode;
}

const MainProvider = ({ children }: MainProviderProps) => {
  return (
    <AuthProvider>
      <GeneralProvider>
          <ExpandScreenProvider>{children}</ExpandScreenProvider>
      </GeneralProvider>
    </AuthProvider>
  );
};

export default MainProvider;
