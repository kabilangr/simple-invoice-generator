// src/components/SignIn.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { RecaptchaVerifier } from 'firebase/auth';
import { auth, isFirebaseConfigured } from '@/lib/firebase';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/Card';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

type AuthMode = 'signin' | 'signup';
type AuthMethod = 'email' | 'phone';

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
                router.push('/');
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
            await signInWithGoogle();
            router.push('/');
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
            await signInWithApple();
            router.push('/');
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
            router.push('/');
        } catch (err: any) {
            setError(err.message || 'Invalid verification code');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Left Side - Brand/Visual */}
            <div className="hidden lg:flex lg:w-1/2 bg-indigo-600 text-white flex-col justify-between p-12 relative overflow-hidden">
                <div className="relative z-10">
                    <h1 className="text-4xl font-bold tracking-tight">INVOICER</h1>
                    <p className="mt-4 text-indigo-200 text-lg">
                        Professional invoicing for modern businesses.
                    </p>
                </div>
                <div className="relative z-10">
                    <blockquote className="text-xl font-medium italic">
                        "This tool has completely transformed how we handle billing. Simple, fast, and professional."
                    </blockquote>
                    <p className="mt-4 font-semibold">- Alex Morgan, Freelancer</p>
                </div>
                {/* Abstract Background Pattern */}
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
                        <path d="M0 100 C 20 0 50 0 100 100 Z" fill="currentColor" />
                    </svg>
                </div>
            </div>

            {/* Right Side - Auth Form */}
            <div className="flex-1 flex items-center justify-center p-6">
                <div className="w-full max-w-md space-y-6">
                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-bold text-gray-900">
                            {mode === 'signin' ? 'Welcome back' : 'Create an account'}
                        </h2>
                        <p className="mt-2 text-gray-600">
                            {mode === 'signin' ? 'Enter your details to access your account' : 'Get started with your free account'}
                        </p>
                    </div>

                    {showConfigWarning && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3">
                            <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                            <div className="text-sm text-yellow-700">
                                <p className="font-medium">Firebase Not Configured</p>
                                <p>Please configure environment variables to enable authentication.</p>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className={`p-4 rounded-lg text-sm flex gap-2 ${error === 'Verification code sent!' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                            {error === 'Verification code sent!' ? <CheckCircle2 className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
                            {error}
                        </div>
                    )}

                    <Card>
                        <CardHeader className="pb-4">
                            <div className="flex gap-4 border-b border-gray-100 pb-4">
                                <button
                                    onClick={() => setAuthMethod('email')}
                                    className={`text-sm font-medium pb-1 transition-colors ${authMethod === 'email' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    Email
                                </button>
                                <button
                                    onClick={() => setAuthMethod('phone')}
                                    className={`text-sm font-medium pb-1 transition-colors ${authMethod === 'phone' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    Phone
                                </button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {authMethod === 'email' && (
                                <form onSubmit={handleEmailAuth} className="space-y-4">
                                    <Input
                                        label="Email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        placeholder="name@example.com"
                                    />
                                    <Input
                                        label="Password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        minLength={6}
                                        placeholder="••••••••"
                                    />
                                    <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={loading}>
                                        {loading ? 'Loading...' : mode === 'signin' ? 'Sign In' : 'Sign Up'}
                                    </Button>
                                </form>
                            )}

                            {authMethod === 'phone' && (
                                <div className="space-y-4">
                                    {!confirmationResult ? (
                                        <form onSubmit={handlePhoneSignIn} className="space-y-4">
                                            <Input
                                                label="Phone Number"
                                                type="tel"
                                                value={phoneNumber}
                                                onChange={(e) => setPhoneNumber(e.target.value)}
                                                placeholder="+1234567890"
                                                required
                                            />
                                            <p className="text-xs text-gray-500">Include country code (e.g., +1)</p>
                                            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={loading}>
                                                {loading ? 'Sending...' : 'Send Code'}
                                            </Button>
                                            <div id="recaptcha-container"></div>
                                        </form>
                                    ) : (
                                        <form onSubmit={handleVerifyCode} className="space-y-4">
                                            <Input
                                                label="Verification Code"
                                                type="text"
                                                value={verificationCode}
                                                onChange={(e) => setVerificationCode(e.target.value)}
                                                required
                                                placeholder="123456"
                                            />
                                            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={loading}>
                                                {loading ? 'Verifying...' : 'Verify'}
                                            </Button>
                                        </form>
                                    )}
                                </div>
                            )}

                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-gray-200" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-white px-2 text-gray-500">Or continue with</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <Button variant="outline" onClick={handleGoogleSignIn} disabled={loading} className="w-full">
                                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
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
                                    Google
                                </Button>
                                <Button variant="outline" onClick={handleAppleSignIn} disabled={loading} className="w-full">
                                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                                    </svg>
                                    Apple
                                </Button>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-center">
                            <Button
                                variant="link"
                                onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
                                className="text-indigo-600"
                            >
                                {mode === 'signin' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default SignIn;
