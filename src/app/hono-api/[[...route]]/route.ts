import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import bookings from '@/routes/bookings';

const app = new Hono().basePath('/hono-api');

app.get('/health', (c) => c.json({ status: 'ok', provider: 'supabase' }));
app.route('/bookings', bookings);

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);
