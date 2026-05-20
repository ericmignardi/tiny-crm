import { PostgrestError } from "@supabase/supabase-js";
import { createContext, useCallback, useState } from "react";
import { supabase } from "../lib/supabase";

export type RelationshipType =
  | "friend"
  | "family"
  | "work"
  | "mentor"
  | "neighbor"
  | "community"
  | "other";

export type ContactMethod =
  | "text"
  | "call"
  | "email"
  | "in_person"
  | "video"
  | "other";

export type Person = {
  id: string;
  user_id: string;
  name: string;
  relationship_type: RelationshipType | null;
  birthday: string | null;
  phone: string | null;
  email: string | null;
  notes: string | null;
  preferred_contact_method: ContactMethod | null;
  follow_up_interval_days: number | null;
  last_contacted_at: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

export type PersonInput = {
  name: string;
  relationship_type?: RelationshipType | null;
  birthday?: string | null;
  phone?: string | null;
  email?: string | null;
  notes?: string | null;
  preferred_contact_method?: ContactMethod | null;
  follow_up_interval_days?: number | null;
  last_contacted_at?: string | null;
  avatar_url?: string | null;
};

type PeopleContextType = {
  people: Person[];
  loading: boolean;
  error: string | null;
  findAllPeople: () => Promise<PostgrestError | null>;
  findPersonById: (
    id: string,
  ) => Promise<{ data: Person | null; error: PostgrestError | null }>;
  createPerson: (
    input: PersonInput,
  ) => Promise<{ data: Person | null; error: PostgrestError | null }>;
  updatePerson: (
    id: string,
    updates: Partial<PersonInput>,
  ) => Promise<{ data: Person | null; error: PostgrestError | null }>;
  deletePerson: (id: string) => Promise<PostgrestError | null>;
  applyLastContactedAt: (id: string, lastContactedAt: string) => void;
};

export const PeopleContext = createContext<PeopleContextType | undefined>(
  undefined,
);

export const PeopleProvider = ({ children }: { children: React.ReactNode }) => {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const findAllPeople = useCallback(async (): Promise<PostgrestError | null> => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("people")
      .select("*")
      .order("name", { ascending: true });
    if (error) {
      setError(error.message);
      setPeople([]);
    } else {
      setPeople((data as Person[]) ?? []);
    }
    setLoading(false);
    return error;
  }, []);

  const findPersonById = useCallback(async (id: string) => {
    const { data, error } = await supabase
      .from("people")
      .select("*")
      .eq("id", id)
      .single();
    return { data: (data as Person | null) ?? null, error };
  }, []);

  const createPerson = useCallback(async (input: PersonInput) => {
    const { data, error } = await supabase
      .from("people")
      .insert(input)
      .select()
      .single();
    if (!error && data) {
      setPeople((current) => [...current, data as Person]);
    }
    return { data: (data as Person | null) ?? null, error };
  }, []);

  const updatePerson = useCallback(
    async (id: string, updates: Partial<PersonInput>) => {
      const { data, error } = await supabase
        .from("people")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (!error && data) {
        setPeople((current) =>
          current.map((p) => (p.id === id ? (data as Person) : p)),
        );
      }
      return { data: (data as Person | null) ?? null, error };
    },
    [],
  );

  const deletePerson = useCallback(
    async (id: string): Promise<PostgrestError | null> => {
      const { error } = await supabase.from("people").delete().eq("id", id);
      if (!error) {
        setPeople((current) => current.filter((p) => p.id !== id));
      }
      return error;
    },
    [],
  );

  const applyLastContactedAt = useCallback(
    (id: string, lastContactedAt: string) => {
      setPeople((current) =>
        current.map((p) => {
          if (p.id !== id) return p;
          if (p.last_contacted_at && p.last_contacted_at >= lastContactedAt) {
            return p;
          }
          return { ...p, last_contacted_at: lastContactedAt };
        }),
      );
    },
    [],
  );

  return (
    <PeopleContext.Provider
      value={{
        people,
        loading,
        error,
        findAllPeople,
        findPersonById,
        createPerson,
        updatePerson,
        deletePerson,
        applyLastContactedAt,
      }}
    >
      {children}
    </PeopleContext.Provider>
  );
};
