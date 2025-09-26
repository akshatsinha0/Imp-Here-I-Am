import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthUser } from "@/hooks/useAuthUser";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Settings as SettingsIcon, MapPin, Phone, Mail, User, Edit3, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EditProfileDialog } from "@/components/EditProfileDialog";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
export default function Settings() {
  const { user } = useAuthUser();
  const [profileData, setProfileData] = useState({
    displayName: (user?.email || "").split("@")[0] || "User",
    email: user?.email || "",
    phone: "",
    location: "",
    bio: "",
    skills: "",
    interests: "",
    avatarUrl: ""
  });
  const [loadingAvatar,setLoadingAvatar]=useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  useEffect(()=>{ async function load(){ if(!user?.id) return; const { data }=await supabase.from("user_profiles").select("display_name,email,phone,location,bio,skills,interests,avatar_url").eq("id",user.id).maybeSingle(); if(data){ setProfileData({ displayName:data.display_name||profileData.displayName, email:data.email||profileData.email, phone:data.phone||"", location:data.location||"", bio:data.bio||"", skills:data.skills||"", interests:data.interests||"", avatarUrl:data.avatar_url||"" }) } } load() },[user?.id]);
  const initials = (profileData.displayName || user?.email || "?").slice(0, 2).toUpperCase();
  const handleProfileUpdate = (field: string) => async (data: Record<string, string>) => {
    const key = Object.keys(data)[0]; const value = data[key];
    setProfileData(prev => ({ ...prev, [key]: value }));
    if(!user?.id) return; const update:any={}; if(key==='displayName') update.display_name=value; else update[key]=value; await supabase.from("user_profiles").update(update).eq("id",user.id);
  };
  const onPickAvatar=()=>fileRef.current?.click();
  const onAvatarChange=async(e:React.ChangeEvent<HTMLInputElement>)=>{ const f=e.target.files?.[0]; if(!f||!user?.id) return; setLoadingAvatar(true); const ext=f.name.split('.').pop()||'bin'; const path=`avatars/${user.id}/${Date.now()}.${ext}`; const { error }=await supabase.storage.from('attachments').upload(path,f,{ upsert:false }); if(error){ setLoadingAvatar(false); return } const { data:pub }=supabase.storage.from('attachments').getPublicUrl(path); await supabase.from('user_profiles').update({ avatar_url:pub?.publicUrl||'' }).eq('id',user.id); setProfileData(prev=>({ ...prev, avatarUrl:pub?.publicUrl||'' })); setLoadingAvatar(false) };
  return (
    <div className="h-full w-full overflow-auto p-4 bg-gradient-to-tr from-purple-600 via-pink-400 to-yellow-300 dark:from-blue-900 dark:via-fuchsia-900 dark:to-amber-800 transition-colors duration-500 animate-fade-in">
      <div className="max-w-2xl mx-auto">
      <Card className="relative w-full rounded-3xl shadow-2xl border-0 bg-white/70 dark:bg-background/80 backdrop-blur-md transition-all max-h-[calc(100vh-2rem)] overflow-auto">
        <div className="relative h-32 bg-gradient-to-br from-indigo-400 via-pink-400 to-amber-400 rounded-t-3xl overflow-hidden">
          <Button
            size="icon"
            variant="ghost"
            className="absolute top-4 right-4 text-white hover:bg-white/20"
            onClick={()=>{}}
          >
            <Camera className="w-5 h-5" />
          </Button>
        </div>
        <CardHeader className="flex flex-col items-center text-center relative -mt-16">
          <div className="relative group mb-4">
            <Avatar className="w-32 h-32 bg-gradient-to-br from-primary/80 to-secondary/50 border-4 border-white shadow-xl">
              <AvatarImage src={profileData.avatarUrl||undefined} />
              <AvatarFallback className="text-4xl font-bold text-white bg-gradient-to-tr from-purple-500 via-pink-400 to-yellow-300">
                {initials}
              </AvatarFallback>
            </Avatar>
            <input ref={fileRef} type="file" className="hidden" accept="image/*" onChange={onAvatarChange} />
            <Button
              size="icon"
              variant="secondary"
              className="absolute bottom-2 right-2 w-8 h-8 rounded-full shadow-lg"
              onClick={onPickAvatar}
              disabled={loadingAvatar}
            >
              <Camera className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <CardTitle className="text-2xl font-extrabold bg-gradient-to-r from-purple-700 via-pink-600 to-yellow-500 dark:from-blue-300 dark:via-fuchsia-400 dark:to-orange-300 bg-clip-text text-transparent leading-tight tracking-tight">
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
        <CardContent className="pt-0 relative px-8 pb-8">
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-bl from-pink-100/80 via-yellow-100/80 to-purple-100/80 dark:from-fuchsia-950/70 dark:via-indigo-950/80 dark:to-amber-900/60 shadow">
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
              <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-bl from-pink-100/80 via-yellow-100/80 to-purple-100/80 dark:from-fuchsia-950/70 dark:via-indigo-950/80 dark:to-amber-900/60 shadow">
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
              <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-bl from-pink-100/80 via-yellow-100/80 to-purple-100/80 dark:from-fuchsia-950/70 dark:via-indigo-950/80 dark:to-amber-900/60 shadow">
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
      </div>
    </div>
  );
}
