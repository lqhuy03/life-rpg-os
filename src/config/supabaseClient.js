import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY

// QUAN TRỌNG: Phải có chữ 'export' ở đầu dòng này
export const supabase = createClient(supabaseUrl, supabaseKey)