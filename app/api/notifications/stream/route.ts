//  SSE connection (MUST be Route Handler)

import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-providers";
import { registerConnection, removeConnection } from "@/lib/notificationConncetions";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const userId = session.user.id;

  const stream = new ReadableStream({
    start(controller) {
  registerConnection(userId, controller);
  // console.log(`SSE connected: ${userId}`); 
  controller.enqueue(`data: ${JSON.stringify({ type: "connected" })}\n\n`);
  
  req.signal.addEventListener("abort", () => {
    removeConnection(userId);
    // console.log(`SSE disconnected: ${userId}`); 
    try { controller.close(); } catch {}
  });
},
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}