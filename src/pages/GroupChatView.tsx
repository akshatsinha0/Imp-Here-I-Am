import { useParams,useNavigate } from "react-router-dom";
import { useGroupMessages } from "@/hooks/useGroupMessages";
import MessageList from "@/components/MessageList";
import MessageComposer from "@/components/MessageComposer";
import { Button } from "@/components/ui/button";
import { Users,ArrowLeft,Edit2,Video as VideoIcon,Search } from "lucide-react";
import { useEffect,useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Dialog,DialogContent,DialogHeader,DialogTitle,DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast, useToast } from "@/hooks/use-toast";
import VideoCallDialog from "@/components/video/VideoCallDialog";

const GroupChatView=()=>{
  const { id:groupId }=useParams<{id:string}>();
  const navigate=useNavigate();
  const chat=useGroupMessages(groupId);
  const [groupName,setGroupName]=useState("Group");
  const [renameOpen,setRenameOpen]=useState(false);
  const [newName,setNewName]=useState("");
  const [callOpen,setCallOpen]=useState(false);
  const [searchOpen,setSearchOpen]=useState(false);
  const [searchTerm,setSearchTerm]=useState("");
  const [matchCount,setMatchCount]=useState(0);
  const [activeMatch,setActiveMatch]=useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const lastToastTermRef = useRef<string>("");
  const searchOpenedAtRef = useRef<number>(0);
  const lastEditAtRef = useRef<number>(0);
  const { dismiss } = useToast();
  useEffect(()=>{ async function fetchName(){ if(!groupId) return; const { data }=await supabase.from("groups").select("*").eq("id",groupId).maybeSingle(); if(data?.name){ setGroupName(data.name) } } fetchName() },[groupId]);
  useEffect(()=>{ if(!groupId) return; const d=localStorage.getItem(`draft:group:${groupId}`)||""; chat.setInput(d); const s=localStorage.getItem(`search:group:${groupId}`)||""; setSearchTerm(s); setActiveMatch(0) },[groupId]);
  useEffect(()=>{ if(!groupId) return; localStorage.setItem(`search:group:${groupId}`, searchTerm) },[groupId,searchTerm]);
  useEffect(()=>{ if(searchOpen){ searchOpenedAtRef.current=Date.now(); searchInputRef.current?.focus() } },[searchOpen]);
  useEffect(()=>{ if(!searchOpen) return; const term=searchTerm.trim(); if(!term){ lastToastTermRef.current=""; dismiss(); return } const t=setTimeout(()=>{ if(lastEditAtRef.current<=searchOpenedAtRef.current) return; if(matchCount===0 && lastToastTermRef.current!==term){ toast({ title:"entered result not found!!" }); lastToastTermRef.current=term } },350); return ()=>clearTimeout(t) },[searchOpen,searchTerm,matchCount]);
  if(!groupId){ return <div className="flex items-center justify-center h-full">Select a group</div> }
  return (
    <div className="flex flex-col h-full flex-1 w-full max-w-2xl mx-auto bg-gradient-to-br from-background to-accent rounded-none sm:rounded-lg border relative">
      <div className="mobile-header py-3 sm:py-4 px-3 sm:px-4 text-lg sm:text-2xl font-semibold border-b bg-gradient-to-r from-primary to-secondary/50 text-primary-foreground rounded-none sm:rounded-t-lg shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={()=>navigate('/')} className="hidden md:block mobile-touch-target p-2 rounded-full hover:bg-white/10 transition-colors" aria-label="Back"><ArrowLeft className="w-5 h-5"/></button>
          <span className="text-base sm:text-lg md:text-xl font-medium truncate">{groupName}</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <button onClick={()=>setSearchOpen(o=>!o)} className="mobile-touch-target p-2 rounded-full hover:bg-white/10 transition-colors" aria-label="Search"><Search className="w-5 h-5"/></button>
          <Button size="icon" variant="ghost" onClick={()=> setCallOpen(true)} title="Start video call">
            <VideoIcon className="w-4 h-4"/>
          </Button>
          <Button size="icon" variant="ghost" onClick={()=>{ setNewName(groupName); setRenameOpen(true) }} title="Rename">
            <Edit2 className="w-4 h-4"/>
          </Button>
        </div>
      </div>
      {searchOpen && (
        <div className="px-2 sm:px-4 py-2 bg-muted/40 border-b">
          <div className="flex items-center gap-2">
            <input ref={searchInputRef} value={searchTerm} onChange={e=>{ lastEditAtRef.current=Date.now(); setSearchTerm(e.target.value); setActiveMatch(0) }} onKeyDown={(e)=>{ if(matchCount>0 && (e.key==='ArrowDown'||(e.key==='Enter'&&!e.shiftKey))){ e.preventDefault(); setActiveMatch(p=> (p+1)%Math.max(matchCount,1)) } else if (matchCount>0 && (e.key==='ArrowUp'||(e.key==='Enter'&&e.shiftKey))){ e.preventDefault(); setActiveMatch(p=> (p-1+matchCount)%Math.max(matchCount,1)) } }} placeholder="Search messages" className="flex-1 px-3 py-2 rounded border" />
            <div className="text-sm text-muted-foreground whitespace-nowrap">{matchCount>0?`${activeMatch+1}/${matchCount}`:"0/0"}</div>
            <button disabled={matchCount<=1} onClick={()=>setActiveMatch(p=> (p-1+matchCount)%Math.max(matchCount,1))} className="px-2 py-1 rounded border disabled:opacity-50">↑</button>
            <button disabled={matchCount<=1} onClick={()=>setActiveMatch(p=> (p+1)%Math.max(matchCount,1))} className="px-2 py-1 rounded border disabled:opacity-50">↓</button>
            <button onClick={()=>{ setSearchTerm(""); setActiveMatch(0); setMatchCount(0) }} className="px-2 py-1 rounded border">Clear</button>
          </div>
        </div>
      )}
      <div className="mobile-message-list flex-1 overflow-y-auto px-2 sm:px-4 py-2">
        {!chat.loading&&chat.messages.length===0&&(<div className="text-center text-muted-foreground py-8">No messages yet.</div>)}
        <MessageList messages={chat.messages as any} currentUserId={chat.user?.id||""} searchTerm={searchTerm} activeMatchIndex={activeMatch} onMatchesChange={setMatchCount} onViewOnceOpen={async (messageId:string)=>{ const m=(chat.messages as any).find((x:any)=>x.id===messageId); if(m&&m.sender_id!==chat.user?.id&&m.message_type==='view_once'){ await supabase.from('group_messages').update({ deleted_at:new Date().toISOString(), content:'This message was deleted' }).eq('id',messageId) } }} />
        <div ref={chat.messagesEndRef}/>
      </div>
      <MessageComposer input={chat.input} setInput={chat.setInput} file={chat.file} setFile={chat.setFile} uploadingFile={chat.uploadingFile} sendMessage={async()=>{ await chat.sendMessage(); if(groupId){ localStorage.removeItem(`draft:group:${groupId}`) } }} loading={chat.loading} handleTyping={(e)=>{ chat.setInput(e.target.value); if(groupId){ localStorage.setItem(`draft:group:${groupId}`, e.target.value) } }} handleKeyDown={(e)=>{ if(e.key==='Enter'){ e.preventDefault(); chat.sendMessage(); if(groupId){ localStorage.removeItem(`draft:group:${groupId}`) } } }} theme="auto"/>

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

      <VideoCallDialog
        open={callOpen}
        onOpenChange={setCallOpen}
        roomId={`group-${groupId}`}
        currentUserId={chat.user?.id}
        title={groupName}
      />
    </div>
  );
};
export default GroupChatView;
