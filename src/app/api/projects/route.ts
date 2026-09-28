import { NextRequest, NextResponse } from "next/server";
import { fetchProjectsFromDb } from "@/lib/services/projects";
import { createClient } from "@/lib/supabase/client";

/**
 * GET /api/projects
 * Fetches all projects
 */
export async function GET() {
  try {
    const projects = await fetchProjectsFromDb();
    return NextResponse.json({ success: true, projects: projects || [] }, { status: 200 });
  } catch (err: unknown) {
    console.error("[API /api/projects GET Error]", err);
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}

/**
 * POST /api/projects
 * Creates a new project in database
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clientId, title, serviceType, budget, dueDate } = body;

    if (!title || !budget) {
      return NextResponse.json({ error: "Title and budget are required" }, { status: 400 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    let newProject: any = null;

    if (url && url.includes("supabase.co") && !url.includes("demo")) {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("projects")
        .insert({
          client_id: clientId || null,
          title,
          service_type: serviceType || "Website Development",
          budget: Number(budget),
          due_date: dueDate || new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
          status: "in_progress",
        })
        .select()
        .single();

      if (error) throw error;
      newProject = data;
    } else {
      newProject = {
        id: `proj-${Date.now()}`,
        clientId,
        title,
        serviceType,
        budget: Number(budget),
        dueDate: dueDate || "2026-10-15",
        status: "In Progress",
      };
    }

    return NextResponse.json({ success: true, project: newProject }, { status: 201 });
  } catch (err: unknown) {
    console.error("[API /api/projects POST Error]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
