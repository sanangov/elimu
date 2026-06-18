export async function POST(req) {
  const { pin } = await req.json()
  const correctPin = process.env.ADMIN_PIN
  if (pin === correctPin) {
    return Response.json({ valid: true })
  }
  return Response.json({ valid: false }, { status: 401 })
}