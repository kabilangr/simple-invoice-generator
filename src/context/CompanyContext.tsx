// src/context/CompanyContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { getUserCompanies, getCompany } from '@/lib/firestore';
import type { ICompany } from '@/type/company';

interface CompanyContextType {
    companies: ICompany[];
    selectedCompany: ICompany | null;
    selectCompany: (companyId: string | null) => void;
    refreshCompanies: () => Promise<void>;
    loading: boolean;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export function CompanyProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const [companies, setCompanies] = useState<ICompany[]>([]);
    const [selectedCompany, setSelectedCompany] = useState<ICompany | null>(null);
    const [loading, setLoading] = useState(true);

    // Load companies when user changes
    useEffect(() => {
        if (user) {
            loadCompanies();
        } else {
            setCompanies([]);
            setSelectedCompany(null);
            setLoading(false);
        }
    }, [user]);

    // Load selected company from localStorage
    useEffect(() => {
        if (companies.length > 0) {
            const savedCompanyId = localStorage.getItem('selectedCompanyId');
            if (savedCompanyId) {
                const company = companies.find(c => c.id === savedCompanyId);
                if (company) {
                    setSelectedCompany(company);
                } else {
                    // If saved company not found, select first one
                    setSelectedCompany(companies[0]);
                    localStorage.setItem('selectedCompanyId', companies[0].id);
                }
            } else if (companies.length > 0) {
                // No saved selection, select first company
                setSelectedCompany(companies[0]);
                localStorage.setItem('selectedCompanyId', companies[0].id);
            }
        }
    }, [companies]);

    const loadCompanies = async () => {
        if (!user) return;

        try {
            setLoading(true);
            const userCompanies = await getUserCompanies(user.uid);
            setCompanies(userCompanies);
        } catch (error) {
            console.error('Error loading companies:', error);
        } finally {
            setLoading(false);
        }
    };

    const selectCompany = async (companyId: string | null) => {
        if (!companyId) {
            setSelectedCompany(null);
            localStorage.removeItem('selectedCompanyId');
            return;
        }

        try {
            const company = await getCompany(companyId);
            if (company) {
                setSelectedCompany(company);
                localStorage.setItem('selectedCompanyId', companyId);
            }
        } catch (error) {
            console.error('Error selecting company:', error);
        }
    };

    const refreshCompanies = async () => {
        await loadCompanies();
    };

    return (
        <CompanyContext.Provider
            value={{
                companies,
                selectedCompany,
                selectCompany,
                refreshCompanies,
                loading,
            }}
        >
            {children}
        </CompanyContext.Provider>
    );
}

export function useCompany() {
    const context = useContext(CompanyContext);
    if (context === undefined) {
        throw new Error('useCompany must be used within a CompanyProvider');
    }
    return context;
}
