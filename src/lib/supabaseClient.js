import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs'

// Ini adalah client untuk digunakan di sisi browser (Client Components)
export const supabase = createPagesBrowserClient({
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
})