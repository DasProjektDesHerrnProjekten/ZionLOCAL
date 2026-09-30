import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } } }
    )

    const { method } = req

    if (method === 'POST') {
      const body = await req.json()
      const { action } = body

      if (action === 'update-password') {
        // Update password (stores as plain text only)
        const { admission_id, new_password } = body

        if (!admission_id || !new_password) {
          return new Response(
            JSON.stringify({ error: 'Missing admission_id or new_password' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Store password as plain text
        const { data, error } = await supabaseClient
          .from('students')
          .update({ password: new_password })
          .eq('admission_id', admission_id)
          .select()

        if (error) {
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ success: true, data }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      if (action === 'reset-password') {
        // Reset password for a student by admin
        const { admission_id, new_password, admin_key } = body

        // Simple admin key validation (you should use proper auth in production)
        if (admin_key !== Deno.env.get('ADMIN_RESET_KEY')) {
          return new Response(
            JSON.stringify({ error: 'Unauthorized' }),
            { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        if (!admission_id || !new_password) {
          return new Response(
            JSON.stringify({ error: 'Missing admission_id or new_password' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const { data, error } = await supabaseClient
          .from('students')
          .update({ password: new_password })
          .eq('admission_id', admission_id)
          .select()

        if (error) {
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ success: true, data }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      if (action === 'verify-password') {
        // Verify password for login (plain text only)
        const { admission_id, password } = body

        if (!admission_id || !password) {
          return new Response(
            JSON.stringify({ error: 'Missing admission_id or password' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const { data, error } = await supabaseClient
          .from('students')
          .select('*')
          .eq('admission_id', admission_id)
          .single()

        if (error || !data) {
          return new Response(
            JSON.stringify({ error: 'Student not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Direct plain text comparison
        if (data.password !== password) {
          return new Response(
            JSON.stringify({ error: 'Invalid password' }),
            { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Return student data without password
        const { password: _, ...studentData } = data
        return new Response(
          JSON.stringify({ success: true, student: studentData }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      if (action === 'migrate-to-plain') {
        // Migrate from bcrypt to plain text (for admin use)
        const { admission_id, admin_key, new_password } = body

        if (admin_key !== Deno.env.get('ADMIN_RESET_KEY')) {
          return new Response(
            JSON.stringify({ error: 'Unauthorized' }),
            { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        if (!admission_id || !new_password) {
          return new Response(
            JSON.stringify({ error: 'Missing admission_id or new_password' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Get current student data
        const { data: studentData, error: fetchError } = await supabaseClient
          .from('students')
          .select('*')
          .eq('admission_id', admission_id)
          .single()

        if (fetchError || !studentData) {
          return new Response(
            JSON.stringify({ error: 'Student not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Check if password is bcrypt hashed
        const isBcryptHash = studentData.password.startsWith('$2a$') || studentData.password.startsWith('$2b$')

        if (!isBcryptHash) {
          return new Response(
            JSON.stringify({ error: 'Password is already plain text', already_plain: true }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Update to plain text password
        const { data, error } = await supabaseClient
          .from('students')
          .update({ password: new_password })
          .eq('admission_id', admission_id)
          .select()

        if (error) {
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ success: true, data, message: 'Password migrated to plain text successfully' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    return new Response(
      JSON.stringify({ error: 'Action not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})