import { useNavigate } from "react-router-dom";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import UserBrief from "@/components/UserBrief";
import { Tables } from "@/lib/types";
type UserProfile = Tables<"user_profiles">;
export default function UserProfileDropdown({
  user,
  profile,
  onLogout,
  className = ""
}: {
  user: { email: string };
  profile: UserProfile | null;
  onLogout: () => void;
  className?: string;
}) {
  const navigate = useNavigate();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className={`w-full flex gap-3 items-center p-2 ${className}`}>
          <UserBrief profile={profile} size={9} className="flex-shrink-0" />
          <div className="flex-1 text-left min-w-0">
            <div className="text-base font-semibold truncate">{profile?.display_name || user.email}</div>
            <div className="text-xs text-muted-foreground truncate">{user.email}</div>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-52">
        <DropdownMenuItem onClick={() => navigate("/settings")}>
          <User className="w-4 h-4 mr-2" /> Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onLogout} className="text-destructive">
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}