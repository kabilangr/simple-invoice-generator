import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock_key_for_build', {
    apiVersion: '2025-11-17.clover' as any, 
});

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const { type, userId, userEmail } = await req.json();

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        let sessionConfig: Stripe.Checkout.SessionCreateParams;
        const successUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/invoices?payment=success`;
        const cancelUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/invoices?payment=cancelled`;

        if (type === 'credit') {
            // Credit Pack: 50 Credits for ₹75
            sessionConfig = {
                payment_method_types: ['card'],
                line_items: [
                    {
                        price_data: {
                            currency: 'inr',
                            product_data: {
                                name: '50 Invoice Credits',
                                description: 'Credits to generate 50 invoices',
                            },
                            unit_amount: 7500, // ₹75.00
                        },
                        quantity: 1,
                    },
                ],
                mode: 'payment',
                success_url: successUrl,
                cancel_url: cancelUrl,
                customer_email: userEmail,
                metadata: {
                    userId,
                    type: 'credit',
                    credits: '50',
                },
            };
        } else if (type === 'subscription') {
            // Pro Subscription: ₹300 / month
            sessionConfig = {
                payment_method_types: ['card'],
                line_items: [
                    {
                        price_data: {
                            currency: 'inr',
                            product_data: {
                                name: 'Pro Subscription',
                                description: 'Unlimited invoices for 1 month',
                            },
                            unit_amount: 30000, // ₹300.00
                            recurring: {
                                interval: 'month',
                            },
                        },
                        quantity: 1,
                    },
                ],
                mode: 'subscription',
                success_url: successUrl,
                cancel_url: cancelUrl,
                customer_email: userEmail,
                metadata: {
                    userId,
                    type: 'subscription',
                },
            };
        } else {
            return NextResponse.json({ error: 'Invalid payment type' }, { status: 400 });
        }

        const session = await stripe.checkout.sessions.create(sessionConfig);

        return NextResponse.json({ sessionId: session.id, url: session.url });
    } catch (error: any) {
        console.error('Stripe Checkout Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
