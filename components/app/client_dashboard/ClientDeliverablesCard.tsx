import { FileCheck2 } from "lucide-react";
import { ClientRoomCard } from "./ClientRoomCard";

export function ClientDeliverablesCard() {
  return (
    <ClientRoomCard
      title="Deliverables"
      description="Files, handoff notes, and launch assets will appear here."
      emptyTitle="No deliverables posted"
      emptyDescription="This card is reserved for client-specific project assets."
      icon={FileCheck2}
      tone="violet"
    />
  );
}
