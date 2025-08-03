import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tables } from "@/lib/types";
import UserBrief from "./UserBrief";
type UserProfile = Tables<"user_profiles">;
export default function ViewUserProfileModal({
  profile,
  open,
  onOpenChange,
}: {
  profile: UserProfile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!profile) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>User Profile</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4">
          <UserBrief profile={profile} size={12} />
          <div className="w-full text-center mt-2">
            <div className="font-semibold text-lg">{profile.display_name}</div>
            <div className="text-sm text-muted-foreground">{profile.email}</div>
            {profile.is_online && (
              <div className="inline-flex items-center mt-2 text-green-600 text-xs font-medium rounded px-2 py-1 bg-green-100">
                Online
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}