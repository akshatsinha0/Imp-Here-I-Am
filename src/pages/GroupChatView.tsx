import { useParams,useNavigate } from "react-router-dom";
import { useGroupMessages } from "@/hooks/useGroupMessages";
import MessageList from "@/components/MessageList";
import MessageComposer from "@/components/MessageComposer";
import { Button } from "@/components/ui/button";
import { Users,ArrowLeft,Edit2 } from "lucide-react";
import { useEffect,useState } from "react";
import { supabase } from "@/lib/supabase";
import { Dialog,DialogContent,DialogHeader,DialogTitle,DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

const GroupChatView=()=>{
  const { id:groupId }=useParams<{id:string}>();
  const navigate=useNavigate();
  const chat=useGroupMessages(groupId);
  const [groupName,setGroupName]=useState("Group");
  const [renameOpen,setRenameOpen]=useState(false);
  const [newName,setNewName]=useState("");
  useEffect(()=>{ async function fetchName(){ if(!groupId) return; const { data }=await supabase.from("groups").select("*").eq("id",groupId).maybeSingle(); if(data?.name){ setGroupName(data.name) } } fetchName() },[groupId]);
  if(!groupId){ return <div className="flex items-center justify-center h-full">Select a group</div> }
  return (
    <div className="flex flex-col h-full flex-1 w-full max-w-2xl mx-auto bg-gradient-to-br from-background to-accent rounded-none sm:rounded-lg border relative">
      <div className="mobile-header py-3 sm:py-4 px-3 sm:px-4 text-lg sm:text-2xl font-semibold border-b bg-gradient-to-r from-primary to-secondary/50 text-primary-foreground rounded-none sm:rounded-t-lg shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={()=>navigate('/')} className="hidden md:block mobile-touch-target p-2 rounded-full hover:bg-white/10 transition-colors" aria-label="Back"><ArrowLeft className="w-5 h-5"/></button>
          <span className="text-base sm:text-lg md:text-xl font-medium truncate">{groupName}</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <Button size="icon" variant="ghost" onClick={()=>{ setNewName(groupName); setRenameOpen(true) }} title="Rename">
            <Edit2 className="w-4 h-4"/>
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-2 sm:px-4 py-2">
        {!chat.loading&&chat.messages.length===0&&(<div className="text-center text-muted-foreground py-8">No messages yet.</div>)}
        <MessageList messages={chat.messages as any} currentUserId={chat.user?.id||""} />
        <div ref={chat.messagesEndRef}/>
      </div>
      <MessageComposer input={chat.input} setInput={chat.setInput} file={chat.file} setFile={chat.setFile} uploadingFile={chat.uploadingFile} sendMessage={chat.sendMessage} loading={chat.loading} handleTyping={(e)=>chat.setInput(e.target.value)} handleKeyDown={(e)=>{ if(e.key==='Enter'){ e.preventDefault(); chat.sendMessage() } }} theme="auto"/>

      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Rename Group</DialogTitle></DialogHeader>
          <Input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="Group name"/>
          <DialogFooter>
            <Button variant="outline" onClick={()=>setRenameOpen(false)}>Cancel</Button>
            <Button onClick={async()=>{ if(!groupId||!newName.trim()) return; const { error }=await supabase.from("groups").update({ name:newName.trim() }).eq("id",groupId); if(error){ toast({ title:"Failed",description:error.message,variant:"destructive" }) } else { setGroupName(newName.trim()); setRenameOpen(false); toast({ title:"Group renamed" }) } }}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
export default GroupChatView;
