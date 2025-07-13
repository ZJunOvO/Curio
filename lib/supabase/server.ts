import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const createClient = () => {
  const cookieStore = cookies()
  
  const supabaseUrl = 'https://xjbzyrrjprqxvrgxfryd.supabase.co'
  const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqYnp5cnJqcHJxeHZyZ3hmcnlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0MDc5MjgsImV4cCI6MjA2Nzk4MzkyOH0.aK3EIcsV80-gTXoNCnvX8JQRiJxel911dhs8qO3X20Y'

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}