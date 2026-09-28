import { NextRequest, NextResponse } from "next/server";
import { fetchTransactionsFromDb, createTransactionInDb } from "@/lib/services/finance";

/**
 * GET /api/payments
 * Fetches all income payments
 */
export async function GET() {
  try {
    const allTx = await fetchTransactionsFromDb();
    const payments = allTx ? allTx.filter((t) => t.type === "Income") : [];
    return NextResponse.json({ success: true, payments }, { status: 200 });
  } catch (err: unknown) {
    console.error("[API /api/payments GET Error]", err);
    return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 });
  }
}

/**
 * POST /api/payments
 * Creates a new income payment record
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const created = await createTransactionInDb({
      type: "Income",
      amount: Number(body.amount),
      category: body.category || "Monthly Subscription",
      description: body.description || "Income payment",
      paymentMethod: body.paymentMethod || "UPI",
      date: body.date || new Date().toISOString().split("T")[0],
      clientId: body.clientId,
      clientName: body.clientName,
      status: "Completed",
      referenceNo: body.referenceNo,
    });

    return NextResponse.json({ success: true, payment: created }, { status: 201 });
  } catch (err: unknown) {
    console.error("[API /api/payments POST Error]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
