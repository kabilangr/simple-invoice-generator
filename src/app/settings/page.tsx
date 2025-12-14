'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { getUserProfile } from '@/lib/firestore';
import { IUserProfile } from '@/type/userProfile';
import { SubscriptionSettings } from '@/components/settings/SubscriptionSettings';
import { PaymentSettings } from '@/components/settings/PaymentSettings';
import { SecuritySettings } from '@/components/settings/SecuritySettings';
import UserProfileForm from '@/components/UserProfileForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';

export default function SettingsPage() {
    const { user } = useAuth();
    const [profile, setProfile] = useState<IUserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            if (user) {
                try {
                    const data = await getUserProfile(user.uid);
                    setProfile(data);
                } catch (error) {
                    console.error("Error fetching profile:", error);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchProfile();
    }, [user]);

    return (
        <ProtectedRoute>
            <DashboardLayout>
                <div className="space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
                        <p className="text-muted-foreground mt-1">Manage your account settings and preferences</p>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : (
                        <Tabs defaultValue="profile" className="w-full">
                            <TabsList className="mb-4 flex flex-wrap h-auto gap-2">
                                <TabsTrigger value="profile">Profile</TabsTrigger>
                                <TabsTrigger value="security">Security</TabsTrigger>
                                <TabsTrigger value="subscription">Subscription</TabsTrigger>
                                <TabsTrigger value="billing">Billing & Payment</TabsTrigger>
                            </TabsList>
                            
                            <TabsContent value="profile">
                                <div className="max-w-4xl">
                                    <UserProfileForm redirectOnSave={false} />
                                </div>
                            </TabsContent>

                            <TabsContent value="security">
                                <div className="max-w-4xl">
                                    <SecuritySettings />
                                </div>
                            </TabsContent>
                            
                            <TabsContent value="subscription">
                                <SubscriptionSettings profile={profile} />
                            </TabsContent>
                            
                            <TabsContent value="billing">
                                <PaymentSettings profile={profile} />
                            </TabsContent>
                        </Tabs>
                    )}
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
