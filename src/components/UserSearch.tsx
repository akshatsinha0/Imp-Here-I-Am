import { useState } from "react";
import { Input } from "@/components/ui/input";
import { User } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Tables } from "@/lib/types";
import UserBrief from "@/components/UserBrief";
import { useAuthUser } from "@/hooks/useAuthUser";
type UserProfile = Tables<"user_profiles">;
interface UserSearchProps {
  onSelect: (profile: UserProfile) => void;
}
export default function UserSearch({ onSelect }: UserSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuthUser();
  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (!val || val.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from("user_profiles")
      .select("*")
      .or(`display_name.ilike.%${val}%,email.ilike.%${val}%`);
    setResults(
      data?.filter((p) => p.id !== user?.id) || []
    );
    setLoading(false);
  };
  return (
    <div className="mb-2">
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          <User className="w-4 h-4" />
        </span>
        <Input
          placeholder="Search users..."
          value={query}
          onChange={handleChange}
          className="mb-2 pl-10"
          autoComplete="off"
        />
      </div>
      {loading && <div className="text-xs text-muted-foreground px-2">Searching...</div>}
      {!loading && !!results.length && (
        <div className="border rounded bg-background z-50 shadow-lg mt-1">
          {results.slice(0, 6).map((profile) => (
            <button
              className="flex items-center gap-2 w-full text-left p-2 hover:bg-accent"
              key={profile.id}
              onClick={() => {
                setQuery("");
                setResults([]);
                onSelect(profile);
              }}
            >
              <UserBrief profile={profile} size={8} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}