// src/app/profile/page.tsx
'use client';

import UserProfileForm from '@/components/UserProfileForm';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function ProfilePage() {
    return (
        <ProtectedRoute>
            <UserProfileForm />
        </ProtectedRoute>
    );
}
