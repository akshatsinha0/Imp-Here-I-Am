import { useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
}
export function useAuthUser() {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
  });
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setState({
        user: newSession?.user ?? null,
        session: newSession,
        loading: false,
      });
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState({
        user: session?.user ?? null,
        session: session,
        loading: false,
      });
    });
    return () => subscription.unsubscribe();
  }, []);
  return state;
}