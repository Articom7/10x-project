import { defineMiddleware } from "astro:middleware";
import { createClient } from "@supabase/supabase-js";

import type { Database } from "../db/database.types.ts";

const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.SUPABASE_KEY;

export const onRequest = defineMiddleware(async (context, next) => {
  // Extract JWT token from Authorization header
  const authHeader = context.request.headers.get("Authorization");
  
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    
    // Create Supabase client with user's auth token
    const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    });
    
    // Verify token and get user
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (!error && user) {
      context.locals.supabase = supabase;
      context.locals.user = user;
    } else {
      // Token invalid - use anonymous client
      context.locals.supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
      context.locals.user = null;
    }
  } else {
    // No token - use anonymous client
    context.locals.supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
    context.locals.user = null;
  }
  
  return next();
});
