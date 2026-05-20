import { useContext } from "react";
import { InteractionsContext } from "../context/interactions-context";

export const useInteractions = () => {
  const context = useContext(InteractionsContext);
  if (!context) {
    throw new Error(
      "useInteractions must be used within an InteractionsProvider",
    );
  }
  return context;
};
