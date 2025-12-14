'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CreditCard, ExternalLink } from 'lucide-react';
import { IUserProfile } from '@/type/userProfile';

interface PaymentSettingsProps {
    profile: IUserProfile | null;
}

export const PaymentSettings: React.FC<PaymentSettingsProps> = ({ profile }) => {
    const [loading, setLoading] = useState(false);

    const handleManageBilling = async () => {
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

    return (
        <Card>
            <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>Manage your billing information and payment methods</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-slate-100 dark:bg-slate-800">
                            <CreditCard className="h-6 w-6 text-slate-600 dark:text-slate-400" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg text-foreground">Billing Portal</h3>
                            <p className="text-sm text-muted-foreground">
                                Update credit cards, view invoices, and manage billing details securely via Stripe.
                            </p>
                        </div>
                    </div>
                    <Button onClick={handleManageBilling} disabled={loading} className="gap-2">
                        {loading ? 'Loading...' : 'Manage Billing'}
                        <ExternalLink className="h-4 w-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};
