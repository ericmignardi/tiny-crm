import { PostgrestError } from "@supabase/supabase-js";
import { parseISO } from "date-fns";
import { createContext, useCallback, useState } from "react";
import { supabase } from "../lib/supabase";

export type InteractionType =
  | "text"
  | "call"
  | "email"
  | "in_person"
  | "video"
  | "other";

export type Interaction = {
  id: string;
  user_id: string;
  person_id: string;
  interaction_type: InteractionType;
  happened_at: string;
  notes: string | null;
  created_at: string;
};

export type InteractionInput = {
  person_id: string;
  interaction_type: InteractionType;
  happened_at: string;
  notes?: string | null;
};

type CreateResult = {
  data: Interaction | null;
  error: PostgrestError | null;
  lastContactedAtUpdated: boolean;
};

type InteractionsContextType = {
  interactionsByPerson: Record<string, Interaction[]>;
  loadingByPerson: Record<string, boolean>;
  errorByPerson: Record<string, string | null>;
  findInteractionsByPersonId: (
    personId: string,
  ) => Promise<PostgrestError | null>;
  createInteraction: (input: InteractionInput) => Promise<CreateResult>;
  deleteInteraction: (
    interaction: Pick<Interaction, "id" | "person_id">,
  ) => Promise<PostgrestError | null>;
};

export const InteractionsContext = createContext<
  InteractionsContextType | undefined
>(undefined);

const toIsoDateOnly = (isoTimestamp: string): string =>
  isoTimestamp.slice(0, 10);

export const InteractionsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [interactionsByPerson, setInteractionsByPerson] = useState<
    Record<string, Interaction[]>
  >({});
  const [loadingByPerson, setLoadingByPerson] = useState<
    Record<string, boolean>
  >({});
  const [errorByPerson, setErrorByPerson] = useState<
    Record<string, string | null>
  >({});

  const findInteractionsByPersonId = useCallback(
    async (personId: string): Promise<PostgrestError | null> => {
      setLoadingByPerson((current) => ({ ...current, [personId]: true }));
      setErrorByPerson((current) => ({ ...current, [personId]: null }));

      const { data, error } = await supabase
        .from("interactions")
        .select("*")
        .eq("person_id", personId)
        .order("happened_at", { ascending: false });

      if (error) {
        setErrorByPerson((current) => ({
          ...current,
          [personId]: error.message,
        }));
      } else {
        setInteractionsByPerson((current) => ({
          ...current,
          [personId]: (data as Interaction[]) ?? [],
        }));
      }
      setLoadingByPerson((current) => ({ ...current, [personId]: false }));
      return error;
    },
    [],
  );

  const createInteraction = useCallback(
    async (input: InteractionInput): Promise<CreateResult> => {
      const { data, error } = await supabase
        .from("interactions")
        .insert({
          person_id: input.person_id,
          interaction_type: input.interaction_type,
          happened_at: input.happened_at,
          notes: input.notes ?? null,
        })
        .select()
        .single();

      if (error || !data) {
        return { data: null, error, lastContactedAtUpdated: false };
      }

      const interaction = data as Interaction;

      setInteractionsByPerson((current) => {
        const existing = current[interaction.person_id] ?? [];
        const next = [interaction, ...existing].sort(
          (a, b) =>
            parseISO(b.happened_at).getTime() -
            parseISO(a.happened_at).getTime(),
        );
        return { ...current, [interaction.person_id]: next };
      });

      let lastContactedAtUpdated = false;
      const newContactDate = toIsoDateOnly(interaction.happened_at);

      const { data: person, error: personFetchError } = await supabase
        .from("people")
        .select("last_contacted_at")
        .eq("id", interaction.person_id)
        .single();

      if (!personFetchError && person) {
        const current = (person as { last_contacted_at: string | null })
          .last_contacted_at;
        if (!current || newContactDate > current) {
          const { error: updateError } = await supabase
            .from("people")
            .update({ last_contacted_at: newContactDate })
            .eq("id", interaction.person_id);
          if (!updateError) lastContactedAtUpdated = true;
        }
      }

      return { data: interaction, error: null, lastContactedAtUpdated };
    },
    [],
  );

  const deleteInteraction = useCallback(
    async ({
      id,
      person_id,
    }: Pick<Interaction, "id" | "person_id">): Promise<PostgrestError | null> => {
      const { error } = await supabase
        .from("interactions")
        .delete()
        .eq("id", id);
      if (!error) {
        setInteractionsByPerson((current) => ({
          ...current,
          [person_id]: (current[person_id] ?? []).filter((i) => i.id !== id),
        }));
      }
      return error;
    },
    [],
  );

  return (
    <InteractionsContext.Provider
      value={{
        interactionsByPerson,
        loadingByPerson,
        errorByPerson,
        findInteractionsByPersonId,
        createInteraction,
        deleteInteraction,
      }}
    >
      {children}
    </InteractionsContext.Provider>
  );
};
