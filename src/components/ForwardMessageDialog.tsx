import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, Send } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuthUser } from "@/hooks/useAuthUser";
import { toast } from "@/hooks/use-toast";

interface Contact {
  id: string;
  display_name: string;
  email: string;
  conversationId?: string;
}

interface ForwardMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  messageContent: string;
  messageId: string;
}

const ForwardMessageDialog: React.FC<ForwardMessageDialogProps> = ({
  open,
  onOpenChange,
  messageContent,
  messageId,
}) => {
  const { user } = useAuthUser();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && user) {
      fetchContacts();
    }
  }, [open, user]);

  useEffect(() => {
    if (searchQuery.trim()) {
      setFilteredContacts(
        contacts.filter(contact =>
          contact.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          contact.email.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    } else {
      setFilteredContacts(contacts);
    }
  }, [searchQuery, contacts]);

  const fetchContacts = async () => {
    if (!user) return;

    try {
      // Get all conversations where user is a participant
      const { data: conversations } = await supabase
        .from("conversations")
        .select("*")
        .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`);

      if (!conversations) return;

      // Get all unique contact IDs
      const contactIds = new Set<string>();
      const conversationMap = new Map<string, string>();

      conversations.forEach(conv => {
        const partnerId = conv.participant_1 === user.id ? conv.participant_2 : conv.participant_1;
        contactIds.add(partnerId);
        conversationMap.set(partnerId, conv.id);
      });

      // Fetch contact profiles
      const { data: profiles } = await supabase
        .from("user_profiles")
        .select("id, display_name, email")
        .in("id", Array.from(contactIds));

      if (profiles) {
        const contactsWithConversations = profiles.map(profile => ({
          ...profile,
          conversationId: conversationMap.get(profile.id),
        }));
        setContacts(contactsWithConversations);
      }
    } catch (error) {
      console.error("Error fetching contacts:", error);
    }
  };

  const toggleContactSelection = (contactId: string) => {
    setSelectedContacts(prev =>
      prev.includes(contactId)
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  const handleForward = async () => {
    if (selectedContacts.length === 0 || !user) return;

    setLoading(true);
    try {
      const forwardPromises = selectedContacts.map(async (contactId) => {
        const contact = contacts.find(c => c.id === contactId);
        if (!contact?.conversationId) return;

        // Insert forwarded message
        const { error } = await supabase
          .from("messages")
          .insert({
            content: messageContent,
            conversation_id: contact.conversationId,
            sender_id: user.id,
            message_type: "text",
            readers: [user.id],
          });

        if (error) throw error;
      });

      await Promise.all(forwardPromises);

      toast({
        title: "Message forwarded",
        description: `Message forwarded to ${selectedContacts.length} contact${selectedContacts.length > 1 ? 's' : ''}`,
      });

      onOpenChange(false);
      setSelectedContacts([]);
      setSearchQuery("");
    } catch (error) {
      console.error("Error forwarding message:", error);
      toast({
        title: "Forward failed",
        description: "Failed to forward message",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Forward message</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Message Preview */}
          <div className="bg-muted/50 rounded-lg p-3 border-l-4 border-primary">
            <p className="text-sm text-muted-foreground mb-1">Forwarding:</p>
            <p className="text-sm truncate">{messageContent}</p>
          </div>

          {/* Contacts List */}
          <div className="max-h-60 overflow-y-auto space-y-2">
            {filteredContacts.map((contact) => (
              <div
                key={contact.id}
                onClick={() => toggleContactSelection(contact.id)}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedContacts.includes(contact.id)
                    ? "bg-primary/10 border border-primary"
                    : "hover:bg-muted/50"
                }`}
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {contact.display_name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{contact.display_name}</p>
                  <p className="text-sm text-muted-foreground truncate">{contact.email}</p>
                </div>
                {selectedContacts.includes(contact.id) && (
                  <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {filteredContacts.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? "No contacts found" : "No contacts available"}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between items-center pt-4">
            <p className="text-sm text-muted-foreground">
              {selectedContacts.length} selected
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleForward}
                disabled={selectedContacts.length === 0 || loading}
              >
                <Send className="w-4 h-4 mr-2" />
                Forward
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ForwardMessageDialog;