import { list, memoryStore, push } from "@/lib/repositories/memory-store";
import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin";
import type { Jar } from "@/types/database";

export async function listJars(userId: string): Promise<Jar[]> {
  const supabase = createAdminClient();
  if (supabase && isSupabaseConfigured()) {
    const { data } = await supabase
      .from("jars")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });
    return (data as Jar[]) ?? [];
  }
  return list(memoryStore.jars, userId);
}

export async function createJar(
  userId: string,
  input: { name: string; target_amount?: number | null; color?: string }
): Promise<Jar> {
  const row: Jar = {
    id: crypto.randomUUID(),
    user_id: userId,
    name: input.name,
    target_amount: input.target_amount ?? null,
    balance: 0,
    color: input.color ?? "#33a1ff",
    icon: "piggy-bank",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const supabase = createAdminClient();
  if (supabase && isSupabaseConfigured()) {
    const { data } = await supabase.from("jars").insert(row).select().single();
    return (data as Jar) ?? row;
  }
  return push(memoryStore.jars, userId, row);
}

export async function updateJar(
  userId: string,
  jarId: string,
  input: Partial<Pick<Jar, "name" | "target_amount" | "color">>
): Promise<Jar | null> {
  const jars = await listJars(userId);
  const jar = jars.find((j) => j.id === jarId);
  if (!jar) return null;

  const updated = { ...jar, ...input, updated_at: new Date().toISOString() };
  const supabase = createAdminClient();
  if (supabase && isSupabaseConfigured()) {
    const { data } = await supabase
      .from("jars")
      .update(input)
      .eq("id", jarId)
      .eq("user_id", userId)
      .select()
      .single();
    return (data as Jar) ?? updated;
  }

  const arr = memoryStore.jars.get(userId) ?? [];
  memoryStore.jars.set(
    userId,
    arr.map((j) => (j.id === jarId ? updated : j))
  );
  return updated;
}

export async function deleteJar(userId: string, jarId: string): Promise<boolean> {
  const supabase = createAdminClient();
  if (supabase && isSupabaseConfigured()) {
    const { error } = await supabase
      .from("jars")
      .delete()
      .eq("id", jarId)
      .eq("user_id", userId);
    return !error;
  }
  memoryStore.jars.set(
    userId,
    list(memoryStore.jars, userId).filter((j) => j.id !== jarId)
  );
  return true;
}

export async function fundJar(
  userId: string,
  jarId: string,
  amount: number
): Promise<Jar | null> {
  const jars = await listJars(userId);
  const jar = jars.find((j) => j.id === jarId);
  if (!jar) return null;

  const newBalance = jar.balance + amount;
  const supabase = createAdminClient();
  if (supabase && isSupabaseConfigured()) {
    const { data } = await supabase
      .from("jars")
      .update({ balance: newBalance, updated_at: new Date().toISOString() })
      .eq("id", jarId)
      .eq("user_id", userId)
      .select()
      .single();
    return (data as Jar) ?? { ...jar, balance: newBalance };
  }

  const updated = { ...jar, balance: newBalance, updated_at: new Date().toISOString() };
  const arr = memoryStore.jars.get(userId) ?? [];
  memoryStore.jars.set(
    userId,
    arr.map((j) => (j.id === jarId ? updated : j))
  );
  return updated;
}
