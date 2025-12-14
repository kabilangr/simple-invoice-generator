'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getInvoice } from '@/lib/firestore';
import type { IInvoice } from '@/type/invoice';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import InvoiceForm from '@/components/InvoiceForm';
import { useParams, useRouter } from 'next/navigation';

export default function EditInvoicePage() {
    const { user } = useAuth();
    const params = useParams();
    const router = useRouter();
    const [invoice, setInvoice] = useState<IInvoice | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInvoice = async () => {
            if (user && params.id) {
                try {
                    const data = await getInvoice(params.id as string);
                    if (data && data.userId === user.uid) {
                        setInvoice(data);
                    } else {
                        router.push('/invoices');
                    }
                } catch (error) {
                    console.error("Error fetching invoice:", error);
                    router.push('/invoices');
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchInvoice();
    }, [user, params.id, router]);

    if (loading) {
        return (
            <ProtectedRoute>
                <DashboardLayout>
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>
                </DashboardLayout>
            </ProtectedRoute>
        );
    }

    if (!invoice) {
        return null;
    }

    return (
        <ProtectedRoute>
            <DashboardLayout>
                <div className="bg-white dark:bg-slate-950 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <InvoiceForm initialData={invoice} invoiceId={invoice.id} />
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
