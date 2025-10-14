import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient as SupabaseClientType } from "@supabase/supabase-js";

import type { Database } from "./database.types.ts";

const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.SUPABASE_KEY;

export const supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Export SupabaseClient type for use in services
export type SupabaseClient = SupabaseClientType<Database>;

// Default user ID for testing purposes
export const DEFAULT_USER_ID = "05e16d08-11f7-4dd8-ba4a-02adafce222f";
