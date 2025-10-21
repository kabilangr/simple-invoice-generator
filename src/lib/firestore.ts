// src/lib/firestore.ts
import { doc, getDoc, setDoc, serverTimestamp, collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';
import type { IUserProfile } from '@/type/userProfile';
import type { ICompany } from '@/type/company';

/**
 * Save or update user profile in Firestore
 */
export async function saveUserProfile(
    userId: string,
    profileData: Omit<IUserProfile, 'userId' | 'createdAt' | 'updatedAt'>
): Promise<void> {
    try {
        const userRef = doc(db, 'users', userId);
        const existingDoc = await getDoc(userRef);

        if (existingDoc.exists()) {
            // Update existing profile
            await setDoc(userRef, {
                ...profileData,
                updatedAt: serverTimestamp(),
            }, { merge: true });
        } else {
            // Create new profile
            await setDoc(userRef, {
                userId,
                ...profileData,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });
        }
    } catch (error) {
        console.error('Error saving user profile:', error);
        throw new Error('Failed to save profile');
    }
}

/**
 * Get user profile from Firestore
 */
export async function getUserProfile(userId: string): Promise<IUserProfile | null> {
    try {
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            const data = userSnap.data();
            return {
                userId: data.userId,
                fullName: data.fullName,
                email: data.email,
                phone: data.phone,
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate() || new Date(),
                isProfileComplete: data.isProfileComplete || false,
            } as IUserProfile;
        }

        return null;
    } catch (error) {
        console.error('Error getting user profile:', error);
        throw new Error('Failed to get profile');
    }
}

/**
 * Check if user has completed their profile
 */
export async function isProfileComplete(userId: string): Promise<boolean> {
    try {
        const profile = await getUserProfile(userId);
        return profile?.isProfileComplete || false;
    } catch (error) {
        console.error('Error checking profile completion:', error);
        return false;
    }
}

// ==================== COMPANY OPERATIONS ====================

/**
 * Save or update a company
 */
export async function saveCompany(
    userId: string,
    companyData: Omit<ICompany, 'id' | 'userId' | 'createdAt' | 'updatedAt'>,
    companyId?: string
): Promise<string> {
    try {
        const companiesRef = collection(db, 'companies');

        if (companyId) {
            // Update existing company
            const companyRef = doc(db, 'companies', companyId);
            await setDoc(companyRef, {
                ...companyData,
                updatedAt: serverTimestamp(),
            }, { merge: true });
            return companyId;
        } else {
            // Create new company
            const newCompanyRef = doc(companiesRef);
            await setDoc(newCompanyRef, {
                id: newCompanyRef.id,
                userId,
                ...companyData,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });
            return newCompanyRef.id;
        }
    } catch (error) {
        console.error('Error saving company:', error);
        throw new Error('Failed to save company');
    }
}

/**
 * Get all companies for a user
 */
export async function getUserCompanies(userId: string): Promise<ICompany[]> {
    try {
        const companiesRef = collection(db, 'companies');
        const q = query(companiesRef, where('userId', '==', userId));
        const querySnapshot = await getDocs(q);

        const companies: ICompany[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            companies.push({
                id: data.id,
                userId: data.userId,
                companyName: data.companyName,
                email: data.email,
                phone: data.phone,
                address: data.address,
                city: data.city,
                state: data.state,
                country: data.country,
                pinCode: data.pinCode,
                website: data.website,
                taxId: data.taxId,
                logo: data.logo,
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate() || new Date(),
            });
        });

        return companies;
    } catch (error) {
        console.error('Error getting user companies:', error);
        throw new Error('Failed to get companies');
    }
}

/**
 * Get a specific company by ID
 */
export async function getCompany(companyId: string): Promise<ICompany | null> {
    try {
        const companyRef = doc(db, 'companies', companyId);
        const companySnap = await getDoc(companyRef);

        if (companySnap.exists()) {
            const data = companySnap.data();
            return {
                id: data.id,
                userId: data.userId,
                companyName: data.companyName,
                email: data.email,
                phone: data.phone,
                address: data.address,
                city: data.city,
                state: data.state,
                country: data.country,
                pinCode: data.pinCode,
                website: data.website,
                taxId: data.taxId,
                logo: data.logo,
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate() || new Date(),
            } as ICompany;
        }

        return null;
    } catch (error) {
        console.error('Error getting company:', error);
        throw new Error('Failed to get company');
    }
}

/**
 * Delete a company
 */
export async function deleteCompany(companyId: string): Promise<void> {
    try {
        const companyRef = doc(db, 'companies', companyId);
        await deleteDoc(companyRef);
    } catch (error) {
        console.error('Error deleting company:', error);
        throw new Error('Failed to delete company');
    }
}

/**
 * Check if user has at least one company
 */
export async function hasCompanies(userId: string): Promise<boolean> {
    try {
        const companies = await getUserCompanies(userId);
        return companies.length > 0;
    } catch (error) {
        console.error('Error checking companies:', error);
        return false;
    }
}
