import { createClient } from "@/lib/supabase/client";
import { Client, ClientStatus } from "@/types";
import { z } from "zod";

export const clientSchema = z.object({
  name: z.string().min(2, "Client name is required"),
  industry: z.string().min(2, "Industry is required"),
  contactPerson: z.string().min(2, "Contact person is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(5, "Phone is required"),
  monthlyPackage: z.number().min(0),
  accountStatus: z.enum(["Active", "Onboarding", "Lead", "Paused", "Closed"]),
});

export async function fetchClientsFromDb(): Promise<Client[] | null> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data) return null;

    return data.map((row) => ({
      id: row.id,
      name: row.business_name,
      industry: row.industry,
      contactPerson: row.contact_person,
      email: row.email,
      phone: row.phone,
      services: ["Social Media Management", "Video Shoot"],
      monthlyPackage: Number(row.agreed_package || 75000),
      amountDue: Number(row.amount_due || 0),
      lastPaymentDate: row.last_payment_date || row.onboarding_date || "2026-08-01",
      nextBillingDate: row.next_billing_date || "2026-10-01",
      accountStatus: (row.status.charAt(0).toUpperCase() + row.status.slice(1)) as ClientStatus,
      notes: row.notes || "",
      createdAt: row.created_at,
    }));
  } catch {
    return null;
  }
}

export async function createClientInDb(clientData: Omit<Client, "id" | "createdAt">) {
  try {
    const validated = clientSchema.parse(clientData);
    const supabase = createClient();

    const { data, error } = await supabase
      .from("clients")
      .insert({
        client_code: `CLI-${Date.now().toString().slice(-4)}`,
        business_name: validated.name,
        industry: validated.industry,
        contact_person: validated.contactPerson,
        email: validated.email,
        phone: validated.phone,
        status: validated.accountStatus.toLowerCase(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error("Error creating client in Supabase:", err);
    return null;
  }
}
