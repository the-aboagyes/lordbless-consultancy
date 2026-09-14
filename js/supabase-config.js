/* ============================================================
   LORDBLESS CONSULTANCY
   SUPABASE CONFIGURATION
   ============================================================ */

const LORDBLESS_SUPABASE_URL =
    "https://rqlcjaaibmdfdfsemcrc.supabase.co";

const LORDBLESS_SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_B6NF8O3skzgY36YCzZzMdQ_oBxDpqF-";


const lordblessSupabase =
    window.supabase.createClient(
        LORDBLESS_SUPABASE_URL,
        LORDBLESS_SUPABASE_PUBLISHABLE_KEY
    );