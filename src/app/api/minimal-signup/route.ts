export async function GET(req: Request) {
  return Response.json({ message: "This endpoint only accepts POST requests" }, { status: 405 })
}

export async function POST(req: Request) {
  return Response.json({ 
    test: "ok", 
    method: "POST",
    timestamp: new Date().toISOString() 
  })
}
