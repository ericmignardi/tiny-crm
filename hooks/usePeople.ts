import { useContext } from "react";
import { PeopleContext } from "../context/people-context";

export const usePeople = () => {
  const context = useContext(PeopleContext);
  if (!context) {
    throw new Error("usePeople must be used within a PeopleProvider");
  }
  return context;
};
