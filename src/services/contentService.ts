import { supabase } from "./supabase";

export type ContentType = "video" | "lesson" | "case_blueprint" | "case_full" | "template";

export interface ContentItem {
  id: string;
  type: ContentType;
  domain: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  title: string;
  summary?: string | null;
  content_json: any;
  external_url?: string | null;
  storage_path?: string | null;
  tags: string[];
  status: "draft" | "published";
  created_at: string;
  updated_at?: string;
}

export interface WeekContentMapRow {
  id: string;
  program_id: string;
  week_no: number;
  content_item_id: string;
  order_index: number;
  required: boolean;
}

export async function listWeekContent(programId: string, weekNo: number): Promise<ContentItem[]> {
  // 1) get mapping rows
  const { data: mapRows, error: mapErr } = await supabase
    .from("program_week_content_map")
    .select("id, program_id, week_no, content_item_id, order_index, required")
    .eq("program_id", programId)
    .eq("week_no", weekNo)
    .order("order_index", { ascending: true });

  if (mapErr) throw mapErr;

  const ids = (mapRows as WeekContentMapRow[] | null)?.map((r) => r.content_item_id) || [];
  if (!ids.length) return [];

  // 2) fetch content items
  const { data: items, error: itemsErr } = await supabase
    .from("content_items")
    .select("id, type, domain, difficulty, title, summary, content_json, external_url, storage_path, tags, status, created_at, updated_at")
    .in("id", ids);

  if (itemsErr) throw itemsErr;

  const itemMap = new Map<string, ContentItem>((items || []).map((x: any) => [x.id, x as ContentItem]));

  // 3) return in map order
  return (mapRows || [])
    .map((r: any) => itemMap.get(r.content_item_id))
    .filter(Boolean) as ContentItem[];
}

export async function saveContentItem(payload: Partial<ContentItem>): Promise<ContentItem> {
  const { data, error } = await supabase.from("content_items").insert(payload).select("*").single();
  if (error) throw error;
  return data as ContentItem;
}

export async function mapContentToWeek(params: {
  programId: string;
  weekNo: number;
  contentItemId: string;
  orderIndex?: number;
  required?: boolean;
}) {
  const row = {
    program_id: params.programId,
    week_no: params.weekNo,
    content_item_id: params.contentItemId,
    order_index: params.orderIndex ?? 0,
    required: params.required ?? true,
  };

  const { data, error } = await supabase.from("program_week_content_map").insert(row).select("*").single();
  if (error) throw error;
  return data;
}

export async function saveDatasetForContentItem(contentItemId: string, datasetJson: any, schemaJson: any) {
  const { data, error } = await supabase
    .from("datasets")
    .insert({
      content_item_id: contentItemId,
      format: "json",
      dataset_json: datasetJson,
      schema_json: schemaJson,
    })
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function getDatasetByContentItem(contentItemId: string) {
  const { data, error } = await supabase.from("datasets").select("*").eq("content_item_id", contentItemId).single();
  if (error) return null;
  return data;
}
