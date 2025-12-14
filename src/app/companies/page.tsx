'use client';

import React, { useState } from 'react';
import { useCompany } from '@/context/CompanyContext';
import { deleteCompany, saveCompany } from '@/lib/firestore';
import type { ICompany, ICompanyFormData } from '@/type/company';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { Plus, Building2, Trash2, Edit2, X, Mail, Phone, MapPin, Globe, FileText } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/context/AuthContext';

export default function CompaniesPage() {
    const { user } = useAuth();
    const { companies, selectedCompany, selectCompany, refreshCompanies, loading } = useCompany();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCompany, setEditingCompany] = useState<ICompany | undefined>(undefined);

    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<ICompanyFormData>();

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

    const openModal = (company?: ICompany) => {
        if (company) {
            setEditingCompany(company);
            setValue('companyName', company.companyName);
            setValue('email', company.email);
            setValue('phone', company.phone);
            setValue('address', company.address);
            setValue('city', company.city);
            setValue('state', company.state);
            setValue('country', company.country);
            setValue('pinCode', company.pinCode);
            setValue('website', company.website);
            setValue('taxId', company.taxId);
        } else {
            setEditingCompany(undefined);
            reset();
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingCompany(undefined);
        reset();
    };

    const onSubmit = async (data: ICompanyFormData) => {
        if (!user) return;

        try {
            // Exclude logo from data as it's not handled here yet and causes type mismatch
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { logo, ...companyData } = data;
            await saveCompany(user.uid, companyData, editingCompany?.id);
            await refreshCompanies();
            closeModal();
        } catch (error) {
            console.error('Error saving company:', error);
            alert('Failed to save company. Please try again.');
        }
    };

    return (
        <ProtectedRoute>
            <DashboardLayout>
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-foreground">Manage Companies</h1>
                            <p className="text-muted-foreground mt-1">Add and manage your company profiles</p>
                        </div>
                        <Button onClick={() => openModal()} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Company
                        </Button>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : companies.length === 0 ? (
                        <Card className="text-center py-12">
                            <CardContent>
                                <div className="bg-primary/10 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Building2 className="h-8 w-8 text-primary" />
                                </div>
                                <h3 className="text-lg font-medium text-foreground">No companies yet</h3>
                                <p className="text-muted-foreground mt-2 mb-6">Add your first company to start creating invoices.</p>
                                <Button variant="outline" onClick={() => openModal()}>Add Your First Company</Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                            {companies.map((company) => (
                                <Card
                                    key={company.id}
                                    className={`hover:shadow-md transition-all ${selectedCompany?.id === company.id ? 'ring-2 ring-primary' : ''}`}
                                >
                                    <CardContent className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="bg-primary/10 p-2 rounded-lg">
                                                <Building2 className="h-5 w-5 text-primary" />
                                            </div>
                                            <div className="flex gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => openModal(company)} className="h-8 w-8 text-muted-foreground hover:text-primary">
                                                    <Edit2 className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => handleDelete(company.id)} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="mb-4">
                                            <h3 className="text-xl font-semibold text-foreground mb-1">
                                                {company.companyName}
                                            </h3>
                                            {selectedCompany?.id === company.id && (
                                                <span className="inline-block px-2 py-1 text-xs font-semibold text-primary-foreground bg-primary rounded-full">
                                                    Currently Selected
                                                </span>
                                            )}
                                        </div>

                                        <div className="space-y-2 text-sm text-muted-foreground">
                                            <div className="flex items-center">
                                                <Mail className="h-4 w-4 mr-2 shrink-0" />
                                                <span className="truncate">{company.email}</span>
                                            </div>
                                            <div className="flex items-center">
                                                <Phone className="h-4 w-4 mr-2 shrink-0" />
                                                <span>{company.phone}</span>
                                            </div>
                                            <div className="flex items-start">
                                                <MapPin className="h-4 w-4 mr-2 mt-0.5 shrink-0" />
                                                <span>{company.address}, {company.city}, {company.state}, {company.country}</span>
                                            </div>
                                            {company.website && (
                                                <div className="flex items-center">
                                                    <Globe className="h-4 w-4 mr-2 shrink-0" />
                                                    <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate">
                                                        {company.website}
                                                    </a>
                                                </div>
                                            )}
                                            {company.taxId && (
                                                <div className="flex items-center">
                                                    <FileText className="h-4 w-4 mr-2 shrink-0" />
                                                    <span>Tax ID: {company.taxId}</span>
                                                </div>
                                            )}
                                        </div>

                                        {selectedCompany?.id !== company.id && (
                                            <Button
                                                onClick={() => selectCompany(company.id)}
                                                className="mt-6 w-full bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20"
                                                variant="ghost"
                                            >
                                                Select This Company
                                            </Button>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>

                {/* Add/Edit Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                        <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b border-border flex justify-between items-center sticky top-0 bg-card z-10">
                                <h2 className="text-xl font-bold text-foreground">
                                    {editingCompany ? 'Edit Company' : 'Add New Company'}
                                </h2>
                                <Button variant="ghost" size="icon" onClick={closeModal}>
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>
                            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input
                                        label="Company Name *"
                                        {...register('companyName', { required: 'Company name is required' })}
                                        error={errors.companyName?.message}
                                        placeholder="Acme Inc."
                                    />
                                    <Input
                                        label="Email *"
                                        type="email"
                                        {...register('email', {
                                            required: 'Email is required',
                                            pattern: {
                                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                message: 'Invalid email address',
                                            },
                                        })}
                                        error={errors.email?.message}
                                        placeholder="info@company.com"
                                    />
                                    <Input
                                        label="Phone *"
                                        type="tel"
                                        {...register('phone', { required: 'Phone is required' })}
                                        error={errors.phone?.message}
                                        placeholder="+1 234 567 8900"
                                    />
                                    <Input
                                        label="Tax ID / GST (Optional)"
                                        {...register('taxId')}
                                        placeholder="12-3456789"
                                    />
                                </div>

                                <div className="border-t border-border pt-4 mt-2">
                                    <h3 className="text-sm font-medium text-foreground mb-3">Address Details</h3>
                                    <div className="space-y-4">
                                        <Input
                                            label="Street Address *"
                                            {...register('address', { required: 'Address is required' })}
                                            error={errors.address?.message}
                                            placeholder="123 Main St"
                                        />
                                        <div className="grid grid-cols-2 gap-4">
                                            <Input
                                                label="City *"
                                                {...register('city', { required: 'City is required' })}
                                                error={errors.city?.message}
                                                placeholder="New York"
                                            />
                                            <Input
                                                label="State/Province *"
                                                {...register('state', { required: 'State is required' })}
                                                error={errors.state?.message}
                                                placeholder="NY"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <Input
                                                label="Country *"
                                                {...register('country', { required: 'Country is required' })}
                                                error={errors.country?.message}
                                                placeholder="United States"
                                            />
                                            <Input
                                                label="Pin/Zip Code *"
                                                {...register('pinCode', { required: 'Pin code is required' })}
                                                error={errors.pinCode?.message}
                                                placeholder="10001"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-border pt-4 mt-2">
                                    <Input
                                        label="Website (Optional)"
                                        type="url"
                                        {...register('website')}
                                        placeholder="https://company.com"
                                    />
                                </div>

                                <div className="pt-4 flex justify-end gap-3 border-t border-border mt-4">
                                    <Button type="button" variant="outline" onClick={closeModal}>Cancel</Button>
                                    <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                                        {editingCompany ? 'Update Company' : 'Save Company'}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </DashboardLayout>
        </ProtectedRoute>
    );
}
