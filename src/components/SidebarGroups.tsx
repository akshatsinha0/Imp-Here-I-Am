import * as React from "react";
import { useLocation,useParams } from "react-router-dom";
import SidebarGroupRow from "./SidebarGroupRow";

interface Group{ id:string; name:string; created_by:string; created_at:string }

export default function SidebarGroups({ groups,unreadCounts,setActiveGroup,setUnreadCounts,onGroupClick }: {
  groups:Group[];
  unreadCounts:Record<string,number>;
  setActiveGroup:(id:string)=>void;
  setUnreadCounts:React.Dispatch<React.SetStateAction<Record<string,number>>>;
  onGroupClick?:(id:string)=>void;
}){
  const location=useLocation();
  const params=useParams();
  const currentGroupId=location.pathname.startsWith("/group/")&&params?.id?params.id:null;
  if(!groups?.length) return null;
  return (
    <div className="flex-1 overflow-y-auto mt-2">
      <div className="text-[13px] text-muted-foreground mb-1 font-semibold uppercase tracking-wide">Groups</div>
      {groups.map(g=> (
        <SidebarGroupRow
          key={g.id}
          group={g}
          unread={unreadCounts[g.id]||0}
          isActive={currentGroupId===g.id}
          setActiveGroup={setActiveGroup}
          setUnreadCounts={setUnreadCounts}
          onGroupClick={onGroupClick}
        />
      ))}
    </div>
  );
}
