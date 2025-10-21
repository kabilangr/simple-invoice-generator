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
}

export interface IUserProfileFormData {
    fullName: string;
    email: string;
    phone: string;
}
