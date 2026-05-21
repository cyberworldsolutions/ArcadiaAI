// app/api/stripe/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripeSecret = process.env.STRIPE_SECRET_KEY!;
if (!stripeSecret) throw new Error('Missing STRIPE_SECRET_KEY');

const stripe = new Stripe(stripeSecret, { apiVersion: '2026-04-22.dahlia' });

export const runtime = 'edge'; // or 'nodejs' depending on your setup

export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature') || '';
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) return NextResponse.json({ error: 'Missing STRIPE_WEBHOOK_SECRET' }, { status: 500 });

  // Read raw body
  const buf = await req.arrayBuffer();
  const raw = Buffer.from(buf); // If Buffer is not available in your runtime, use Uint8Array.from(buf)

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, webhookSecret);
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook signature verification failed: ${err.message}` }, { status: 400 });
  }

  // handle event
  switch (event.type) {
    case 'checkout.session.completed':
      // handle checkout
      break;
    // add other events
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
