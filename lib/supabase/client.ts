import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = 'https://xjbzyrrjprqxvrgxfryd.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqYnp5cnJqcHJxeHZyZ3hmcnlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0MDc5MjgsImV4cCI6MjA2Nzk4MzkyOH0.aK3EIcsV80-gTXoNCnvX8JQRiJxel911dhs8qO3X20Y'

export const createClient = () =>
  createBrowserClient(supabaseUrl, supabaseAnonKey)

export const supabase = createClient()