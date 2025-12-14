// src/components/UserProfileForm.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { saveUserProfile, getUserProfile } from '@/lib/firestore';
import type { IUserProfileFormData } from '@/type/userProfile';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { AlertTriangle, Save, User, CheckCircle } from 'lucide-react';

interface UserProfileFormProps {
    onSuccess?: () => void;
    redirectOnSave?: boolean;
}

const UserProfileForm: React.FC<UserProfileFormProps> = ({ onSuccess, redirectOnSave = true }) => {
    const { user } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [initialLoading, setInitialLoading] = useState(true);

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors }
    } = useForm<IUserProfileFormData>();

    // Load existing profile if available
    useEffect(() => {
        const loadProfile = async () => {
            if (user) {
                try {
                    const profile = await getUserProfile(user.uid);
                    if (profile) {
                        setValue('fullName', profile.fullName);
                        setValue('email', profile.email);
                        setValue('phone', profile.phone);
                    } else {
                        // Pre-fill email from auth
                        setValue('email', user.email || '');
                    }
                } catch (err) {
                    console.error('Error loading profile:', err);
                } finally {
                    setInitialLoading(false);
                }
            }
        };

        loadProfile();
    }, [user, setValue]);

    const onSubmit: SubmitHandler<IUserProfileFormData> = async (data) => {
        if (!user) return;

        setError('');
        setSuccess('');
        setLoading(true);

        try {
            await saveUserProfile(user.uid, {
                fullName: data.fullName,
                email: data.email,
                phone: data.phone,
                isProfileComplete: true,
            });

            if (onSuccess) {
                onSuccess();
            }

            if (redirectOnSave) {
                router.push('/companies');
            } else {
                setSuccess('Profile updated successfully');
                // Clear success message after 3 seconds
                setTimeout(() => setSuccess(''), 3000);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to save profile');
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <div className="text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                    <p className="mt-4 text-muted-foreground">Loading profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto py-8">
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <User className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <CardTitle>Your Profile</CardTitle>
                            <CardDescription>
                                Manage your personal information and contact details.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {error && (
                            <div className="bg-destructive/10 text-destructive p-4 rounded-lg flex items-center gap-3">
                                <AlertTriangle className="h-5 w-5" />
                                <p className="text-sm font-medium">{error}</p>
                            </div>
                        )}

                        {success && (
                            <div className="bg-green-50 text-green-600 p-4 rounded-lg flex items-center gap-3 border border-green-200">
                                <CheckCircle className="h-5 w-5" />
                                <p className="text-sm font-medium">{success}</p>
                            </div>
                        )}

                        <div className="grid gap-6 md:grid-cols-2">
                            <Input
                                label="Full Name"
                                {...register('fullName', { required: 'Full name is required' })}
                                error={errors.fullName?.message}
                                placeholder="John Doe"
                            />

                            <Input
                                label="Email Address"
                                type="email"
                                {...register('email', {
                                    required: 'Email is required',
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: 'Invalid email address',
                                    }
                                })}
                                error={errors.email?.message}
                                placeholder="john@example.com"
                                disabled // Email usually shouldn't be changed here if it's the auth email
                            />

                            <Input
                                label="Phone Number"
                                type="tel"
                                {...register('phone', { required: 'Phone number is required' })}
                                error={errors.phone?.message}
                                placeholder="+1 (555) 000-0000"
                            />
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                                {loading ? (
                                    <>Saving...</>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4 mr-2" />
                                        Save Profile
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default UserProfileForm;
