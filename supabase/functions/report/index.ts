import { createClient } from 'npm:@supabase/supabase-js@2'

const MAX_CLIENT_LENGTH = 100
const MAX_TEXT_LENGTH = 500
const STATES = ['running', 'done', 'error', 'finished']

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'content-type, authorization, apikey',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

function reply(status: number, body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

// JSON body first, query parameters as fallback (ACMP may not send a body).
async function readFields(req: Request): Promise<Record<string, unknown>> {
  const query = Object.fromEntries(new URL(req.url).searchParams)
  if (req.method !== 'POST') return query
  try {
    const body = await req.json()
    if (body && typeof body === 'object') return { ...query, ...body }
  } catch {
    // no or invalid JSON body: use the query parameters only
  }
  return query
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })
  if (req.method !== 'POST' && req.method !== 'GET') {
    return reply(405, { ok: false, error: 'Use POST' })
  }

  const fields = await readFields(req)
  const client = String(fields.client ?? '').trim()
  const text = String(fields.text ?? '').trim()
  const state = String(fields.state ?? 'running').trim()

  if (!client || client.length > MAX_CLIENT_LENGTH) {
    return reply(400, { ok: false, error: `client required, max ${MAX_CLIENT_LENGTH} chars` })
  }
  if (!text || text.length > MAX_TEXT_LENGTH) {
    return reply(400, { ok: false, error: `text required, max ${MAX_TEXT_LENGTH} chars` })
  }
  if (!STATES.includes(state)) {
    return reply(400, { ok: false, error: `state must be one of: ${STATES.join(', ')}` })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )
  const { error } = await supabase.from('events').insert({ client, text, state })
  if (error) {
    console.error('insert failed', error)
    return reply(500, { ok: false, error: 'could not store event' })
  }
  return reply(200, { ok: true })
})
