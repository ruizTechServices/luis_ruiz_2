import { createClient as createServerClient } from "@/lib/clients/supabase/server";
import type { ContactAdminFilters, ContactListResult, ContactRecord } from "@/lib/types/contact";

interface ContactRow {
  id: number;
  created_at: string;
  full_name: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  company: string | null;
  subject: string | null;
  message: string | null;
  budget: string | null;
  timeline: string | null;
  preferred_contact: string | null;
  newsletter: boolean | null;
}

const CONTACT_SELECT = [
  "id",
  "created_at",
  "full_name",
  "first_name",
  "last_name",
  "email",
  "phone",
  "company",
  "subject",
  "message",
  "budget",
  "timeline",
  "preferred_contact",
  "newsletter",
].join(", ");

export async function getContactsForAdmin(options?: {
  page?: number;
  pageSize?: number;
}): Promise<ContactListResult> {
  const supabase = await createServerClient();
  const page = options?.page ?? 1;
  const pageSize = options?.pageSize ?? 20;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { count, error: countErr } = await supabase
    .from("contactlist")
    .select("id", { count: "exact", head: true });

  if (countErr) throw countErr;

  const { data, error } = await supabase
    .from("contactlist")
    .select(CONTACT_SELECT)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw error;

  return {
    data: (data ?? []).map(mapContactRow),
    count: count ?? 0,
    page,
    pageSize,
    totalPages: Math.ceil((count ?? 0) / pageSize),
  };
}

export async function getContactById(id: number): Promise<ContactRecord | null> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("contactlist")
    .select(CONTACT_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data ? mapContactRow(data as ContactRow) : null;
}

function mapContactRow(row: ContactRow): ContactRecord {
  return {
    ...row,
    subject: row.subject,
    preferred_contact: row.preferred_contact,
    newsletter: Boolean(row.newsletter),
  };
}

export async function deleteContact(id: number): Promise<void> {
  const supabase = await createServerClient();
  const { error } = await supabase.from("contactlist").delete().eq("id", id);
  if (error) throw error;
}

export function filterContacts(records: ContactRecord[], filters: ContactAdminFilters): ContactRecord[] {
  const query = filters.query?.trim().toLowerCase() ?? "";
  const subject = filters.subject?.trim().toLowerCase() ?? "all";
  const newsletter = filters.newsletter ?? "all";

  return records.filter((record) => {
    const matchesQuery =
      query.length === 0 ||
      [
        record.full_name,
        record.first_name,
        record.last_name,
        record.email,
        record.company,
        record.subject,
        record.message,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));

    const matchesSubject = subject === "all" || String(record.subject ?? "").toLowerCase() === subject;

    const matchesNewsletter =
      newsletter === "all" ||
      (newsletter === "subscribed" && record.newsletter) ||
      (newsletter === "unsubscribed" && !record.newsletter);

    return matchesQuery && matchesSubject && matchesNewsletter;
  });
}
