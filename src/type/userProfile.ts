// src/type/userProfile.ts

export interface IUserProfile {
    userId: string;
    // Personal Information
    fullName: string;
    email: string;
    phone: string;

    // Metadata
    createdAt: Date;
    updatedAt: Date;
    isProfileComplete: boolean;

    // Monetization
    subscriptionStatus: 'free' | 'pro';
    credits: number; // For pay-per-use
    invoiceCount: number; // Total invoices created
    subscriptionExpiry?: Date;
}

export interface IUserProfileFormData {
    fullName: string;
    email: string;
    phone: string;
}
