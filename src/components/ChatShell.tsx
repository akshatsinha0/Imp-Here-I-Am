import * as React from "react";
import { useAuthUser } from "@/hooks/useAuthUser";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import SidebarConversations from "./SidebarConversations";
import SidebarGroups from "./SidebarGroups";
import CreateGroupDialog from "./CreateGroupDialog";
import SidebarProfileArea from "./SidebarProfileArea";
import HamburgerMenu from "./HamburgerMenu";
import { useTheme } from "next-themes";
import { Moon, Sun, User, Users, CircleDashed, Archive } from "lucide-react";
import RightSidebarUsers from "./RightSidebarUsers";
import ErrorBoundary from "./ErrorBoundary";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { Tables } from "@/lib/types";
import { useUserProfiles } from "@/hooks/useUserProfiles";
interface Conversation{ id:string; participant_1:string; participant_2:string }
interface Group{ id:string; name:string; created_by:string; created_at:string }
type UserProfile = Tables<"user_profiles">;
export default function ChatShell() {
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [myClearedChats, setMyClearedChats] = useState<Record<string, true>>({});
  const [clearedChatsLoaded, setClearedChatsLoaded] = useState(false);
  const [pinnedChats, setPinnedChats] = useState<Record<string, string>>({});
  const [archivedChats, setArchivedChats] = useState<Record<string,true>>({});
  const [archivedOpen,setArchivedOpen]=useState(false);
  const [leftSidebarOpen,setLeftSidebarOpen]=useState(false);
  const [rightSidebarOpen,setRightSidebarOpen]=useState(false);
  const [groups,setGroups]=useState<Group[]>([]);
  const [groupUnreadCounts,setGroupUnreadCounts]=useState<Record<string,number>>({});
  const [activeGroup,setActiveGroup]=useState<string|null>(null);
  const [createGroupOpen,setCreateGroupOpen]=useState(false);
  const { user, loading } = useAuthUser();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [myProfile, setMyProfile] = useState<UserProfile | null>(null);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const location = useLocation();
  useEffect(()=>{
    if(!user?.id) return;
    setClearedChatsLoaded(false);
    supabase.from("cleared_chats").select("conversation_id").eq("user_id",user.id).then(({ data })=>{
      const map:Record<string,true>={};
      (data||[]).forEach(row=>{ map[row.conversation_id]=true });
      setMyClearedChats(map); setClearedChatsLoaded(true);
    });
  },[user?.id]);
  useEffect(()=>{
    if(!user?.id) return; if(!clearedChatsLoaded) return;
    supabase.from("conversations").select("*")
      .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)
      .order("updated_at",{ ascending:false })
      .then(({ data })=>{ const filtered=(data||[]).filter((c:Conversation)=>!myClearedChats[c.id]); setConversations(filtered) });
  },[user?.id,clearedChatsLoaded,myClearedChats]);
  useEffect(() => {
    if (!user?.id) return;
    async function fetchPinned() {
      const { data, error } = await supabase
        .from("pinned_chats")
        .select("*")
        .eq("user_id", user.id);
      if (error) {
        console.warn("Could not fetch pinned chats:", error);
        setPinnedChats({});
        return;
      }
      const map: Record<string, string> = {};
      (data || []).forEach((row) => {
        map[row.conversation_id] = row.pinned_at;
      });
      setPinnedChats(map);
    }
    fetchPinned();
  }, [user?.id]);
  useEffect(()=>{
    if(!user?.id) return;
    async function fetchArchived(){
      const { data }=await supabase.from("archived_chats").select("conversation_id").eq("user_id",user.id);
      const m:Record<string,true>={}; (data||[]).forEach(r=>m[r.conversation_id]=true); setArchivedChats(m);
    }
    fetchArchived();
  },[user?.id]);
  const handlePinConversation = async (conversationId: string, pin: boolean) => {
    if (!user?.id) return;
    if (pin) {
      const { error } = await supabase
        .from("pinned_chats")
        .upsert([
          {
            user_id: user.id,
            conversation_id: conversationId,
            pinned_at: new Date().toISOString(),
          }
        ]);
      if (error) {
        console.error("Error pinning chat:", error);
        return;
      }
    } else {
      const { error } = await supabase
        .from("pinned_chats")
        .delete()
        .eq("user_id", user.id)
        .eq("conversation_id", conversationId);
      if (error) {
        console.error("Error unpinning chat:", error);
        return;
      }
    }
    const { data, error } = await supabase
      .from("pinned_chats")
      .select("*")
      .eq("user_id", user.id);
    if (error) {
      setPinnedChats({});
      return;
    }
    const map: Record<string, string> = {};
    (data || []).forEach((row) => {
      map[row.conversation_id] = row.pinned_at;
    });
    setPinnedChats(map);
  };
  useEffect(()=>{
    if(!user?.id) return;
    let channel:any=null;
    const ch=supabase.channel(`sidebar-messages-${user.id}-${Date.now()}`)
      .on("postgres_changes",{ event:"INSERT",schema:"public",table:"messages" },payload=>{
        const newMsg=payload.new; const convId=newMsg.conversation_id;
        setConversations(prev=>{ const idx=prev.findIndex(c=>c.id===convId); if(idx===-1) return prev; const arr=[...prev]; const [item]=arr.splice(idx,1); arr.unshift(item); return arr });
        if(activeConversation!==convId&&newMsg.sender_id!==user.id){ setUnreadCounts(prev=>({ ...prev,[convId]:(prev[convId]||0)+1 })) }
      })
      .subscribe();
    channel=ch;
    return ()=>{ if(channel) supabase.removeChannel(channel) };
  },[user?.id,activeConversation]);
  useEffect(()=>{
    const path=location.pathname;
    if(path.startsWith("/chat/")){
      const chatId=path.split("/chat/")[1]; setActiveConversation(chatId);
      setUnreadCounts(prev=>({ ...prev,[chatId]:0 })); setActiveGroup(null);
    } else if(path.startsWith("/group/")){
      const gid=path.split("/group/")[1]; setActiveGroup(gid);
      setGroupUnreadCounts(prev=>({ ...prev,[gid]:0 })); setActiveConversation(null);
    } else { setActiveConversation(null); setActiveGroup(null) }
  },[location.pathname]);
  useEffect(() => {
    if (!user?.id) return;
    supabase
      .from("user_profiles")
      .select("*")
      .eq("id", user.id)
      .single()
      .then(({ data }) => setMyProfile(data || null));
  }, [user?.id]);
  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };
  useEffect(()=>{
    if(!user?.id) return;
    async function fetchGroups(){
      const { data:memberRows }=await supabase.from("group_members").select("group_id").eq("user_id",user.id);
      const ids=(memberRows||[]).map(r=>r.group_id);
      if(ids.length===0){ setGroups([]); return }
      const { data:groupsData }=await supabase.from("groups").select("*").in("id",ids);
      setGroups((groupsData||[]) as Group[]);
    }
    fetchGroups();
  },[user?.id]);

  const handlePersonalSpaceClick = async () => {
    if (!user) return;
    let convo = conversations.find(
      (c) => c.participant_1 === user.id && c.participant_2 === user.id
    );
    if (!convo) {
      const { data: created, error } = await supabase
        .from("conversations")
        .insert([
          {
            participant_1: user.id,
            participant_2: user.id,
          },
        ])
        .select()
        .single();
      convo = created;
      if (error) {
        console.error("Failed to create personal space:", error);
        return;
      }
      setConversations((prev) => [created, ...prev]);
    }
    navigate(`/chat/${convo.id}`);
  };
  const allOtherIds = React.useMemo(() => {
    const ids: string[] = [];
    conversations.forEach(c => {
      if (user?.id && c.participant_1 === user?.id && c.participant_2 !== user?.id) {
        ids.push(c.participant_2);
      } else if (user?.id && c.participant_2 === user?.id && c.participant_1 !== user?.id) {
        ids.push(c.participant_1);
      } else if (c.participant_1 !== c.participant_2) {
        ids.push(c.participant_1, c.participant_2);
      }
    });
    return Array.from(new Set(ids.filter(id => id && id !== user?.id)));
  }, [conversations, user?.id]);
  const userProfiles = useUserProfiles(allOtherIds);
  const handleConversationStarted = (convo: Conversation) => {
    setConversations((prev) => {
      if (prev.some((c) => c.id === convo.id)) {
        const idx = prev.findIndex(c => c.id === convo.id);
        const arr = [...prev];
        const [item] = arr.splice(idx, 1);
        arr.unshift(item);
        return arr;
      }
      return [convo, ...prev];
    });
    navigate(`/chat/${convo.id}`);
  };
  useEffect(()=>{
    if(!user?.id) return;
    let channel:any=null;
    function bringConversationToTopAndSetUnread(convId:string,senderId:string){
      setConversations((prev) => {
        const idx = prev.findIndex((c) => c.id === convId);
        if (idx === -1) return prev;
        const updated = [...prev];
        const [item] = updated.splice(idx, 1);
        updated.unshift(item);
        return updated;
      });
      if (activeConversation !== convId && senderId !== user.id) {
        setUnreadCounts((prev) => ({
          ...prev,
          [convId]: (prev[convId] || 0) + 1,
        }));
      } else if (activeConversation === convId) {
        setUnreadCounts((prev) => ({
          ...prev,
          [convId]: 0,
        }));
      }
    }
    
    channel=supabase.channel(`sidebar-messages-global-${user.id}-${Date.now()}`)
      .on("postgres_changes",{ event:"INSERT",schema:"public",table:"messages" },payload=>{
        const msg=payload.new; bringConversationToTopAndSetUnread(msg.conversation_id,msg.sender_id);
      })
      .on("postgres_changes",{ event:"INSERT",schema:"public",table:"group_messages" },payload=>{
        const gmsg=payload.new; const gid=gmsg.group_id;
        setGroups(prev=>{ const idx=prev.findIndex(g=>g.id===gid); if(idx===-1) return prev; const arr=[...prev]; const [item]=arr.splice(idx,1); arr.unshift(item); return arr });
        if(activeGroup!==gid&&gmsg.sender_id!==user.id){ setGroupUnreadCounts(prev=>({ ...prev,[gid]:(prev[gid]||0)+1 })) }
      })
      .subscribe();
    return ()=>{ if(channel){ supabase.removeChannel(channel); channel=null } };
  },[user?.id,activeConversation,activeGroup]);
  const { theme, setTheme } = useTheme();
  const handleDeleteConversation = (id: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    setUnreadCounts((prev) => {
      const newCounts = { ...prev };
      delete newCounts[id];
      return newCounts;
    });
  };

  const toggleLeftSidebar = () => {
    setLeftSidebarOpen(!leftSidebarOpen);
    if (rightSidebarOpen) setRightSidebarOpen(false);
  };

  const toggleRightSidebar = () => {
    setRightSidebarOpen(!rightSidebarOpen);
    if (leftSidebarOpen) setLeftSidebarOpen(false);
  };

  const closeSidebars = () => {
    setLeftSidebarOpen(false);
    setRightSidebarOpen(false);
  };

  const handleConversationClick = (conversationId: string) => {
    navigate(`/chat/${conversationId}`);
    closeSidebars();
  };
  const handleArchiveConversation=async(id:string,archive:boolean)=>{
    if(!user?.id) return;
    if(archive){ await supabase.from('archived_chats').upsert({ user_id:user.id, conversation_id:id }); setArchivedChats(prev=>({ ...prev,[id]:true })) }
    else { await supabase.from('archived_chats').delete().eq('user_id',user.id).eq('conversation_id',id); setArchivedChats(prev=>{ const n={...prev}; delete n[id]; return n }) }
  };
  if (loading || (!user && !loading)) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div>Loading...</div>
      </div>
    );
  }
  return (
    <>
      <div className="block md:hidden h-screen bg-background text-foreground mobile-chat-container">
        <div className={`mobile-overlay ${leftSidebarOpen || rightSidebarOpen ? 'active' : ''}`} onClick={closeSidebars}></div>
        
        <div className={`mobile-sidebar-left ${leftSidebarOpen ? 'open' : ''} bg-gradient-to-b from-sidebar to-background/80`}>
          <div className="flex flex-col h-full p-4">
            <div className="flex justify-between items-center mb-4">
              <span className="font-bold text-lg text-primary tracking-wider">Chats</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="rounded p-2 hover:bg-accent transition mobile-touch-target"
                  aria-label={`Switch to ${theme === "dark" ? "light" : "dark" } mode`}
                >
                  {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
                <HamburgerMenu isActive={leftSidebarOpen} onClick={closeSidebars} />
              </div>
            </div>
            
            <button
              onClick={handlePersonalSpaceClick}
              className="flex items-center gap-3 rounded bg-primary/10 mb-3 px-3 py-3 hover:bg-primary/20 transition mobile-touch-target"
            >
              <User className="w-6 h-6 text-primary" />
              <span className="font-medium text-base">Personal Space</span>
            </button>
            
            <div className="flex-1 overflow-y-auto">
              <button onClick={()=>navigate('/status')} className="flex items-center gap-3 rounded bg-primary/10 mb-2 px-3 py-2 hover:bg-primary/20 transition">
                <CircleDashed className="w-5 h-5 text-primary"/>
                <span className="font-medium text-base">Status</span>
              </button>
              <button onClick={()=>setArchivedOpen(true)} className="flex items-center gap-3 rounded bg-primary/10 mb-2 px-3 py-2 hover:bg-primary/20 transition">
                <Archive className="w-5 h-5 text-primary"/>
                <span className="font-medium text-base">Archived</span>
              </button>
              <button onClick={()=>setCreateGroupOpen(true)} className="flex items-center gap-3 rounded bg-primary/10 mb-2 px-3 py-2 hover:bg-primary/20 transition">
                <Users className="w-5 h-5 text-primary"/>
                <span className="font-medium text-base">Create Group</span>
              </button>
              <SidebarGroups
                groups={groups}
                unreadCounts={groupUnreadCounts}
                setActiveGroup={setActiveGroup}
                setUnreadCounts={setGroupUnreadCounts}
                onGroupClick={(id)=>{ navigate(`/group/${id}`); setLeftSidebarOpen(false) }}
              />
            <SidebarConversations
              conversations={conversations.filter(c=>!archivedChats[c.id])}
              userProfiles={userProfiles}
              unreadCounts={unreadCounts}
              userId={user.id}
              setActiveConversation={setActiveConversation}
              setUnreadCounts={setUnreadCounts}
              onDeleteConversation={handleDeleteConversation}
              pinnedChats={pinnedChats}
              onPinConversation={handlePinConversation}
              archivedChats={archivedChats}
              onArchiveConversation={handleArchiveConversation}
              onConversationClick={handleConversationClick}
            />
            </div>
            
            <SidebarProfileArea
              myProfile={myProfile}
              user={{ email: user?.email ?? "" }}
              handleLogout={handleLogout}
            />
          </div>
        </div>

        <div className={`mobile-sidebar-right ${rightSidebarOpen ? 'open' : ''} bg-gradient-to-b from-sidebar to-background/80`}>
          <div className="flex flex-col h-full p-4">
            <div className="flex justify-between items-center mb-4">
              <span className="font-bold text-lg text-primary tracking-wider">Users</span>
              <HamburgerMenu isActive={rightSidebarOpen} onClick={closeSidebars} />
            </div>
            
            <div className="flex-1 overflow-y-auto">
              <RightSidebarUsers onConversationStarted={handleConversationStarted} />
            </div>
          </div>
        </div>

        <div className={`mobile-chat-main ${leftSidebarOpen || rightSidebarOpen ? 'sidebar-open' : ''}`}>
          <main className="flex-1 flex flex-col h-full">
            <Outlet context={{ toggleLeftSidebar, toggleRightSidebar, leftSidebarOpen, rightSidebarOpen }} />
          </main>
        </div>
      </div>

      <div className="hidden md:flex h-screen bg-background text-foreground">
        <ResizablePanelGroup direction="horizontal" className="flex-1 h-full">
          <ResizablePanel
            defaultSize={18}
            minSize={12}
            maxSize={25}
            className="max-w-xs min-w-[190px] w-64 border-r p-4 flex flex-col bg-gradient-to-b from-sidebar to-background/80"
          >
            <div className="flex justify-between items-center mb-4">
              <span className="font-bold text-lg text-primary tracking-wider">Chats</span>
              <button onClick={()=>setTheme(theme==="dark"?"light":"dark")} className="rounded p-2 hover:bg-accent transition" aria-label={`Switch to ${theme==="dark"?"light":"dark" } mode`}>
                {theme==="dark"?<Sun className="w-5 h-5"/>:<Moon className="w-5 h-5"/>}
              </button>
            </div>
            <button onClick={handlePersonalSpaceClick} className="flex items-center gap-3 rounded bg-primary/10 mb-2 px-2 py-2 hover:bg-primary/20 transition">
              <User className="w-6 h-6 text-primary"/>
              <span className="font-medium text-md">Personal Space</span>
            </button>
            <button onClick={()=>navigate('/status')} className="flex items-center gap-3 rounded bg-primary/10 mb-2 px-2 py-2 hover:bg-primary/20 transition">
              <CircleDashed className="w-5 h-5 text-primary"/>
              <span className="font-medium text-md">Status</span>
            </button>
            <button onClick={()=>setArchivedOpen(true)} className="flex items-center gap-3 rounded bg-primary/10 mb-2 px-2 py-2 hover:bg-primary/20 transition">
              <Archive className="w-5 h-5 text-primary"/>
              <span className="font-medium text-md">Archived</span>
            </button>
            <button onClick={()=>setCreateGroupOpen(true)} className="flex items-center gap-3 rounded bg-primary/10 mb-3 px-2 py-2 hover:bg-primary/20 transition">
              <Users className="w-5 h-5 text-primary"/>
              <span className="font-medium text-md">Create Group</span>
            </button>
            <SidebarGroups
              groups={groups}
              unreadCounts={groupUnreadCounts}
              setActiveGroup={setActiveGroup}
              setUnreadCounts={setGroupUnreadCounts}
            />
            
            <SidebarConversations
              conversations={conversations.filter(c=>!archivedChats[c.id])}
              userProfiles={userProfiles}
              unreadCounts={unreadCounts}
              userId={user.id}
              setActiveConversation={setActiveConversation}
              setUnreadCounts={setUnreadCounts}
              onDeleteConversation={handleDeleteConversation}
              pinnedChats={pinnedChats}
              onPinConversation={handlePinConversation}
              archivedChats={archivedChats}
              onArchiveConversation={handleArchiveConversation}
              onConversationClick={handleConversationClick}
            />
            <SidebarProfileArea
              myProfile={myProfile}
              user={{ email: user?.email ?? "" }}
              handleLogout={handleLogout}
            />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel
            defaultSize={52}
            minSize={30}
            maxSize={80}
            className="flex flex-col h-full"
            style={{
              minWidth: "320px",
              maxWidth: "900px",
            }}
          >
            <main className="flex-1 flex flex-col min-h-0">
              <Outlet context={{ toggleLeftSidebar, toggleRightSidebar, leftSidebarOpen, rightSidebarOpen }} />
            </main>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel
            defaultSize={24}
            minSize={14}
            maxSize={34}
            className="right-sidebar"
            style={{ minWidth: 350, maxWidth: 450 }}
          >
            <RightSidebarUsers onConversationStarted={handleConversationStarted} />
        </ResizablePanel>
      </ResizablePanelGroup>
      </div>

      <Dialog open={archivedOpen} onOpenChange={setArchivedOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Archived Chats</DialogTitle></DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto">
            <SidebarConversations
              conversations={conversations.filter(c=>archivedChats[c.id])}
              userProfiles={userProfiles}
              unreadCounts={unreadCounts}
              userId={user?.id||''}
              setActiveConversation={setActiveConversation}
              setUnreadCounts={setUnreadCounts}
              onDeleteConversation={handleDeleteConversation}
              pinnedChats={pinnedChats}
              onPinConversation={handlePinConversation}
              archivedChats={archivedChats}
              onArchiveConversation={handleArchiveConversation}
              onConversationClick={(id)=>{ setArchivedOpen(false); handleConversationClick(id) }}
            />
          </div>
        </DialogContent>
      </Dialog>

      <CreateGroupDialog
        open={createGroupOpen}
        onOpenChange={setCreateGroupOpen}
        candidates={Object.values(userProfiles)}
        onCreated={(grp)=>{ setGroups(prev=>[grp as any,...prev]); navigate(`/group/${grp.id}`) }}
      />
    </>
  );
}
