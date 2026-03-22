// This module is the shared singleton — never imports from route files
declare global {
  var notificationConnections: Map<string, ReadableStreamDefaultController> | undefined;
}
const connections: Map<string, ReadableStreamDefaultController> = globalThis.notificationConnections ?? new Map();

if (!globalThis.notificationConnections) {
  globalThis.notificationConnections = connections;
}

export function registerConnection(userId: string, controller: ReadableStreamDefaultController) {
  connections.set(userId, controller);
}

export function removeConnection(userId: string) {
  connections.delete(userId);
}

export function sendToUser(userId: string, data: object) {
  const controller = connections.get(userId);
  // console.log(`sendToUser: ${userId}, connected: ${!!controller}`); 
  if (controller) {
    try {
      controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);
    } catch {
      connections.delete(userId);
    }
  }
}