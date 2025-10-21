// src/components/CompanyForm.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { useAuth } from '@/context/AuthContext';
import { useCompany } from '@/context/CompanyContext';
import { saveCompany } from '@/lib/firestore';
import type { ICompanyFormData, ICompany } from '@/type/company';

interface CompanyFormProps {
    company?: ICompany;
    onSuccess?: () => void;
    onCancel?: () => void;
}

const CompanyForm: React.FC<CompanyFormProps> = ({ company, onSuccess, onCancel }) => {
    const { user } = useAuth();
    const { refreshCompanies } = useCompany();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<ICompanyFormData>({
        defaultValues: company
            ? {
                companyName: company.companyName,
                email: company.email,
                phone: company.phone,
                address: company.address,
                city: company.city,
                state: company.state,
                country: company.country,
                pinCode: company.pinCode,
                website: company.website,
                taxId: company.taxId,
            }
            : undefined,
    });

    const onSubmit: SubmitHandler<ICompanyFormData> = async (data) => {
        if (!user) {
            alert('You must be logged in to save a company');
            return;
        }

        try {
            setIsSubmitting(true);

            await saveCompany(
                user.uid,
                {
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
                },
                company?.id
            );

            await refreshCompanies();
            reset();

            if (onSuccess) {
                onSuccess();
            }
        } catch (error) {
            console.error('Error saving company:', error);
            alert('Failed to save company. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputStyle =
        'bg-gray-50 border border-gray-300 text-gray-900 h-11 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5';
    const labelStyle = 'block mb-2 text-sm font-medium text-gray-900';
    const errorStyle = 'text-red-500 text-xs mt-1';

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
                <div>
                    <label className={labelStyle}>
                        Company Name *
                        <input
                            type="text"
                            {...register('companyName', { required: 'Company name is required' })}
                            className={inputStyle}
                            placeholder="Acme Inc."
                        />
                    </label>
                    {errors.companyName && <p className={errorStyle}>{errors.companyName.message}</p>}
                </div>

                <div>
                    <label className={labelStyle}>
                        Email *
                        <input
                            type="email"
                            {...register('email', {
                                required: 'Email is required',
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: 'Invalid email address',
                                },
                            })}
                            className={inputStyle}
                            placeholder="info@company.com"
                        />
                    </label>
                    {errors.email && <p className={errorStyle}>{errors.email.message}</p>}
                </div>

                <div>
                    <label className={labelStyle}>
                        Phone *
                        <input
                            type="tel"
                            {...register('phone', { required: 'Phone is required' })}
                            className={inputStyle}
                            placeholder="+1 234 567 8900"
                        />
                    </label>
                    {errors.phone && <p className={errorStyle}>{errors.phone.message}</p>}
                </div>

                <div>
                    <label className={labelStyle}>
                        Address *
                        <input
                            type="text"
                            {...register('address', { required: 'Address is required' })}
                            className={inputStyle}
                            placeholder="123 Main St"
                        />
                    </label>
                    {errors.address && <p className={errorStyle}>{errors.address.message}</p>}
                </div>

                <div>
                    <label className={labelStyle}>
                        City *
                        <input
                            type="text"
                            {...register('city', { required: 'City is required' })}
                            className={inputStyle}
                            placeholder="New York"
                        />
                    </label>
                    {errors.city && <p className={errorStyle}>{errors.city.message}</p>}
                </div>

                <div>
                    <label className={labelStyle}>
                        State/Province *
                        <input
                            type="text"
                            {...register('state', { required: 'State is required' })}
                            className={inputStyle}
                            placeholder="NY"
                        />
                    </label>
                    {errors.state && <p className={errorStyle}>{errors.state.message}</p>}
                </div>

                <div>
                    <label className={labelStyle}>
                        Country *
                        <input
                            type="text"
                            {...register('country', { required: 'Country is required' })}
                            className={inputStyle}
                            placeholder="United States"
                        />
                    </label>
                    {errors.country && <p className={errorStyle}>{errors.country.message}</p>}
                </div>

                <div>
                    <label className={labelStyle}>
                        Pin/Zip Code *
                        <input
                            type="text"
                            {...register('pinCode', { required: 'Pin code is required' })}
                            className={inputStyle}
                            placeholder="10001"
                        />
                    </label>
                    {errors.pinCode && <p className={errorStyle}>{errors.pinCode.message}</p>}
                </div>

                <div>
                    <label className={labelStyle}>
                        Website (Optional)
                        <input
                            type="url"
                            {...register('website')}
                            className={inputStyle}
                            placeholder="https://company.com"
                        />
                    </label>
                </div>

                <div>
                    <label className={labelStyle}>
                        Tax ID / GST Number (Optional)
                        <input
                            type="text"
                            {...register('taxId')}
                            className={inputStyle}
                            placeholder="12-3456789"
                        />
                    </label>
                </div>
            </div>

            <div className="flex gap-4">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? 'Saving...' : company ? 'Update Company' : 'Create Company'}
                </button>
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-5 py-2.5 text-sm font-medium text-gray-900 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200"
                    >
                        Cancel
                    </button>
                )}
            </div>
        </form>
    );
};

export default CompanyForm;
