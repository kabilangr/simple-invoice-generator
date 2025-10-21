// src/components/SignIn.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { RecaptchaVerifier } from 'firebase/auth';
import { auth, isFirebaseConfigured } from '@/lib/firebase';

type AuthMode = 'signin' | 'signup';
type AuthMethod = 'email' | 'phone' | 'google' | 'apple';

const SignIn: React.FC = () => {
    const [mode, setMode] = useState<AuthMode>('signin');
    const [authMethod, setAuthMethod] = useState<AuthMethod>('email');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [confirmationResult, setConfirmationResult] = useState<any>(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showConfigWarning, setShowConfigWarning] = useState(false);

    const { signInWithEmail, signUpWithEmail, signInWithGoogle, signInWithApple, signInWithPhone } = useAuth();
    const router = useRouter();

    // Check Firebase configuration on mount
    useEffect(() => {
        if (!isFirebaseConfigured()) {
            setShowConfigWarning(true);
        }
    }, []);

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (mode === 'signin') {
                await signInWithEmail(email, password);
                router.push('/');
            } else {
                await signUpWithEmail(email, password);
                // Redirect new users to profile page
                router.push('/profile');
            }
        } catch (err: any) {
            setError(err.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setError('');
        setLoading(true);

        try {
            const result = await signInWithGoogle();
            // Social sign-in might be first time, redirect to profile
            router.push('/profile');
        } catch (err: any) {
            setError(err.message || 'Google sign-in failed');
        } finally {
            setLoading(false);
        }
    };

    const handleAppleSignIn = async () => {
        setError('');
        setLoading(true);

        try {
            const result = await signInWithApple();
            // Social sign-in might be first time, redirect to profile
            router.push('/profile');
        } catch (err: any) {
            setError(err.message || 'Apple sign-in failed');
        } finally {
            setLoading(false);
        }
    };

    const setupRecaptcha = () => {
        if (!(window as any).recaptchaVerifier) {
            (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                size: 'invisible',
                callback: () => {
                    // reCAPTCHA solved
                },
            });
        }
    };

    const handlePhoneSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            setupRecaptcha();
            const appVerifier = (window as any).recaptchaVerifier;
            const confirmation = await signInWithPhone(phoneNumber, appVerifier);
            setConfirmationResult(confirmation);
            setError('Verification code sent!');
        } catch (err: any) {
            setError(err.message || 'Phone sign-in failed');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await confirmationResult.confirm(verificationCode);
            // Phone sign-in might be first time, redirect to profile
            router.push('/profile');
        } catch (err: any) {
            setError(err.message || 'Invalid verification code');
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = "bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5";
    const buttonStyle = "w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center";
    const secondaryButtonStyle = "w-full text-gray-900 bg-white border border-gray-300 hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5 text-center flex items-center justify-center gap-2";

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
            <div className="w-full max-w-md space-y-6 bg-white p-8 rounded-lg shadow-lg">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-900">Invoice Generator</h1>
                    <p className="mt-2 text-sm text-gray-600">
                        {mode === 'signin' ? 'Sign in to your account' : 'Create a new account'}
                    </p>
                </div>

                {/* Firebase Configuration Warning */}
                {showConfigWarning && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-yellow-800">
                                    Firebase Not Configured
                                </h3>
                                <div className="mt-2 text-xs text-yellow-700">
                                    <p>Firebase environment variables are not set. Please configure them to enable authentication.</p>
                                    <p className="mt-1">See <code className="bg-yellow-100 px-1 rounded">.env.example</code> or <code className="bg-yellow-100 px-1 rounded">DEPLOYMENT.md</code> for setup instructions.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Auth Method Tabs */}
                <div className="flex gap-2 border-b border-gray-200">
                    <button
                        onClick={() => setAuthMethod('email')}
                        className={`px-4 py-2 text-sm font-medium ${authMethod === 'email'
                            ? 'border-b-2 border-blue-600 text-blue-600'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Email
                    </button>
                    <button
                        onClick={() => setAuthMethod('phone')}
                        className={`px-4 py-2 text-sm font-medium ${authMethod === 'phone'
                            ? 'border-b-2 border-blue-600 text-blue-600'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Phone
                    </button>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative text-sm">
                        {error}
                    </div>
                )}

                {/* Email/Password Auth */}
                {authMethod === 'email' && (
                    <form onSubmit={handleEmailAuth} className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900">
                                Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={inputStyle}
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900">
                                Password
                            </label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={inputStyle}
                                required
                                minLength={6}
                            />
                        </div>
                        <button type="submit" disabled={loading} className={buttonStyle}>
                            {loading ? 'Loading...' : mode === 'signin' ? 'Sign In' : 'Sign Up'}
                        </button>

                        <div className="text-center text-sm">
                            <button
                                type="button"
                                onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
                                className="text-blue-600 hover:underline"
                            >
                                {mode === 'signin' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
                            </button>
                        </div>
                    </form>
                )}

                {/* Phone Auth */}
                {authMethod === 'phone' && (
                    <div className="space-y-4">
                        {!confirmationResult ? (
                            <form onSubmit={handlePhoneSignIn} className="space-y-4">
                                <div>
                                    <label htmlFor="phone" className="block mb-2 text-sm font-medium text-gray-900">
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        placeholder="+1234567890"
                                        className={inputStyle}
                                        required
                                    />
                                    <p className="mt-1 text-xs text-gray-500">Include country code (e.g., +1 for US)</p>
                                </div>
                                <button type="submit" disabled={loading} className={buttonStyle}>
                                    {loading ? 'Sending...' : 'Send Verification Code'}
                                </button>
                                <div id="recaptcha-container"></div>
                            </form>
                        ) : (
                            <form onSubmit={handleVerifyCode} className="space-y-4">
                                <div>
                                    <label htmlFor="code" className="block mb-2 text-sm font-medium text-gray-900">
                                        Verification Code
                                    </label>
                                    <input
                                        type="text"
                                        id="code"
                                        value={verificationCode}
                                        onChange={(e) => setVerificationCode(e.target.value)}
                                        className={inputStyle}
                                        required
                                    />
                                </div>
                                <button type="submit" disabled={loading} className={buttonStyle}>
                                    {loading ? 'Verifying...' : 'Verify Code'}
                                </button>
                            </form>
                        )}
                    </div>
                )}

                {/* Social Auth */}
                <div className="space-y-3">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="bg-white px-2 text-gray-500">Or continue with</span>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleGoogleSignIn}
                        disabled={loading}
                        className={secondaryButtonStyle}
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path
                                fill="currentColor"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                                fill="currentColor"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="currentColor"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                                fill="currentColor"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                        </svg>
                        Sign in with Google
                    </button>

                    <button
                        type="button"
                        onClick={handleAppleSignIn}
                        disabled={loading}
                        className={secondaryButtonStyle}
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                        </svg>
                        Sign in with Apple
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SignIn;
