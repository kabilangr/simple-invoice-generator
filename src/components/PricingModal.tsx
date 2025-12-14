// src/components/PricingModal.tsx
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/Card';
import { Check, X, CreditCard, Zap } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface PricingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    currentCredits: number;
}

const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onClose, onSuccess, currentCredits }) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState<string | null>(null);

    if (!isOpen) return null;

    const handlePurchase = async (type: 'credit' | 'subscription') => {
        if (!user) return;
        setLoading(type);

        try {
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    type,
                    userId: user.uid,
                    userEmail: user.email,
                }),
            });

            const { url, error } = await response.json();

            if (error) {
                throw new Error(error);
            }

            if (url) {
                window.location.href = url;
            }
        } catch (error: any) {
            console.error("Payment failed:", error);
            alert(`Payment failed: ${error.message}`);
            setLoading(null);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-auto">
                <div className="p-6 border-b flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">Upgrade Your Plan</h2>
                        <p className="text-slate-500">You've reached your free limit. Choose a plan to continue.</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="h-5 w-5" />
                    </Button>
                </div>
                
                <div className="p-8 grid md:grid-cols-2 gap-8">
                    {/* Pay Per Use */}
                    <Card className={`border-2 hover:border-indigo-200 transition-all ${loading === 'credit' ? 'ring-2 ring-indigo-500' : ''}`}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Zap className="h-5 w-5 text-orange-500" />
                                Credit Pack
                            </CardTitle>
                            <CardDescription>Best for occasional use</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="text-3xl font-bold text-slate-900">
                                ₹75 <span className="text-sm font-normal text-slate-500">/ 50 credits</span>
                            </div>
                            <ul className="space-y-2">
                                <li className="flex items-center gap-2 text-sm text-slate-600">
                                    <Check className="h-4 w-4 text-green-500" />
                                    50 Invoices (₹1.5/invoice)
                                </li>
                                <li className="flex items-center gap-2 text-sm text-slate-600">
                                    <Check className="h-4 w-4 text-green-500" />
                                    Full PDF export features
                                </li>
                                <li className="flex items-center gap-2 text-sm text-slate-600">
                                    <Check className="h-4 w-4 text-green-500" />
                                    No monthly commitment
                                </li>
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Button 
                                className="w-full" 
                                variant="outline"
                                onClick={() => handlePurchase('credit')}
                                disabled={!!loading}
                            >
                                {loading === 'credit' ? 'Processing...' : 'Buy 50 Credits'}
                            </Button>
                        </CardFooter>
                    </Card>

                    {/* Pro Subscription */}
                    <Card className={`border-2 border-indigo-600 relative overflow-hidden ${loading === 'subscription' ? 'ring-2 ring-indigo-500' : ''}`}>
                        <div className="absolute top-0 right-0 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                            RECOMMENDED
                        </div>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CreditCard className="h-5 w-5 text-indigo-600" />
                                Pro Subscription
                            </CardTitle>
                            <CardDescription>For growing businesses</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="text-3xl font-bold text-slate-900">
                                ₹300 <span className="text-sm font-normal text-slate-500">/ month</span>
                            </div>
                            <ul className="space-y-2">
                                <li className="flex items-center gap-2 text-sm text-slate-600">
                                    <Check className="h-4 w-4 text-green-500" />
                                    <strong>1000 Invoices</strong> per month
                                </li>
                                <li className="flex items-center gap-2 text-sm text-slate-600">
                                    <Check className="h-4 w-4 text-green-500" />
                                    Priority Support
                                </li>
                                <li className="flex items-center gap-2 text-sm text-slate-600">
                                    <Check className="h-4 w-4 text-green-500" />
                                    Remove Watermark (Coming soon)
                                </li>
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Button 
                                className="w-full bg-indigo-600 hover:bg-indigo-700"
                                onClick={() => handlePurchase('subscription')}
                                disabled={!!loading}
                            >
                                {loading === 'subscription' ? 'Processing...' : 'Subscribe Now'}
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
                
                <div className="p-6 bg-slate-50 text-center text-sm text-slate-500">
                    Secure payment processing powered by Stripe
                </div>
            </div>
        </div>
    );
};

export default PricingModal;
