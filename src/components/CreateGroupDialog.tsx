import * as React from "react";
import { Dialog,DialogContent,DialogHeader,DialogTitle,DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import UserBrief from "@/components/UserBrief";
import { Tables } from "@/lib/types";
import { useAuthUser } from "@/hooks/useAuthUser";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";

type UserProfile=Tables<"user_profiles">;

interface CreateGroupDialogProps{
  open:boolean;
  onOpenChange:(open:boolean)=>void;
  candidates:UserProfile[];
  onCreated:(group:{id:string;name:string;created_by:string;created_at:string})=>void;
}

export default function CreateGroupDialog({open,onOpenChange,candidates,onCreated}:CreateGroupDialogProps){
  const { user }=useAuthUser();
  const [name,setName]=React.useState("New Group");
  const [selected,setSelected]=React.useState<Record<string,boolean>>({});
  const [loading,setLoading]=React.useState(false);
  const toggle=(id:string)=>setSelected(s=>({...s,[id]:!s[id]}));
  const reset=()=>{setName("New Group");setSelected({});};
  const handleCreate=async()=>{
    if(!user?.id)return;
    const memberIds=Object.keys(selected).filter(id=>selected[id]);
    if(memberIds.length===0){toast({title:"Select at least one user"});return;}
    setLoading(true);
    const { data:grp,error }=await supabase.from("groups").insert([{ name, created_by:user.id }]).select().single();
    if(error){toast({title:"Failed to create group",description:error.message,variant:"destructive"});setLoading(false);return;}
    const members=[user.id,...memberIds];
    const rows=members.map(uid=>({ group_id:grp.id,user_id:uid,role: uid===user.id?"owner":"member" }));
    const { error:memErr }=await supabase.from("group_members").insert(rows);
    if(memErr){toast({title:"Failed to add members",description:memErr.message,variant:"destructive"});setLoading(false);return;}
    onCreated(grp);
    toast({title:"Group created"});
    reset();
    onOpenChange(false);
    setLoading(false);
  };
  return (
    <Dialog open={open} onOpenChange={(o)=>{onOpenChange(o);if(!o)reset();}}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Group</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Input value={name} onChange={e=>setName(e.target.value)} placeholder="Group name" />
          <div className="max-h-64 overflow-y-auto border rounded">
            {candidates.map(u=> (
              <label key={u.id} className="flex items-center gap-2 p-2 hover:bg-accent cursor-pointer">
                <Checkbox checked={!!selected[u.id]} onCheckedChange={()=>toggle(u.id)} />
                <UserBrief profile={u} size={7} />
              </label>
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={()=>{reset();onOpenChange(false);}} disabled={loading}>Cancel</Button>
          <Button onClick={handleCreate} disabled={loading || !name.trim()}>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

