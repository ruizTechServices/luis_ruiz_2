import { MessageSquare } from "lucide-react";
import { ClientRoomCard } from "./ClientRoomCard";

export function ClientMessagesCard() {
  return (
    <ClientRoomCard
      title="Messages"
      description="Client messages and replies will appear here when secure messaging is connected."
      emptyTitle="No messages yet"
      emptyDescription="Use the contact path below for now."
      icon={MessageSquare}
      tone="warning"
    />
  );
}
