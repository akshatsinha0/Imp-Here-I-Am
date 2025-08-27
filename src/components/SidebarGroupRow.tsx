import * as React from "react";
import { useNavigate,useLocation,useParams } from "react-router-dom";

interface Group{ id:string; name:string; created_by:string; created_at:string }

interface SidebarGroupRowProps{
  group:Group;
  unread:number;
  isActive:boolean;
  setActiveGroup:(id:string)=>void;
  setUnreadCounts:React.Dispatch<React.SetStateAction<Record<string,number>>>;
  onGroupClick?:(id:string)=>void;
}

export default function SidebarGroupRow({ group,unread,isActive,setActiveGroup,setUnreadCounts,onGroupClick }:SidebarGroupRowProps){
  const navigate=useNavigate();
  return (
    <div className="relative w-full">
      <button
        onClick={()=>{
          if(onGroupClick){ onGroupClick(group.id) } else { navigate(`/group/${group.id}`) }
          setActiveGroup(group.id);
          setUnreadCounts(prev=>({ ...prev, [group.id]:0 }));
        }}
        className={`flex items-center gap-2 w-full p-2 rounded mb-1 transition outline-none relative ${isActive?"bg-primary/90 text-primary-foreground font-bold shadow ring-2 ring-primary":"hover:bg-muted focus-visible:bg-accent"}`}
        tabIndex={0}
        aria-current={isActive?"page":undefined}
      >
        <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
          {group.name.slice(0,2).toUpperCase()}
        </div>
        <div className="truncate text-sm">{group.name}</div>
        {unread>0&&(
          <span className="ml-auto px-2 py-0.5 bg-primary text-white text-[10px] rounded-full font-bold shadow">{unread}</span>
        )}
      </button>
    </div>
  );
}
