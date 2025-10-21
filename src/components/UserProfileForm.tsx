// src/components/UserProfileForm.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { saveUserProfile, getUserProfile } from '@/lib/firestore';
import type { IUserProfileFormData } from '@/type/userProfile';

const UserProfileForm: React.FC = () => {
    const { user } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
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
        setLoading(true);

        try {
            await saveUserProfile(user.uid, {
                fullName: data.fullName,
                email: data.email,
                phone: data.phone,
                isProfileComplete: true,
            });

            // Redirect to companies page
            router.push('/companies');
        } catch (err: any) {
            setError(err.message || 'Failed to save profile');
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = "bg-gray-50 border border-gray-300 text-gray-900 h-11 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5";
    const labelStyle = "block mb-2 text-sm font-medium text-gray-900";
    const errorStyle = "text-red-500 text-xs mt-1";

    if (initialLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-100">
                <div className="text-center">
                    <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                    <p className="mt-4 text-gray-600">Loading profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="bg-white rounded-lg shadow-lg p-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Complete Your Profile</h1>
                        <p className="mt-2 text-gray-600">
                            Please provide your personal information. You'll add company details in the next step.
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {/* Personal Information */}
                        <div>
                            <h2 className="text-xl font-semibold border-b pb-2 mb-4">Personal Information</h2>
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="md:col-span-2">
                                    <label className={labelStyle}>
                                        Full Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        {...register("fullName", { required: "Full name is required" })}
                                        className={inputStyle}
                                        placeholder="John Doe"
                                    />
                                    {errors.fullName && <p className={errorStyle}>{errors.fullName.message}</p>}
                                </div>

                                <div>
                                    <label className={labelStyle}>
                                        Email <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        {...register("email", { required: "Email is required" })}
                                        className={inputStyle}
                                        placeholder="john@example.com"
                                    />
                                    {errors.email && <p className={errorStyle}>{errors.email.message}</p>}
                                </div>

                                <div>
                                    <label className={labelStyle}>
                                        Phone <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        {...register("phone", { required: "Phone is required" })}
                                        className={inputStyle}
                                        placeholder="+1234567890"
                                    />
                                    {errors.phone && <p className={errorStyle}>{errors.phone.message}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex gap-4 pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Saving...' : 'Save and Continue to Companies'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default UserProfileForm;
