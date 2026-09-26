const SUPABASE_URL =
    "https://dbqfhloiwtbbayciacvo.supabase.co";


const SUPABASE_KEY =
    "sb_publishable_F9N-XHeQ3vOF60ey-fLZaw_AZtWcmqh";


const supabaseClient =
    supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );