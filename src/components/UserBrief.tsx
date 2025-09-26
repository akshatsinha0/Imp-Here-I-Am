import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tables } from "@/lib/types";
type UserProfile = Tables<"user_profiles">;
export default function UserBrief({
  profile,
  size = 8,
  className = ""
}: {
  profile: UserProfile | null | undefined;
  size?: number;
  className?: string;
}) {
  if (!profile) return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Avatar className={`w-${size} h-${size}`}>
        <AvatarFallback>?</AvatarFallback>
      </Avatar>
      <span className="truncate text-sm text-muted-foreground italic">Unknown</span>
    </div>
  );
  const firstLetter = (profile.display_name || profile.email || "?").charAt(0).toUpperCase();
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Avatar className={`w-${size} h-${size}`}>
        <AvatarImage src={profile.avatar_url || undefined} />
        <AvatarFallback>{firstLetter}</AvatarFallback>
      </Avatar>
      <span className="truncate text-sm">{profile.display_name || profile.email}</span>
    </div>
  );
}