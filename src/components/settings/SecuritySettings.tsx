'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Lock, Save, AlertTriangle, CheckCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const passwordSchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type PasswordFormData = z.infer<typeof passwordSchema>;

export const SecuritySettings = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm<PasswordFormData>({
        resolver: zodResolver(passwordSchema)
    });

    const onSubmit = async (data: PasswordFormData) => {
        if (!user || !user.email) return;

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            // Re-authenticate user first
            const credential = EmailAuthProvider.credential(user.email, data.currentPassword);
            await reauthenticateWithCredential(user, credential);

            // Update password
            await updatePassword(user, data.newPassword);
            
            setSuccess('Password updated successfully');
            reset();
        } catch (err: any) {
            console.error('Error updating password:', err);
            if (err.code === 'auth/wrong-password') {
                setError('Incorrect current password');
            } else if (err.code === 'auth/requires-recent-login') {
                setError('Please log out and log back in to change your password');
            } else {
                setError('Failed to update password. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <Lock className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <CardTitle>Security Settings</CardTitle>
                        <CardDescription>
                            Manage your password and account security.
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
                    {error && (
                        <div className="bg-destructive/10 text-destructive p-3 rounded-md flex items-center gap-2 text-sm">
                            <AlertTriangle className="h-4 w-4" />
                            {error}
                        </div>
                    )}
                    
                    {success && (
                        <div className="bg-green-50 text-green-600 p-3 rounded-md flex items-center gap-2 text-sm border border-green-200">
                            <CheckCircle className="h-4 w-4" />
                            {success}
                        </div>
                    )}

                    <Input
                        label="Current Password"
                        type="password"
                        {...register('currentPassword')}
                        error={errors.currentPassword?.message}
                        placeholder="••••••••"
                    />

                    <Input
                        label="New Password"
                        type="password"
                        {...register('newPassword')}
                        error={errors.newPassword?.message}
                        placeholder="••••••••"
                    />

                    <Input
                        label="Confirm New Password"
                        type="password"
                        {...register('confirmPassword')}
                        error={errors.confirmPassword?.message}
                        placeholder="••••••••"
                    />

                    <div className="pt-2">
                        <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                            {loading ? (
                                <>Saving...</>
                            ) : (
                                <>
                                    <Save className="h-4 w-4 mr-2" />
                                    Update Password
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
};
