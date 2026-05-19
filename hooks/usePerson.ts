import { useContext } from "react";
import { PeopleContext } from "../context/people-context";

export const usePerson = () => {
  const context = useContext(PeopleContext);
  if (!context) {
    throw new Error("usePerson must be used within a PeopleProvider");
  }
  return context;
};
