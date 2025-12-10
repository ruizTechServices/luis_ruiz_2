// c:\Users\giost\CascadeProjects\websites\luis-ruiz\luis_ruiz_2\lib\db\contactlist.ts
import { createClient as createServerClient } from "@/lib/clients/supabase/server";

export interface Contact {
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
  newsletter: boolean;
}

export interface PaginatedContacts {
  data: Contact[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Get contacts for admin view with pagination.
 * Requires admin role via RLS.
 */
export async function getContactsForAdmin(options?: {
  page?: number;
  pageSize?: number;
}): Promise<PaginatedContacts> {
  const supabase = await createServerClient();
  const page = options?.page ?? 1;
  const pageSize = options?.pageSize ?? 20;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  // Get total count
  const { count, error: countErr } = await supabase
    .from("contactlist")
    .select("*", { count: "exact", head: true });

  if (countErr) throw countErr;

  // Get paginated data
  const { data, error } = await supabase
    .from("contactlist")
    .select("*")
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw error;

  return {
    data: (data ?? []) as Contact[],
    count: count ?? 0,
    page,
    pageSize,
    totalPages: Math.ceil((count ?? 0) / pageSize),
  };
}

/**
 * Get a single contact by ID.
 */
export async function getContactById(id: number): Promise<Contact | null> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("contactlist")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data as Contact | null;
}

/**
 * Delete a contact by ID.
 * Requires admin role via RLS.
 */
export async function deleteContact(id: number): Promise<void> {
  const supabase = await createServerClient();
  const { error } = await supabase.from("contactlist").delete().eq("id", id);
  if (error) throw error;
}

/**
 * Update a contact by ID.
 * Requires admin role via RLS.
 */
export async function updateContact(
  id: number,
  updates: Partial<Omit<Contact, "id" | "created_at">>
): Promise<Contact | null> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("contactlist")
    .update(updates)
    .eq("id", id)
    .select()
    .maybeSingle();

  if (error) throw error;
  return data as Contact | null;
}
