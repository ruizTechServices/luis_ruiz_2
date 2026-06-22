import { CreditCard } from "lucide-react";
import { ClientRoomCard } from "./ClientRoomCard";

export function ClientInvoicesCard() {
  return (
    <ClientRoomCard
      title="Invoices / Payments"
      description="Invoice and payment status will appear here when billing is attached to a client project."
      emptyTitle="No invoices available"
      emptyDescription="Payment details are not connected to this dashboard yet."
      icon={CreditCard}
      tone="mint"
    />
  );
}
