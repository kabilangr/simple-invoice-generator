// src/components/InvoiceForm.tsx
'use client';
import React, { useRef, forwardRef, type ForwardedRef, useMemo, useEffect, useState } from 'react';
import { useForm, useFieldArray, type SubmitHandler, useWatch } from 'react-hook-form';
import { useReactToPrint } from 'react-to-print';
import InvoicePDF from './InvoicePDF';
import { useAuth } from '@/context/AuthContext';
import { useCompany } from '@/context/CompanyContext';
import { getUserProfile } from '@/lib/firestore';

import type { IInvoiceFormData, IInvoiceItem } from '../type/invoice';

const defaultValues: IInvoiceFormData = {
    // Your Info
    yourName: '',
    yourState: '',
    yourCountry: '',
    yourEmail: '',
    yourAddress: '',
    yourCity: '',
    yourPinCode: null,
    yourPhone: '',
    // Client Info
    billTo: '',
    billToEmail: '',
    billToAddress: '',
    billToCity: '',
    billToState: '',
    billToCountry: '',
    billToPinCode: null,
    billToPhone: '',
    // Invoice Details
    invoiceSubject: '',
    invoiceNumber: 'INV-000001',
    invoiceDate: '',
    terms: 'Custom',
    dueDate: '',
    // Items
    items: [],
    discount: 0, // 0%
    taxType: 'None', // Default to 'None'
    taxTypeLabel: 'No Tax', // Default label
    taxRate: 0, // 0%
    adjustmentDescription: 'Adjustment', // Default label
    adjustmentAmount: 0,
    // Totals (Initial values)
    subTotal: 0,
    totalAmount: 0,
    balanceDue: 0,
    // Footer/Notes
    notes: 'Thanks for your business.',
    authorizedSignature: '',
    logo: undefined,
};


