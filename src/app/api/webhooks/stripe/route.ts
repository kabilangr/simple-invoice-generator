import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { getAdminDb, admin } from '@/lib/firebaseAdmin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock_key_for_build', {
    apiVersion: '2025-11-17.clover' as any,
});

export const dynamic = 'force-dynamic';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
    const body = await req.text();
    const signature = (await headers()).get('stripe-signature') as string;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
        console.error(`Webhook signature verification failed.`, err.message);
        return NextResponse.json({ error: err.message }, { status: 400 });
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        const metadata = session.metadata;

        if (metadata && metadata.userId) {
            const userId = metadata.userId;
            const type = metadata.type;

            try {
                const adminDb = getAdminDb();
                const userRef = adminDb.collection('users').doc(userId);

                if (type === 'credit') {
                    const creditsToAdd = parseInt(metadata.credits || '0', 10);
                    if (creditsToAdd > 0) {
                        await userRef.update({
                            credits: admin.firestore.FieldValue.increment(creditsToAdd),
                            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                        });
                        console.log(`Added ${creditsToAdd} credits to user ${userId}`);
                    }
                } else if (type === 'subscription') {
                    // Set expiry to 1 month from now
                    const expiryDate = new Date();
                    expiryDate.setMonth(expiryDate.getMonth() + 1);

                    await userRef.update({
                        subscriptionStatus: 'pro',
                        subscriptionExpiry: admin.firestore.Timestamp.fromDate(expiryDate),
                        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                    });
                    console.log(`Upgraded user ${userId} to Pro`);
                }
            } catch (error) {
                console.error('Error updating Firestore:', error);
                return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
            }
        }
    }

    return NextResponse.json({ received: true });
}
