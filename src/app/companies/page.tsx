// src/app/companies/page.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useCompany } from '@/context/CompanyContext';
import { deleteCompany } from '@/lib/firestore';
import CompanyForm from '@/components/CompanyForm';
import type { ICompany } from '@/type/company';

export default function CompaniesPage() {
    const router = useRouter();
    const { companies, selectedCompany, selectCompany, refreshCompanies, loading } = useCompany();
    const [showForm, setShowForm] = useState(false);
    const [editingCompany, setEditingCompany] = useState<ICompany | undefined>(undefined);

    const handleDelete = async (companyId: string) => {
        if (!confirm('Are you sure you want to delete this company? This action cannot be undone.')) {
            return;
        }

        try {
            await deleteCompany(companyId);
            await refreshCompanies();

            // If deleted company was selected, clear selection
            if (selectedCompany?.id === companyId) {
                selectCompany(null);
            }
        } catch (error) {
            console.error('Error deleting company:', error);
            alert('Failed to delete company. Please try again.');
        }
    };

    const handleEdit = (company: ICompany) => {
        setEditingCompany(company);
        setShowForm(true);
    };

    const handleAddNew = () => {
        setEditingCompany(undefined);
        setShowForm(true);
    };

    const handleFormSuccess = () => {
        setShowForm(false);
        setEditingCompany(undefined);
    };

    const handleFormCancel = () => {
        setShowForm(false);
        setEditingCompany(undefined);
    };

    if (loading) {
        return (
            <ProtectedRoute>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-xl">Loading companies...</div>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <div className="container mx-auto p-8 max-w-6xl">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Manage Companies</h1>
                    <button
                        onClick={() => router.push('/')}
                        className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg"
                    >
                        Back to Invoices
                    </button>
                </div>

                {showForm ? (
                    <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
                        <h2 className="text-xl font-semibold mb-4">
                            {editingCompany ? 'Edit Company' : 'Add New Company'}
                        </h2>
                        <CompanyForm
                            company={editingCompany}
                            onSuccess={handleFormSuccess}
                            onCancel={handleFormCancel}
                        />
                    </div>
                ) : (
                    <div className="mb-6">
                        <button
                            onClick={handleAddNew}
                            className="w-full sm:w-auto px-6 py-3 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm"
                        >
                            + Add New Company
                        </button>
                    </div>
                )}

                {companies.length === 0 ? (
                    <div className="bg-white p-8 rounded-lg shadow text-center">
                        <p className="text-gray-600 mb-4">You haven't added any companies yet.</p>
                        <p className="text-sm text-gray-500">
                            Add your first company to start creating invoices.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2">
                        {companies.map((company) => (
                            <div
                                key={company.id}
                                className={`bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow ${selectedCompany?.id === company.id
                                        ? 'ring-2 ring-blue-500'
                                        : ''
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-800">
                                            {company.companyName}
                                        </h3>
                                        {selectedCompany?.id === company.id && (
                                            <span className="inline-block px-2 py-1 text-xs font-semibold text-blue-800 bg-blue-100 rounded-full mt-1">
                                                Currently Selected
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(company)}
                                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(company.id)}
                                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>

                                <div className="text-sm text-gray-600 space-y-1">
                                    <p>
                                        <span className="font-medium">Email:</span> {company.email}
                                    </p>
                                    <p>
                                        <span className="font-medium">Phone:</span> {company.phone}
                                    </p>
                                    <p>
                                        <span className="font-medium">Address:</span>{' '}
                                        {company.address}, {company.city}, {company.state}
                                    </p>
                                    <p>
                                        <span className="font-medium">Country:</span> {company.country}{' '}
                                        - {company.pinCode}
                                    </p>
                                    {company.taxId && (
                                        <p>
                                            <span className="font-medium">Tax ID:</span> {company.taxId}
                                        </p>
                                    )}
                                    {company.website && (
                                        <p>
                                            <span className="font-medium">Website:</span>{' '}
                                            <a
                                                href={company.website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:underline"
                                            >
                                                {company.website}
                                            </a>
                                        </p>
                                    )}
                                </div>

                                {selectedCompany?.id !== company.id && (
                                    <button
                                        onClick={() => selectCompany(company.id)}
                                        className="mt-4 w-full px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200"
                                    >
                                        Select This Company
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </ProtectedRoute>
    );
}
