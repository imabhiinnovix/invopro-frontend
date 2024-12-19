import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useState,
} from "react";

interface GeneralProviderProps {
  children: ReactNode;
}

export interface GeneralContextType {
  isSaving: boolean;
  setIsSaving: Dispatch<SetStateAction<boolean>>;
  sidebarWidth: "0%" | "20%";
  setSidebarWidth: Dispatch<SetStateAction<"0%" | "20%">>;
  adminSidebarWidth: "3%" | "20%";
  setAdminSidebarWidth: Dispatch<SetStateAction<"3%" | "20%">>;
  readingPanePlace: "left" | "right" | "bottom" | "top";
  setReadingPanePlace: Dispatch<
    SetStateAction<"left" | "right" | "bottom" | "top">
  >;
}

export const GeneralContext = createContext<GeneralContextType | null>(null);

const GeneralProvider = ({ children }: GeneralProviderProps) => {
  const [isSaving, setIsSaving] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState<"0%" | "20%">("20%");
  const [adminSidebarWidth, setAdminSidebarWidth] = useState<"3%" | "20%">(
    "20%"
  );
  const [readingPanePlace, setReadingPanePlace] = useState<
    "left" | "right" | "bottom" | "top"
  >("top");

  return (
    <GeneralContext.Provider
      value={{
        isSaving,
        setIsSaving,
        sidebarWidth,
        setSidebarWidth,
        readingPanePlace,
        setReadingPanePlace,
        adminSidebarWidth,
        setAdminSidebarWidth,
      }}
    >
      {children}
    </GeneralContext.Provider>
  );
};

export default GeneralProvider;
