import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Tables } from "@/lib/types";
export function useUserProfiles(ids: string[]) {
  const [profiles, setProfiles] = useState<Record<string, Tables<"user_profiles">>>({});
  useEffect(() => {
    async function fetchProfiles() {
      if (!ids.length) {
        setProfiles({});
        return;
      }
      const cleanIds = [...new Set(ids.filter(Boolean))];
      if (cleanIds.length === 0) {
        setProfiles({});
        return;
      }
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .in("id", cleanIds);
      if (error) {
        setProfiles({});
        return;
      }
      const byId: Record<string, Tables<"user_profiles">> = {};
      (data ?? []).forEach((p) => {
        byId[p.id] = p;
      });
      setProfiles(byId);
    }
    fetchProfiles();
  }, [JSON.stringify(ids)]);
  return profiles;
}