// Minimal route with no imports to test basic functionality
export async function GET(req: Request) {
  return new Response(JSON.stringify({ 
    message: "GET request received",
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  })
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    
    return new Response(JSON.stringify({ 
      message: "POST request received",
      timestamp: new Date().toISOString(),
      method: req.method,
      body: body,
      url: req.url
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ 
      message: "Error processing request",
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })
  }
}

export async function OPTIONS(req: Request) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  })
}
