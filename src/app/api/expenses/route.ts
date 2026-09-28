import { NextRequest, NextResponse } from "next/server";
import { fetchTransactionsFromDb, createTransactionInDb } from "@/lib/services/finance";

/**
 * GET /api/expenses
 * Fetches all expenses
 */
export async function GET() {
  try {
    const allTx = await fetchTransactionsFromDb();
    const expenses = allTx ? allTx.filter((t) => t.type === "Expense") : [];
    return NextResponse.json({ success: true, expenses }, { status: 200 });
  } catch (err: unknown) {
    console.error("[API /api/expenses GET Error]", err);
    return NextResponse.json({ error: "Failed to fetch expenses" }, { status: 500 });
  }
}

/**
 * POST /api/expenses
 * Creates a new expense record
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const created = await createTransactionInDb({
      type: "Expense",
      amount: Number(body.amount),
      category: body.category || "Other Expenses",
      description: body.description || "Business expense",
      paymentMethod: body.paymentMethod || "UPI",
      date: body.date || new Date().toISOString().split("T")[0],
      status: "Completed",
      referenceNo: body.referenceNo,
    });

    return NextResponse.json({ success: true, expense: created }, { status: 201 });
  } catch (err: unknown) {
    console.error("[API /api/expenses POST Error]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
