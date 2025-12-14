'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Zap, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { IUserProfile } from '@/type/userProfile';
import PricingModal from '@/components/PricingModal';

interface SubscriptionSettingsProps {
    profile: IUserProfile | null;
}

export const SubscriptionSettings: React.FC<SubscriptionSettingsProps> = ({ profile }) => {
    const [isPricingOpen, setIsPricingOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleManageSubscription = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/portal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    userId: profile?.userId,
                    returnUrl: window.location.href 
                }),
            });
            
            const data = await response.json();
            if (data.url) {
                window.location.href = data.url;
            } else if (data.error) {
                alert(data.error);
            }
        } catch (error) {
            console.error('Error opening portal:', error);
            alert('Failed to open billing portal');
        } finally {
            setLoading(false);
        }
    };

    const isPro = profile?.subscriptionStatus === 'pro';

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Current Plan</CardTitle>
                    <CardDescription>Manage your subscription and billing details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-full ${isPro ? 'bg-indigo-100 dark:bg-indigo-900/30' : 'bg-slate-100 dark:bg-slate-800'}`}>
                                {isPro ? <Zap className="h-6 w-6 text-indigo-600 dark:text-indigo-400" /> : <AlertCircle className="h-6 w-6 text-slate-600 dark:text-slate-400" />}
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg text-foreground">
                                    {isPro ? 'Pro Plan' : 'Free Plan'}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    {isPro ? 'Unlimited invoices & premium features' : 'Limited features'}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            {!isPro && (
                                <Button onClick={() => setIsPricingOpen(true)}>
                                    Upgrade Plan
                                </Button>
                            )}
                            {isPro && (
                                <Button variant="outline" onClick={handleManageSubscription} disabled={loading}>
                                    {loading ? 'Loading...' : 'Manage Subscription'}
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="p-4 border rounded-lg bg-card">
                            <h4 className="text-sm font-medium text-muted-foreground mb-2">Available Credits</h4>
                            <div className="flex items-end gap-2">
                                <span className="text-3xl font-bold text-foreground">{profile?.credits || 0}</span>
                                <span className="text-sm text-muted-foreground mb-1">credits</span>
                            </div>
                            <Button variant="link" className="px-0 h-auto mt-2 text-indigo-600" onClick={() => setIsPricingOpen(true)}>
                                Buy more credits
                            </Button>
                        </div>
                        
                        <div className="p-4 border rounded-lg bg-card">
                            <h4 className="text-sm font-medium text-muted-foreground mb-2">Total Invoices Generated</h4>
                            <div className="flex items-end gap-2">
                                <span className="text-3xl font-bold text-foreground">{profile?.invoiceCount || 0}</span>
                                <span className="text-sm text-muted-foreground mb-1">invoices</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <PricingModal 
                isOpen={isPricingOpen} 
                onClose={() => setIsPricingOpen(false)} 
                onSuccess={() => window.location.reload()}
                currentCredits={profile?.credits || 0}
            />
        </div>
    );
};
