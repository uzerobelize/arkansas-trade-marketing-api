import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import { cors } from 'hono/cors';
import bookingsEndpoint from '@/routes/bookings';
import availabilityEndpoint from '@/routes/availability';

const app = new Hono().basePath('/hono-api');

app.get('/health', (c) => c.json({ status: 'ok', provider: 'supabase' }));
app.route('/bookings', bookingsEndpoint);
app.route('/availability', availabilityEndpoint);

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);
