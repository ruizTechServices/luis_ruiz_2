import { Clock3 } from "lucide-react";
import { ClientRoomCard } from "./ClientRoomCard";

export function ClientUpdatesCard() {
  return (
    <ClientRoomCard
      title="Recent Updates"
      description="Project-specific updates will appear here when a client workspace is active."
      emptyTitle="No client updates yet"
      emptyDescription="Updates here will be scoped to this signed-in client account."
      icon={Clock3}
      tone="info"
    />
  );
}
