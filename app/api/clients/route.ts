import { NextRequest, NextResponse } from "next/server";
import { fetchClientsFromDb, createClientInDb } from "@/lib/services/clients";
import { createClient } from "@/lib/supabase/client";

/**
 * GET /api/clients
 * Fetches all clients from Supabase DB or fallback seed
 */
export async function GET() {
  try {
    const clients = await fetchClientsFromDb();
    return NextResponse.json({ success: true, clients: clients || [] }, { status: 200 });
  } catch (err: unknown) {
    console.error("[API /api/clients GET Error]", err);
    return NextResponse.json({ error: "Failed to fetch clients" }, { status: 500 });
  }
}

/**
 * POST /api/clients
 * Creates a new client in database
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const created = await createClientInDb(body);

    if (!created) {
      return NextResponse.json({ error: "Failed to create client" }, { status: 400 });
    }

    return NextResponse.json({ success: true, client: created }, { status: 201 });
  } catch (err: unknown) {
    console.error("[API /api/clients POST Error]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
