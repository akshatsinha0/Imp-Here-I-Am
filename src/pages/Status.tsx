import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthUser } from "@/hooks/useAuthUser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload, Image as ImageIcon, Video, Clock } from "lucide-react";

export default function Status() {
  const { user } = useAuthUser();
  const [file, setFile] = useState<File|null>(null);
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const expiresAt = useMemo(()=> new Date(Date.now()+24*60*60*1000).toISOString(),[]);

  useEffect(()=>{
    async function load() {
      const { data } = await supabase.from("statuses").select("*").gt("expires_at", new Date().toISOString()).order("created_at", { ascending:false });
      const rows = data||[];
      const ids = Array.from(new Set(rows.map(r=>r.user_id)));
      let profiles: Record<string, any> = {};
      if (ids.length>0) {
        const { data: ups } = await supabase.from("user_profiles").select("id,display_name,avatar_url").in("id", ids);
        (ups||[]).forEach(u=>profiles[u.id]=u);
      }
      setItems(rows.map(r=>({ ...r, profile: profiles[r.user_id] })));
    }
    load();
  },[]);

  const onUpload = async () => {
    if (!user?.id || !file) return;
    setLoading(true);
    const ext = file.name.split(".").pop()||"bin";
    const path = `status/${user.id}/${Date.now()}.${ext}`;
    const { data: up, error } = await supabase.storage.from("attachments").upload(path, file, { upsert:false });
    if (error) { setLoading(false); return }
    const { data: pub } = supabase.storage.from("attachments").getPublicUrl(path);
    await supabase.from("statuses").insert([{ user_id:user.id, file_url: pub?.publicUrl||"", file_mime: file.type, caption, expires_at: expiresAt }]);
    setFile(null); setCaption(""); setLoading(false);
  };

  return (
    <div className="flex-1 w-full h-full overflow-auto p-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Upload className="w-5 h-5"/>Add Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <input ref={inputRef} type="file" className="hidden" accept="image/*,video/*" onChange={(e)=>{ if(e.target.files?.[0]) setFile(e.target.files[0]) }} />
              <Button variant="secondary" onClick={()=>inputRef.current?.click()} className="gap-2">
                <ImageIcon className="w-4 h-4"/> Image/Video
              </Button>
              <Input placeholder="Caption (optional)" value={caption} onChange={e=>setCaption(e.target.value)} />
              <Button onClick={onUpload} disabled={loading||!file}>Post</Button>
            </div>
            {file && <div className="text-sm text-muted-foreground">{file.name}</div>}
            <div className="flex items-center gap-2 text-xs text-muted-foreground"><Clock className="w-4 h-4"/>Expires in 24h</div>
          </CardContent>
        </Card>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {items.map(it=>{
            const isVideo = (it.file_mime||"").startsWith("video/");
            return (
              <Card key={it.id} className="overflow-hidden">
                <div className="flex items-center gap-3 p-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={it.profile?.avatar_url||undefined} />
                    <AvatarFallback>{(it.profile?.display_name||"?").charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="text-sm font-medium">{it.profile?.display_name||"User"}</div>
                </div>
                <div className="w-full bg-black">
                  {isVideo ? (
                    <video src={it.file_url} controls className="w-full h-64 object-contain bg-black" />
                  ) : (
                    <img src={it.file_url} className="w-full h-64 object-cover" />
                  )}
                </div>
                {it.caption && <div className="p-3 text-sm">{it.caption}</div>}
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  );
}
