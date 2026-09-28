import { createClient } from "@/lib/supabase/client";
import { Project, ProjectStatus } from "@/types";

export async function fetchProjectsFromDb(): Promise<Project[] | null> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("projects")
      .select("*, clients(business_name)")
      .order("due_date", { ascending: true });

    if (error || !data) return null;

    return data.map((row) => ({
      id: row.id,
      clientId: row.client_id,
      clientName: row.clients?.business_name || "Client",
      title: row.title,
      serviceType: row.service_type as any,
      startDate: row.start_date,
      dueDate: row.due_date,
      budget: Number(row.budget),
      actualCost: Math.round(Number(row.budget) * 0.35),
      assignedTeamIds: [],
      status: (row.status.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase())) as ProjectStatus,
      progress: row.status === "completed" ? 100 : row.status === "in_progress" ? 65 : 15,
    }));
  } catch {
    return null;
  }
}
