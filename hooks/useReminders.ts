import { useContext } from "react";
import { RemindersContext } from "../context/reminders-context";

export const useReminders = () => {
  const context = useContext(RemindersContext);
  if (!context) {
    throw new Error("useReminders must be used within a RemindersProvider");
  }
  return context;
};
