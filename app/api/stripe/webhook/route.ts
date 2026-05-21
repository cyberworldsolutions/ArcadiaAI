import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getSupabase } from '@/app/lib/supabase';
const supabase = getSupabase();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-04-22.dahlia',

});

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature')!;

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  const data = event.data.object;

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = data as any;

      const orgId = session.metadata.organization_id;

      await supabase.from('subscriptions').insert({
        organization_id: orgId,
        stripe_customer_id: session.customer,
        stripe_subscription_id: session.subscription,
        plan: session.metadata.plan,
        status: 'active',
        current_period_start: new Date(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });

      break;
    }

    case 'customer.subscription.updated':
    case 'customer.subscription.created': {
      const sub = data as any;

      await supabase
        .from('subscriptions')
        .update({
          status: sub.status,
          current_period_start: new Date(sub.current_period_start * 1000),
          current_period_end: new Date(sub.current_period_end * 1000),
        })
        .eq('stripe_subscription_id', sub.id);

      break;
    }

    case 'customer.subscription.deleted': {
      const sub = data as any;

      await supabase
        .from('subscriptions')
        .update({
          status: 'canceled',
        })
        .eq('stripe_subscription_id', sub.id);

      break;
    }

    case 'invoice.payment_failed': {
      const invoice = data as any;

      await supabase
        .from('subscriptions')
        .update({
          status: 'past_due',
        })
        .eq('stripe_subscription_id', invoice.subscription);

      break;
    }
  }

  return NextResponse.json({ received: true });
}
