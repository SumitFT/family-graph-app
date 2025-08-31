import { supabase } from "@/lib/supabaseClient";

export async function addPerson(personData: any) {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not logged in");
  }

  const { data, error } = await supabase
    .from("persons")
    .insert([
      {
        ...personData,
        created_by: user.id,   // ✅ match your DB column
      }
    ]);

  if (error) {
    console.error(error);
    throw error;
  }

  return data;
}
