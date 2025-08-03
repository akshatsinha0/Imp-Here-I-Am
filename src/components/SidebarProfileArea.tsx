import UserProfileDropdown from "@/components/UserProfileDropdown";
import { Tables } from "@/lib/types";
type UserProfile = Tables<"user_profiles">;
export default function SidebarProfileArea({
  myProfile,
  user,
  handleLogout,
}: {
  myProfile: UserProfile | null;
  user: { email: string };
  handleLogout: () => void;
}) {
  return (
    <div className="mt-6">
      <UserProfileDropdown
        user={user}
        profile={myProfile}
        onLogout={handleLogout}
        className="border w-full"
      />
    </div>
  );
}