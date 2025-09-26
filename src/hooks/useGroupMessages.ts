import { useEffect,useRef,useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthUser } from "@/hooks/useAuthUser";
import { toast } from "@/components/ui/use-toast";

export interface GroupMessage{
  id:string;
  group_id:string;
  sender_id:string;
  content:string;
  created_at:string;
  file_url:string|null;
  file_name:string|null;
  file_mime:string|null;
  message_type:string|null;
  readers:string[]|null;
  reply_to_id?:string|null;
  edited_at?:string|null;
  deleted_at?:string|null;
}

export function useGroupMessages(groupId?:string){
  const { user }=useAuthUser();
  const [messages,setMessages]=useState<GroupMessage[]>([]);
  const [input,setInput]=useState("");
  const [loading,setLoading]=useState(false);
  const [uploadingFile,setUploadingFile]=useState(false);
  const [file,setFile]=useState<File|null>(null);
  const messagesEndRef=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    if(!groupId||!user?.id){ setLoading(false); return }
    setLoading(true);
    const fetchMessages=async()=>{
      const { data,error }=await supabase
        .from("group_messages")
        .select("*")
        .eq("group_id",groupId)
        .order("created_at",{ ascending:true });
      if(error){ setMessages([]) } else { setMessages((data||[]) as GroupMessage[]) }
      setLoading(false);
      setTimeout(()=>messagesEndRef.current?.scrollIntoView({ behavior:"smooth" }),100);
      setTimeout(async()=>{
        setMessages(prev=>{
          prev.filter(m=>m.sender_id!==user.id&&!(m.readers||[]).includes(user.id)).forEach(async m=>{
            const next=[...(m.readers||[]),user.id];
            await supabase.from("group_messages").update({ readers: next }).eq("id",m.id);
          });
          return prev.map(m=> m.sender_id!==user.id&&!(m.readers||[]).includes(user.id)?{...m,readers:[...(m.readers||[]),user.id]}:m);
        });
      },200);
    };
    fetchMessages();
  },[groupId,user?.id]);
  const rtRef=useRef<any>(null);
  useEffect(()=>{
    if(!groupId||!user?.id) return;
    const cleanup=async()=>{ if(rtRef.current){ await supabase.removeChannel(rtRef.current); rtRef.current=null } };
    cleanup().then(()=>{
      const ch=supabase
        .channel(`group-msg-${groupId}-${user.id}-${Date.now()}`)
        .on("postgres_changes",{ event:"INSERT",schema:"public",table:"group_messages",filter:`group_id=eq.${groupId}` },payload=>{
          const msg=payload.new as GroupMessage;
          setMessages(prev=>{
            if(prev.some(m=>m.id===msg.id)) return prev;
            const next=[...prev,msg];
            return next;
          });
          setTimeout(async()=>{
            if(msg.sender_id!==user.id){
              const next=[...(msg.readers||[]),user.id];
              await supabase.from("group_messages").update({ readers: next }).eq("id",msg.id);
              setMessages(prev=> prev.map(m=> m.id===msg.id?{...m,readers:next}:m));
            }
            messagesEndRef.current?.scrollIntoView({ behavior:"smooth" });
          },100);
        })
        .on("postgres_changes",{ event:"UPDATE",schema:"public",table:"group_messages",filter:`group_id=eq.${groupId}` },payload=>{
          const msg=payload.new as GroupMessage;
          setMessages(prev=> prev.map(m=> m.id===msg.id?{...m,...msg}:m));
        })
        .subscribe();
      rtRef.current=ch;
    });
    return ()=>{ cleanup() };
  },[groupId,user?.id]);
  async function upload(file:File){
    setUploadingFile(true);
    const path=`groups/${groupId}/${Date.now()}_${file.name}`;
    const { data,error }=await supabase.storage.from("attachments").upload(path,file,{ cacheControl:"3600", upsert:false });
    if(error){ toast({ title:"Upload failed",description:error.message,variant:"destructive" }); setUploadingFile(false); return {} as any }
    const { data:pub }=supabase.storage.from("attachments").getPublicUrl(path);
    setUploadingFile(false);
    return { url:pub?.publicUrl||"", fileName:file.name, mime:file.type };
  }
  const sendMessage=async()=>{
    if((!input.trim()&&!file)||!user?.id||!groupId) return;
    let outType="text"; let file_url: string|undefined; let file_name:string|undefined; let file_mime:string|undefined; let outContent=input;
    if(file){ const info:any=await upload(file); if(!info.url) return; outType=info.mime?.startsWith("audio/")?"voice_note":"file"; file_url=info.url; file_name=info.fileName; file_mime=info.mime; outContent=info.fileName||"Attachment" }
    const { data,error }=await supabase.from("group_messages").insert([{ content:outContent, group_id:groupId, sender_id:user.id, message_type:outType, file_url, file_name, file_mime, readers:[user.id] }]).select().single();
    if(!error&&data){ setMessages(prev=>[...prev,data as GroupMessage]); setInput(""); setFile(null); setTimeout(()=>messagesEndRef.current?.scrollIntoView({ behavior:"smooth" }),100) }
    if(error){ toast({ title:"Failed to send", description:error.message, variant:"destructive" }) }
  };
  return { user,messages,setMessages,input,setInput,loading,uploadingFile,file,setFile,sendMessage,messagesEndRef };
}
