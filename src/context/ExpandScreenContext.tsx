import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useState,
} from "react";

interface ExpandScreenProviderProps {
  children: ReactNode;
}

export interface ExpandScreenContextType {
  screen: "normal" | "expand" | "fullyExpand";
  setScreen: Dispatch<SetStateAction<"normal" | "expand" | "fullyExpand">>;
}

export const ExpandScreenContext =
  createContext<ExpandScreenContextType | null>(null);

const ExpandScreenProvider = ({ children }: ExpandScreenProviderProps) => {
  const [screen, setScreen] = useState<"normal" | "expand" | "fullyExpand">(
    "normal"
  );
  return (
    <ExpandScreenContext.Provider
      value={{
        screen,
        setScreen,
      }}
    >
      {children}
    </ExpandScreenContext.Provider>
  );
};

export default ExpandScreenProvider;
