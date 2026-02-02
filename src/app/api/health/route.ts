export const runtime = 'edge'

export async function GET() {
  return new Response(JSON.stringify({
    ok: true,
    time: new Date().toISOString(),
    debug: 'edge-runtime-test'
  }), {
    headers: { 'Content-Type': 'application/json' }
  })
}
