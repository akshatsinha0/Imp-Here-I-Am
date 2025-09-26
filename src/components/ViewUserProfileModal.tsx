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
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full mt-2">
            {profile.phone && <div className="text-sm"><span className="text-muted-foreground">Phone: </span>{profile.phone}</div>}
            {profile.location && <div className="text-sm"><span className="text-muted-foreground">Location: </span>{profile.location}</div>}
            {profile.bio && <div className="col-span-full text-sm"><span className="text-muted-foreground">About: </span>{profile.bio}</div>}
            {profile.skills && <div className="col-span-full text-sm"><span className="text-muted-foreground">Skills: </span>{profile.skills}</div>}
            {profile.interests && <div className="col-span-full text-sm"><span className="text-muted-foreground">Interests: </span>{profile.interests}</div>}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}