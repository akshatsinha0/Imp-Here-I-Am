import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthUser } from "@/hooks/useAuthUser";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Settings as SettingsIcon, MapPin, Phone, Mail, User, Edit3, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EditProfileDialog } from "@/components/EditProfileDialog";
import { useState } from "react";
export default function Settings() {
  const { user } = useAuthUser();
  const [profileData, setProfileData] = useState({
    displayName: (user?.email || "").split("@")[0] || "User",
    email: user?.email || "",
    phone: "",
    location: "",
    bio: "",
    skills: "",
    interests: ""
  });
  const initials = (user?.email || "?").slice(0, 2).toUpperCase();
  const handleProfileUpdate = (field: string) => (data: Record<string, string>) => {
    setProfileData(prev => ({ ...prev, ...data }));
    console.log(`Updated ${field}:`, data);
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-purple-600 via-pink-400 to-yellow-300 dark:from-blue-900 dark:via-fuchsia-900 dark:to-amber-800 transition-colors duration-500 animate-fade-in">
      <Card className="relative w-full max-w-2xl my-12 rounded-3xl shadow-2xl border-0 bg-white/70 dark:bg-background/80 backdrop-blur-md transition-all"
        style={{
          boxShadow: "0 10px 40px 0 rgba(148,72,210,0.15), 0 2px 4px rgba(48,44,80,0.07)",
          border: "2px solid #d946ef20",
        }}>
        <div className="absolute -inset-1 bg-gradient-to-tr from-pink-400/60 via-purple-400/40 to-yellow-300/50 rounded-3xl blur-xl z-0 pointer-events-none" />
        <div className="relative h-32 bg-gradient-to-br from-indigo-400 via-pink-400 to-amber-400 rounded-t-3xl overflow-hidden">
          <Button
            size="icon"
            variant="ghost"
            className="absolute top-4 right-4 text-white hover:bg-white/20"
            onClick={() => console.log("Change cover photo")}
          >
            <Camera className="w-5 h-5" />
          </Button>
        </div>
        <CardHeader className="flex flex-col items-center text-center relative z-10 -mt-16">
          <div className="relative group mb-4">
            <Avatar className="w-32 h-32 bg-gradient-to-br from-primary/80 to-secondary/50 border-4 border-white shadow-xl group-hover:scale-105 transition-transform duration-300">
              <AvatarFallback className="text-4xl font-bold text-white bg-gradient-to-tr from-purple-500 via-pink-400 to-yellow-300 animate-fade-in">
                {initials}
              </AvatarFallback>
            </Avatar>
            <Button
              size="icon"
              variant="secondary"
              className="absolute bottom-2 right-2 w-8 h-8 rounded-full shadow-lg"
              onClick={() => console.log("Change profile photo")}
            >
              <Camera className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <CardTitle className="text-2xl font-extrabold bg-gradient-to-r from-purple-700 via-pink-600 to-yellow-500 dark:from-blue-300 dark:via-fuchsia-400 dark:to-orange-300 bg-clip-text text-transparent leading-tight tracking-tight animate-fade-in">
              {profileData.displayName}
            </CardTitle>
            <EditProfileDialog
              title="Display Name"
              fields={[
                {
                  name: 'displayName',
                  label: 'Display Name',
                  value: profileData.displayName,
                  placeholder: 'Enter your display name'
                }
              ]}
              onSave={handleProfileUpdate('displayName')}
              trigger={
                <Button size="icon" variant="ghost" className="w-6 h-6">
                  <Edit3 className="w-4 h-4" />
                </Button>
              }
            />
          </div>
        </CardHeader>
        <CardContent className="pt-0 relative z-10 px-8 pb-8">
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-bl from-pink-100/80 via-yellow-100/80 to-purple-100/80 dark:from-fuchsia-950/70 dark:via-indigo-950/80 dark:to-amber-900/60 shadow transition group hover:bg-yellow-50 hover:shadow-lg">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-purple-600" />
                  <div>
                    <div className="text-xs text-muted-foreground font-medium mb-1">Email</div>
                    <div className="font-semibold text-accent-foreground dark:text-white">
                      {profileData.email}
                    </div>
                  </div>
                </div>
                <EditProfileDialog
                  title="Email"
                  fields={[
                    {
                      name: 'email',
                      label: 'Email Address',
                      value: profileData.email,
                      placeholder: 'Enter your email address'
                    }
                  ]}
                  onSave={handleProfileUpdate('email')}
                />
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-bl from-pink-100/80 via-yellow-100/80 to-purple-100/80 dark:from-fuchsia-950/70 dark:via-indigo-950/80 dark:to-amber-900/60 shadow transition group hover:bg-yellow-50 hover:shadow-lg">
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-purple-600" />
                  <div>
                    <div className="text-xs text-muted-foreground font-medium mb-1">Phone</div>
                    <div className="font-semibold text-accent-foreground dark:text-white">
                      {profileData.phone || "Add phone number"}
                    </div>
                  </div>
                </div>
                <EditProfileDialog
                  title="Phone Number"
                  fields={[
                    {
                      name: 'phone',
                      label: 'Phone Number',
                      value: profileData.phone,
                      placeholder: 'Enter your phone number'
                    }
                  ]}
                  onSave={handleProfileUpdate('phone')}
                />
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-bl from-pink-100/80 via-yellow-100/80 to-purple-100/80 dark:from-fuchsia-950/70 dark:via-indigo-950/80 dark:to-amber-900/60 shadow transition group hover:bg-yellow-50 hover:shadow-lg">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-purple-600" />
                  <div>
                    <div className="text-xs text-muted-foreground font-medium mb-1">Location</div>
                    <div className="font-semibold text-accent-foreground dark:text-white">
                      {profileData.location || "Add location"}
                    </div>
                  </div>
                </div>
                <EditProfileDialog
                  title="Location"
                  fields={[
                    {
                      name: 'location',
                      label: 'Location',
                      value: profileData.location,
                      placeholder: 'Enter your location'
                    }
                  ]}
                  onSave={handleProfileUpdate('location')}
                />
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-accent-foreground dark:text-white">About</h3>
                <EditProfileDialog
                  title="Bio"
                  fields={[
                    {
                      name: 'bio',
                      label: 'Bio',
                      value: profileData.bio,
                      type: 'textarea',
                      placeholder: 'Tell others about yourself...'
                    }
                  ]}
                  onSave={handleProfileUpdate('bio')}
                />
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-bl from-pink-100/80 via-yellow-100/80 to-purple-100/80 dark:from-fuchsia-950/70 dark:via-indigo-950/80 dark:to-amber-900/60 shadow">
                <p className="text-sm text-muted-foreground">
                  {profileData.bio || "Add a bio to tell others about yourself..."}
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-accent-foreground dark:text-white">Skills</h3>
                <EditProfileDialog
                  title="Skills"
                  fields={[
                    {
                      name: 'skills',
                      label: 'Skills',
                      value: profileData.skills,
                      type: 'textarea',
                      placeholder: 'List your skills and expertise...'
                    }
                  ]}
                  onSave={handleProfileUpdate('skills')}
                />
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-bl from-pink-100/80 via-yellow-100/80 to-purple-100/80 dark:from-fuchsia-950/70 dark:via-indigo-950/80 dark:to-amber-900/60 shadow">
                <p className="text-sm text-muted-foreground">
                  {profileData.skills || "Add your skills and expertise..."}
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-accent-foreground dark:text-white">Interests</h3>
                <EditProfileDialog
                  title="Interests"
                  fields={[
                    {
                      name: 'interests',
                      label: 'Interests',
                      value: profileData.interests,
                      type: 'textarea',
                      placeholder: 'Share your interests and hobbies...'
                    }
                  ]}
                  onSave={handleProfileUpdate('interests')}
                />
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-bl from-pink-100/80 via-yellow-100/80 to-purple-100/80 dark:from-fuchsia-950/70 dark:via-indigo-950/80 dark:to-amber-900/60 shadow">
                <p className="text-sm text-muted-foreground">
                  {profileData.interests || "Share your interests and hobbies..."}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <style>
        {`
          .drop-shadow-glow {
            filter: drop-shadow(0 0 6px #d946ef) drop-shadow(0 0 20px #fcd34d70);
          }
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(16px);}
            to { opacity: 1; transform: translateY(0);}
          }
          .animate-fade-in { animation: fade-in 0.7s cubic-bezier(.75,.53,.37,1.33) both;}
          @keyframes scale-in {
            from { transform: scale(0.97); opacity: 0.2;}
            to { transform: scale(1); opacity: 1;}
          }
          .animate-scale-in { animation: scale-in 0.55s cubic-bezier(.31,1.27,.82,1.06) both;}
        `}
      </style>
    </div>
  );
}