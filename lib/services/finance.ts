import { createClient } from "@/lib/supabase/client";
import { Transaction, TransactionType, IncomeCategory, ExpenseCategory } from "@/types";
import { z } from "zod";

export const transactionSchema = z.object({
  type: z.enum(["Income", "Expense"]),
  amount: z.number().positive("Amount must be greater than 0"),
  category: z.string(),
  description: z.string().min(2, "Description is required"),
  paymentMethod: z.enum(["UPI", "Bank Transfer", "Credit Card", "Cash", "Check"]),
  date: z.string(),
});

export async function fetchTransactionsFromDb(): Promise<Transaction[] | null> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("transactions")
      .select("*, clients(business_name)")
      .order("transaction_date", { ascending: false });

    if (error || !data) return null;

    return data.map((row) => ({
      id: row.id,
      type: (row.transaction_type.charAt(0).toUpperCase() + row.transaction_type.slice(1)) as TransactionType,
      amount: Number(row.amount),
      category: row.category as IncomeCategory | ExpenseCategory,
      date: row.transaction_date,
      clientId: row.client_id,
      clientName: row.clients?.business_name,
      description: row.description,
      paymentMethod: row.payment_method,
      status: (row.status.charAt(0).toUpperCase() + row.status.slice(1)) as any,
      referenceNo: row.reference_number,
    }));
  } catch {
    return null;
  }
}

export async function createTransactionInDb(txData: Omit<Transaction, "id">) {
  try {
    const validated = transactionSchema.parse(txData);
    const supabase = createClient();

    const { data, error } = await supabase
      .from("transactions")
      .insert({
        transaction_code: `TX-${Date.now().toString().slice(-6)}`,
        transaction_type: validated.type.toLowerCase(),
        category: validated.category.toLowerCase().replace(/ /g, "_"),
        amount: validated.amount,
        transaction_date: validated.date,
        description: validated.description,
        payment_method: validated.paymentMethod,
        reference_number: txData.referenceNo || `REF/${Date.now()}`,
        status: "approved",
        source: "manual",
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error("Error creating transaction in Supabase:", err);
    return null;
  }
}
