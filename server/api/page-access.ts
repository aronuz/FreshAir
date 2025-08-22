import { createClient } from '@supabase/supabase-js'
// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_KEY!

// Create the Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  
  const { data, error } = await supabase.from('page_access').select('*').eq('to', query.path);
  return data && data.length ? data[0] : { error: error ?? 'Page access rule not found' };
});
