export type ContactSubject =
  | "general"
  | "quote"
  | "support"
  | "partnership"
  | "billing"
  | "other"
  | string;

export type ContactPreferredMethod = "email" | "phone" | "either" | string;

export interface ContactRecord {
  id: number;
  created_at: string;
  full_name: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  company: string | null;
  subject: ContactSubject | null;
  message: string | null;
  budget: string | null;
  timeline: string | null;
  preferred_contact: ContactPreferredMethod | null;
  newsletter: boolean;
}

export interface ContactListResult {
  data: ContactRecord[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ContactAdminFilters {
  query?: string;
  subject?: string;
  newsletter?: "all" | "subscribed" | "unsubscribed";
}
