import { PostgrestError } from "@supabase/supabase-js";
import { createContext, useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export type ReminderStatus = "pending" | "completed" | "dismissed";

export type Reminder = {
  id: string;
  user_id: string;
  person_id: string;
  title: string;
  remind_at: string;
  status: ReminderStatus;
  created_at: string;
  updated_at: string;
};

export type ReminderInput = {
  person_id: string;
  title: string;
  remind_at: string;
};

type RemindersContextType = {
  reminders: Reminder[];
  loading: boolean;
  error: string | null;
  findAllReminders: () => Promise<PostgrestError | null>;
  createReminder: (
    input: ReminderInput,
  ) => Promise<{ data: Reminder | null; error: PostgrestError | null }>;
  setReminderStatus: (
    id: string,
    status: ReminderStatus,
  ) => Promise<PostgrestError | null>;
};

export const RemindersContext = createContext<RemindersContextType | undefined>(
  undefined,
);

export const RemindersProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        setReminders([]);
        setError(null);
        setLoading(false);
      }
    });
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const findAllReminders = useCallback(async (): Promise<PostgrestError | null> => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("reminders")
      .select("*")
      .order("remind_at", { ascending: true });
    if (error) {
      setError(error.message);
      setReminders([]);
    } else {
      setReminders((data as Reminder[]) ?? []);
    }
    setLoading(false);
    return error;
  }, []);

  const createReminder = useCallback(async (input: ReminderInput) => {
    const { data, error } = await supabase
      .from("reminders")
      .insert(input)
      .select()
      .single();
    if (!error && data) {
      setReminders((current) => {
        const next = [...current, data as Reminder];
        next.sort((a, b) => a.remind_at.localeCompare(b.remind_at));
        return next;
      });
    }
    return { data: (data as Reminder | null) ?? null, error };
  }, []);

  const setReminderStatus = useCallback(
    async (
      id: string,
      status: ReminderStatus,
    ): Promise<PostgrestError | null> => {
      const { data, error } = await supabase
        .from("reminders")
        .update({ status })
        .eq("id", id)
        .select()
        .single();
      if (!error && data) {
        setReminders((current) =>
          current.map((r) => (r.id === id ? (data as Reminder) : r)),
        );
      }
      return error;
    },
    [],
  );

  return (
    <RemindersContext.Provider
      value={{
        reminders,
        loading,
        error,
        findAllReminders,
        createReminder,
        setReminderStatus,
      }}
    >
      {children}
    </RemindersContext.Provider>
  );
};
