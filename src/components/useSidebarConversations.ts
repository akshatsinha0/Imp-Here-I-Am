import * as React from "react";
import { Tables } from "@/lib/types";
type Conversation = {
  id: string;
  participant_1: string;
  participant_2: string;
};
type UserProfile = Tables<"user_profiles">;
interface UseSidebarConversationsParams {
  conversations: Conversation[];
  userId: string;
  userProfiles: Record<string, UserProfile>;
  pinnedChats?: Record<string, string>;
  search: string;
}
export function useSidebarConversations({
  conversations,
  userId,
  userProfiles,
  pinnedChats,
  search,
}: UseSidebarConversationsParams) {
  const filtered = React.useMemo(
    () => conversations.filter(
      (c) => !(c.participant_1 === userId && c.participant_2 === userId)
    ),
    [conversations, userId]
  );
  const filteredConvos = React.useMemo(() => {
    return filtered.filter((c) => {
      const otherId = c.participant_1 === userId ? c.participant_2 : c.participant_1;
      const otherProfile = userProfiles[otherId];
      if (!search) return true;
      if (!otherProfile) {
        return otherId?.toLowerCase().includes(search.toLowerCase());
      }
      const s = search.toLowerCase();
      return (
        (otherProfile.display_name && otherProfile.display_name.toLowerCase().includes(s)) ||
        (otherProfile.email && otherProfile.email.toLowerCase().includes(s))
      );
    });
  }, [filtered, userId, userProfiles, search]);
  const sortedConvos = React.useMemo(() => [
    ...filteredConvos.filter(c => !!pinnedChats?.[c.id])
      .sort((a, b) => {
        return new Date(pinnedChats![b.id]!).getTime() - new Date(pinnedChats![a.id]!).getTime();
      }),
    ...filteredConvos.filter(c => !pinnedChats?.[c.id])
  ], [filteredConvos, pinnedChats]);
  return sortedConvos;
}