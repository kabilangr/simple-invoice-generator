// src/app/invoices/new/page.tsx
'use client';

import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import InvoiceForm from '@/components/InvoiceForm';
import { Button } from '@/components/ui/Button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewInvoicePage() {
    return (
        <ProtectedRoute>
            <DashboardLayout>
                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <Link href="/invoices">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-foreground">Create New Invoice</h1>
                            <p className="text-muted-foreground mt-1">Fill in the details below to generate an invoice</p>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-950 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                        <InvoiceForm />
                    </div>
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
