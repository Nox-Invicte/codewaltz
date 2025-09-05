import { createClient } from "@/lib/supabase/client";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";

export async function getAvatarUrl(userId: string): Promise<string | undefined> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("avatar")
    .select("name")
    .eq("owner", userId)
    .single();

  if (error || !data?.name) return undefined;
  return `${SUPABASE_URL}/storage/v1/object/public/avatars/${data.name}`;
}