// --- Main Form Component ---
const InvoiceForm: React.FC = () => {

    const [showPreview, setShowPreview] = React.useState(false);
    const [dataSource, setDataSource] = useState<'profile' | 'company' | 'custom'>('company');
    const [dataLoaded, setDataLoaded] = useState(false);
    const { user } = useAuth();
    const { selectedCompany } = useCompany();

    const {
        register,
        handleSubmit,
        control,
        watch,
        setValue,
        formState: { errors }
    } = useForm<IInvoiceFormData>({
        defaultValues,
        mode: "onChange",
    });

    // Load data based on selected source
    useEffect(() => {
        const loadData = async () => {
            if (!user) return;

            try {
                if (dataSource === 'profile') {
                    // Load user profile data
                    const profile = await getUserProfile(user.uid);
                    if (profile) {
                        setValue('yourName', profile.fullName);
                        setValue('yourEmail', profile.email);
                        setValue('yourPhone', profile.phone);
                        setValue('yourAddress', '');
                        setValue('yourCity', '');
                        setValue('yourState', '');
                        setValue('yourCountry', '');
                        setValue('yourPinCode', null);
                        setDataLoaded(true);
                    }
                } else if (dataSource === 'company' && selectedCompany) {
                    // Load company data
                    setValue('yourName', selectedCompany.companyName);
                    setValue('yourEmail', selectedCompany.email);
                    setValue('yourPhone', selectedCompany.phone);
                    setValue('yourAddress', selectedCompany.address);
                    setValue('yourCity', selectedCompany.city);
                    setValue('yourState', selectedCompany.state);
                    setValue('yourCountry', selectedCompany.country);
                    setValue('yourPinCode', selectedCompany.pinCode ? parseInt(selectedCompany.pinCode) : null);
                    setDataLoaded(true);
                } else if (dataSource === 'custom') {
                    // Clear fields for custom entry
                    setValue('yourName', '');
                    setValue('yourEmail', '');
                    setValue('yourPhone', '');
                    setValue('yourAddress', '');
                    setValue('yourCity', '');
                    setValue('yourState', '');
                    setValue('yourCountry', '');
                    setValue('yourPinCode', null);
                    setDataLoaded(true);
                }
            } catch (error) {
                console.error('Error loading data:', error);
            }
        };

        loadData();
    }, [user, dataSource, selectedCompany, setValue]);

    // Handle data source change
    const handleDataSourceChange = (newSource: 'profile' | 'company' | 'custom') => {
        setDataSource(newSource);
        setDataLoaded(false);
    };


    const { fields, append, remove } = useFieldArray({
        control,
        name: "items",
    });

    const formData = watch();

    const watchedValues = useWatch({
        control,
        name: ["items", "discount", "taxType", "taxRate", "adjustmentAmount"]
    });

    const [watchedItems, watchedDiscount, watchedTaxType, watchedTaxRate, watchedAdjustmentAmount] = watchedValues;


    const { subTotal, totalAmount, balanceDue } = useMemo(() => {
        const calculatedSubTotal = formData.items.reduce((sum, item) =>
            sum + (item.qty * item.rate || 0), 0);

        const discountAmount = calculatedSubTotal * (formData.discount / 100);
        const amountAfterDiscount = calculatedSubTotal - discountAmount;

        let taxAmount = 0;
        if (formData.taxType !== 'None' && formData.taxRate > 0) {
            taxAmount = amountAfterDiscount * (formData.taxRate / 100);
        }

        const adjustment = formData.adjustmentAmount || 0;

        const calculatedTotalAmount = amountAfterDiscount - taxAmount + adjustment;

        return {
            subTotal: calculatedSubTotal,
            totalAmount: calculatedTotalAmount,
            balanceDue: calculatedTotalAmount,
        };
    }, [watchedItems, watchedDiscount, watchedTaxType, watchedTaxRate, watchedAdjustmentAmount]);


    formData.subTotal = subTotal;
    formData.totalAmount = totalAmount;
    formData.balanceDue = balanceDue;

    const componentRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: `Invoice ${formData.invoiceNumber}`,
    });

    const onSubmit: SubmitHandler<IInvoiceFormData> = (data) => {
        const finalData = {
            ...data,
            subTotal,
            totalAmount,
            balanceDue,
        }
        console.log("Form Data Submitted:", finalData);
        handlePrint();
    };

    const inputStyle: string = "bg-gray-50 border border-gray-300 text-gray-900 h-11 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5";
    const labelStyle: string = "block mb-2 text-sm font-medium text-gray-900";
    const errorStyle: string = "text-red-500 text-xs mt-1";

    const PrintableInvoice = forwardRef((props: { data: IInvoiceFormData }, ref: ForwardedRef<HTMLDivElement>) => (
        <div ref={ref}>
            <InvoicePDF {...props} />
        </div>
    ));

    const getTaxAmount = (subTotal: number, discount: number, taxRate: number) => {
        if (taxRate === 0) return 0;
        const amountAfterDiscount = subTotal * (1 - discount / 100);
        return amountAfterDiscount * (taxRate / 100);
    }

    const taxAmount = getTaxAmount(subTotal, formData.discount, formData.taxRate);


    return (
        <div className="flex flex-col bg-gray-100 min-h-screen">

            {/* --- Form Section --- */}
            <div className="container mx-auto p-8 overflow-y-auto">
                <h1 className="text-3xl font-bold mb-6 text-gray-800">Invoice Creator</h1>

                <form onSubmit={handleSubmit(onSubmit)} className=" mx-16 space-y-6 bg-white p-6 rounded-lg shadow-lg">

                    {/* ... (Your Information, Client & Invoice Details, Service / Item Details sections remain unchanged) ... */}

                    {/* Your Information */}
                    <h2 className="text-xl font-semibold border-b pb-2 mb-4">Your Information</h2>

                    {/* Data Source Toggle */}
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm font-medium text-gray-700 mb-3">Invoice From:</p>
                        <div className="flex gap-6 flex-wrap">
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="radio"
                                    checked={dataSource === 'profile'}
                                    onChange={() => handleDataSourceChange('profile')}
                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                                />
                                <span className="ml-2 text-sm font-medium text-gray-900">
                                    My Profile (Personal)
                                </span>
                            </label>
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="radio"
                                    checked={dataSource === 'company'}
                                    onChange={() => handleDataSourceChange('company')}
                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                                />
                                <span className="ml-2 text-sm font-medium text-gray-900">
                                    Company ({selectedCompany?.companyName || 'Select Company'})
                                </span>
                            </label>
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="radio"
                                    checked={dataSource === 'custom'}
                                    onChange={() => handleDataSourceChange('custom')}
                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                                />
                                <span className="ml-2 text-sm font-medium text-gray-900">
                                    Custom Data
                                </span>
                            </label>
                        </div>
                        {dataSource === 'profile' && (
                            <p className="mt-2 text-xs text-gray-600">
                                � Your personal profile information will be used.
                            </p>
                        )}
                        {dataSource === 'company' && selectedCompany && (
                            <p className="mt-2 text-xs text-gray-600">
                                🏢 {selectedCompany.companyName} details will be used.
                            </p>
                        )}
                        {dataSource === 'company' && !selectedCompany && (
                            <p className="mt-2 text-xs text-red-600">
                                ⚠️ Please select a company from the header dropdown.
                            </p>
                        )}
                        {dataSource === 'custom' && (
                            <p className="mt-2 text-xs text-gray-600">
                                ✏️ Fill in custom information manually.
                            </p>
                        )}
                    </div>

                    <div className="grid gap-6 mb-6 md:grid-cols-2">
                        <div>
                            {/* Label wraps input */}
                            <label className={labelStyle}>Your Name
                                <input
                                    type="text"
                                    {...register("yourName", { required: "Name is required" })}
                                    className={inputStyle}
                                    disabled={dataSource !== 'custom'}
                                />
                            </label>
                            {errors.yourName && <p className={errorStyle}>{errors.yourName.message}</p>}
                        </div>
                        <div>
                            <label className={labelStyle}>Your Email (Optional)
                                <input
                                    type="email"
                                    {...register("yourEmail")}
                                    className={inputStyle}
                                    disabled={dataSource !== 'custom'}
                                />
                            </label>
                            {errors.yourEmail && <p className={errorStyle}>{errors.yourEmail.message}</p>}
                        </div>
                        <div>
                            <label className={labelStyle}>Address (Optional)
                                <input
                                    type="text"
                                    {...register("yourAddress")}
                                    className={inputStyle}
                                    disabled={dataSource !== 'custom'}
                                />
                            </label>
                        </div>
                        <div>
                            <label className={labelStyle}>City (Optional)
                                <input
                                    type="text"
                                    {...register("yourCity")}
                                    className={inputStyle}
                                    disabled={dataSource !== 'custom'}
                                />
                            </label>
                        </div>
                        <div>
                            <label className={labelStyle}>State/Province (Optional)
                                <input
                                    type="text"
                                    {...register("yourState")}
                                    className={inputStyle}
                                    disabled={dataSource !== 'custom'}
                                />
                            </label>
                        </div>
                        <div>
                            <label className={labelStyle}>Country (Optional)
                                <input
                                    type="text"
                                    {...register("yourCountry")}
                                    className={inputStyle}
                                    disabled={dataSource !== 'custom'}
                                />
                            </label>
                        </div>
                        <div>
                            <label className={labelStyle}>Pin Code (Optional)
                                <input
                                    type="number"
                                    {...register("yourPinCode")}
                                    className={`${inputStyle} input-number-no-step`}
                                    disabled={dataSource !== 'custom'}
                                />
                            </label>
                        </div>
                        <div>
                            <label className={labelStyle}>Phone Number/Telephone (Optional)
                                <input
                                    type="text"
                                    {...register("yourPhone")}
                                    className={`${inputStyle}`}
                                    disabled={dataSource !== 'custom'}
                                />
                            </label>
                        </div>
                        <div>
                            <label className={labelStyle}>Logo (Optional)
                                <input
                                    type="file"
                                    {...register("logo")}
                                    className={inputStyle}
                                    disabled={dataSource !== 'custom'}
                                />
                            </label>
                        </div>
                    </div>

                    {/* Client Information & Invoice Details */}
                    <h2 className="text-xl font-semibold border-b pb-2 mb-4 mt-6">Client Details</h2>
                    <div className="grid gap-6 mb-6 md:grid-cols-2">
                        <div>
                            <label className={labelStyle}>Bill To
                                <input type="text" {...register("billTo", { required: "Client Name is required" })} className={inputStyle} />
                            </label>
                            {errors.billTo && <p className={errorStyle}>{errors.billTo.message}</p>}
                        </div>
                        <div>
                            <label className={labelStyle}>Bill Email (Optional)
                                <input type="email" {...register("billToEmail")} className={inputStyle} />
                            </label>
                            {errors.yourEmail && <p className={errorStyle}>{errors.yourEmail.message}</p>}
                        </div>
                        <div>
                            <label className={labelStyle}>Address (Optional)
                                <input type="text" {...register("billToAddress")} className={inputStyle} />
                            </label>
                        </div>
                        <div>
                            <label className={labelStyle}>City (Optional)
                                <input type="text" {...register("billToCity")} className={inputStyle} />
                            </label>
                        </div>
                        <div>
                            <label className={labelStyle}>State/Province (Optional)
                                <input type="text" {...register("billToState")} className={inputStyle} />
                            </label>
                        </div>
                        <div>
                            <label className={labelStyle}>Country (Optional)
                                <input type="text" {...register("billToCountry")} className={inputStyle} />
                            </label>
                        </div>
                        <div>
                            <label className={labelStyle}>Pin Code (Optional)
                                <input type="number" {...register("billToPinCode")} className={`${inputStyle} input-number-no-step`} />
                            </label>
                        </div>
                        <div>
                            <label className={labelStyle}>Phone Number/Telephone (Optional)
                                <input type="text" {...register("billToPhone")} className={`${inputStyle}`} />
                            </label>
                        </div>
                    </div>
                    <h2 className="text-xl font-semibold border-b pb-2 mb-4 mt-6">Invoice Details</h2>
                    <div className="grid gap-6 mb-6 md:grid-cols-2">

                        <div>
                            <label className={labelStyle}>Invoice Number
                                <input type="text" {...register("invoiceNumber", { required: "Invoice # is required" })} className={inputStyle} />
                            </label>
                            {errors.invoiceNumber && <p className={errorStyle}>{errors.invoiceNumber.message}</p>}
                        </div>
                        <div>
                            <label className={labelStyle}>Invoice Date
                                <input type="date" {...register("invoiceDate")} className={inputStyle} />
                            </label>
                        </div>
                        <div>
                            <label className={labelStyle}>Due Date
                                <input type="date" {...register("dueDate")} className={inputStyle} />
                            </label>
                        </div>
                        <div>
                            <label className={labelStyle}>Payment Terms
                                <input type="text" {...register("terms")} className={inputStyle} />
                            </label>
                        </div>
                    </div>

                    <div className='mb-6'>
                        <label className={labelStyle}>Subject
                            <input type="text" {...register("invoiceSubject")} className={inputStyle} />
                        </label>
                    </div>

                    {/* Item List */}
                    <h2 className="text-xl font-semibold border-b pb-2 mb-4 mt-6">Service / Item Details</h2>
                    <div className="space-y-4 w-full">
                        {fields.map((item, index) => (
                            <div key={item.id} className="p-4 border rounded-lg bg-gray-50 relative">
                                <button
                                    type="button"
                                    onClick={() => remove(index)}
                                    className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                                    aria-label="Remove item"
                                >
                                    &times;
                                </button>
                                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                    <div className="col-span-1 md:col-span-3">
                                        <label className={labelStyle}>Item & Description
                                            <textarea
                                                {...register(`items.${index}.description`, { required: "Description is required" })}
                                                className={`${inputStyle}`}
                                            />
                                        </label>
                                        {errors.items?.[index]?.description && <p className={errorStyle}>{errors.items[index]!.description!.message}</p>}
                                    </div>
                                    <div className="col-span-1">
                                        <label className={labelStyle}>Qty
                                            <input
                                                type="number"
                                                step="0.01"
                                                {...register(`items.${index}.qty`, { valueAsNumber: true, min: 0.01 })}
                                                className={inputStyle}
                                            />
                                        </label>
                                    </div>
                                    <div className="col-span-1">
                                        <label className={labelStyle}>Rate
                                            <input
                                                type="number"
                                                step="0.01"
                                                {...register(`items.${index}.rate`, { valueAsNumber: true, min: 0.01 })}
                                                className={inputStyle}
                                            />
                                        </label>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={() => append({ description: '', qty: 1.00, rate: 0.00 } as IInvoiceItem)}
                            className="mt-4 px-4 py-2 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto text-center"
                        >
                            + Add Item
                        </button>
                    </div>

                    {/* --- NEW: Totals Section and Inputs (matches image_b78740.png) --- */}
                    <div className="flex justify-end">
                        <div className="w-full lg:w-1/2 p-4 border rounded-lg bg-gray-50 space-y-4">

                            {/* Sub Total */}
                            <div className="flex justify-between items-center text-lg font-bold">
                                <span>Sub Total</span>
                                <span>{subTotal.toFixed(2)}</span>
                            </div>

                            {/* Discount Field */}
                            <div className="flex justify-between items-center">
                                <label className="text-sm">Discount</label>
                                <div className="flex w-2/3 space-x-2 items-center">
                                    <input
                                        type="number"
                                        step="0.01"
                                        {...register("discount", { valueAsNumber: true, min: 0, max: 100 })}
                                        className="w-16 p-1 border rounded text-right text-sm"
                                    />
                                    <span className="text-sm">%</span>
                                </div>
                                <span className="text-sm">
                                    - {(subTotal * (formData.discount / 100)).toFixed(2)}
                                </span>
                            </div>

                            {/* TDS / TCS Field */}
                            <div className="flex justify-between items-center">
                                {/* Tax Type Dropdown */}
                                <div className="w-1/5">
                                    <select
                                        {...register("taxType", {
                                            onChange: (e) => {
                                                if (e.target.value === 'None') {
                                                    setValue('taxRate', 0);
                                                    setValue('taxTypeLabel', 'No Tax');
                                                } else {
                                                    setValue('taxTypeLabel', "");
                                                }
                                            }
                                        })}
                                        className="w-full p-1 border rounded text-sm bg-white"
                                    >
                                        <option value="None">None</option>
                                        <option value="TDS">TDS</option>
                                        <option value="TCS">TCS</option>
                                    </select>
                                </div>

                                {/* Select Tax Rate Dropdown (Simulated with Input) */}
                                <div>
                                    <input
                                        type="text"
                                        className="w-full p-1 border rounded text-right text-sm"
                                        {...register("taxTypeLabel")}
                                        disabled={formData.taxType === 'None'}
                                    />
                                </div>
                                <div className="w-1/3">
                                    <input
                                        type="number"
                                        step="0.01"
                                        placeholder="Rate (%)"
                                        {...register("taxRate", { valueAsNumber: true, min: 0, max: 100 })}
                                        className="w-1/2 p-1 border rounded text-right text-sm"
                                        disabled={formData.taxType === 'None'}
                                    />
                                </div>

                                <span className="text-sm font-medium text-red-600">
                                    - {taxAmount.toFixed(2)}
                                </span>
                            </div>

                            {/* Adjustment Field */}
                            <div className="flex justify-between items-center">
                                <label className="text-sm">
                                    <input
                                        type="text"
                                        {...register("adjustmentDescription")}
                                        className="p-1 border-dotted border-gray-400 border-b-2 bg-transparent text-sm"
                                        style={{ width: '90px' }} // Fixed width to match visual style
                                    />
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    {...register("adjustmentAmount", { valueAsNumber: true })}
                                    className="w-1/3 p-1 border rounded text-right text-sm"
                                />
                                <span className="text-sm font-medium">
                                    {formData.adjustmentAmount >= 0 ? '+' : ''} {formData.adjustmentAmount.toFixed(2)}
                                </span>
                            </div>

                            {/* Total Amount */}
                            <div className="pt-4 border-t border-gray-300 flex justify-between items-center text-xl font-extrabold text-blue-800">
                                <span>Total (₹)</span>
                                <span>{totalAmount.toFixed(2)}</span>
                            </div>

                        </div>
                    </div>


                    {/* Notes and Signature */}
                    <h2 className="text-xl font-semibold border-b pb-2 mb-4 mt-6">Final Details</h2>
                    <div className='mb-6'>
                        <label className={labelStyle}>Notes
                            <textarea rows={3} {...register("notes")} className={inputStyle} />
                        </label>
                    </div>
                    <div className='mb-6'>
                        <label className={labelStyle}>Authorized Signature Name
                            <input type="text" {...register("authorizedSignature")} className={inputStyle} />
                        </label>
                    </div>

                    {/* Submit/Generate PDF Button */}
                    <button
                        type="submit"
                        className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center"
                    >
                        Generate & Print PDF
                    </button>
                </form>
            </div>

            {/* --- PDF Preview Section --- */}
            {showPreview &&
                <div
                    className='fixed inset-0 bg-gray-100/70 flex justify-center items-center z-0'
                    onClick={() => setShowPreview(false)}
                >
                    <div className='absolute top-4 right-4 text-gray-600 hover:text-gray-900 font-semibold text-3xl cursor-pointer z-10'>&times;</div>
                </div>
            }
            <div className={showPreview ? " fixed h-[calc(100vh-10rem)] w-auto top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" : " fixed bottom-0 right-0 h-64 w-48 p-4 overflow-hidden bg-gray-200"}>
                {/* <h2 className="text-2xl font-bold mb-4 text-gray-800">PDF Preview</h2> */}
                {!showPreview &&
                    <div
                        className=' absolute bg-gray-100/70 hover:bg-gray-400/80 hover:text-white font-semibold text-5xl cursor-pointer h-56 w-40 z-10 flex justify-center items-center'
                        onClick={() => setShowPreview(true)}>
                        <span className='text-xs'>Show PDF Preview</span>
                    </div>}
                <div className={showPreview ? "h-[calc(100vh-10rem)] overflow-y-scroll" : "bg-white shadow-xl scale-[0.2] origin-top-left "}>
                    {/* Pass the fully calculated formData to the PrintableInvoice */}
                    <PrintableInvoice ref={componentRef} data={formData as IInvoiceFormData} />
                </div>
            </div>
        </div>
    );
};

export default InvoiceForm;