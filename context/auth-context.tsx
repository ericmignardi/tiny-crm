import { AuthError, Session } from "@supabase/supabase-js";
import { createContext, useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type AuthContextType = {
  session: Session | null;
  loading: boolean;
  error: string | null;
  signUp: (email: string, password: string) => Promise<AuthError | null>;
  signIn: (email: string, password: string) => Promise<AuthError | null>;
  signOut: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSession = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (error) {
        setError(error.message);
      }
      setSession(session);
      setLoading(false);
    };

    fetchSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUp = useCallback(
    async (email: string, password: string): Promise<AuthError | null> => {
      const { error } = await supabase.auth.signUp({ email, password });
      return error;
    },
    [],
  );

  const signIn = useCallback(
    async (email: string, password: string): Promise<AuthError | null> => {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return error;
    },
    [],
  );

  const signOut = useCallback(async (): Promise<void> => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      setError(error.message);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ signUp, signIn, signOut, session, loading, error }}
    >
      {children}
    </AuthContext.Provider>
  );
};
