import type { IncomingMessage, ServerResponse } from 'node:http';
import { handleApiRequest } from '../src/server/apiRoutes.ts';

// Vercel invokes this function for /api/* requests.
// Keep the shared API handler so local development and deployment use the same routes.
export default async function handler(
  req: IncomingMessage & { url?: string; method?: string; headers: Record<string, string | string[] | undefined> },
  res: ServerResponse & { statusCode: number; writableEnded: boolean },
) {
  try {
    await handleApiRequest(req, res, () => {
      if (!res.writableEnded) {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify({ success: false, message: 'API route not found' }));
      }
    });
  } catch (error) {
    console.error('[KBZLife LMS] API request failed:', error);
    if (!res.writableEnded) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ success: false, message: 'Internal server error' }));
    }
  }
}
