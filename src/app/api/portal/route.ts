import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getAdminDb } from '@/lib/firebaseAdmin';

const stripeKey = process.env.STRIPE_SECRET_KEY || 'dummy_key_for_build';
const stripe = new Stripe(stripeKey, {
    apiVersion: '2025-11-17.clover' as any,
});

export async function POST(req: Request) {
    try {
        const { userId, returnUrl } = await req.json();

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        // Get user from Firestore to find Stripe Customer ID
        const adminDb = getAdminDb();
        const userDoc = await adminDb.collection('users').doc(userId).get();
        const userData = userDoc.data();

        if (!userData || !userData.stripeCustomerId) {
            return NextResponse.json({ error: 'No billing account found' }, { status: 404 });
        }

        // Create Portal Session
        const session = await stripe.billingPortal.sessions.create({
            customer: userData.stripeCustomerId,
            return_url: returnUrl || `${process.env.NEXT_PUBLIC_BASE_URL}/settings`,
        });

        return NextResponse.json({ url: session.url });
    } catch (error: any) {
        console.error('Error creating portal session:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
