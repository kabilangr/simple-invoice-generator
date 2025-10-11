// src/components/InvoiceForm.tsx
'use client';
import React, { useRef, forwardRef, type ForwardedRef, useMemo } from 'react';
import { useForm, useFieldArray, type SubmitHandler } from 'react-hook-form';
import { useReactToPrint } from 'react-to-print';
import InvoicePDF from './InvoicePDF';

import type { IInvoiceFormData, IInvoiceItem } from '../type/invoice';

const defaultValues: IInvoiceFormData = {
    // Your Info
    yourName: '',
    yourState: '',
    yourCountry: '',
    yourEmail: '',
    // Client Info
    billTo: '',
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


    const { fields, append, remove } = useFieldArray({
        control,
        name: "items",
    });

    const formData = watch();

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
    }, [formData.items, formData.discount, formData.taxType, formData.taxRate, formData.adjustmentAmount, formData.items]);


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
                    <div className="grid gap-6 mb-6 md:grid-cols-2">
                        <div>
                            {/* Label wraps input */}
                            <label className={labelStyle}>Your Name
                                <input type="text" {...register("yourName", { required: "Name is required" })} className={inputStyle} />
                            </label>
                            {errors.yourName && <p className={errorStyle}>{errors.yourName.message}</p>}
                        </div>
                        <div>
                            <label className={labelStyle}>Your Email
                                <input type="email" {...register("yourEmail", { required: "Email is required" })} className={inputStyle} />
                            </label>
                            {errors.yourEmail && <p className={errorStyle}>{errors.yourEmail.message}</p>}
                        </div>
                        <div>
                            <label className={labelStyle}>State/Province
                                <input type="text" {...register("yourState")} className={inputStyle} />
                            </label>
                        </div>
                        <div>
                            <label className={labelStyle}>Country
                                <input type="text" {...register("yourCountry")} className={inputStyle} />
                            </label>
                        </div>
                        <div>
                            <label className={labelStyle}>Logo (Optional)
                                <input type="file" {...register("logo")} className={inputStyle} />
                            </label>
                        </div>
                    </div>

                    {/* Client Information & Invoice Details */}
                    <h2 className="text-xl font-semibold border-b pb-2 mb-4 mt-6">Client & Invoice Details</h2>
                    <div className="grid gap-6 mb-6 md:grid-cols-2">
                        <div>
                            <label className={labelStyle}>Bill To
                                <input type="text" {...register("billTo", { required: "Client Name is required" })} className={inputStyle} />
                            </label>
                            {errors.billTo && <p className={errorStyle}>{errors.billTo.message}</p>}
                        </div>
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
                                <div className="flex w-1/3 space-x-2 items-center">
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
                                {/* Radio Buttons */}
                                <div className="flex flex-col space-x-3 text-sm">
                                    <label>
                                        <input
                                            type="radio"
                                            value="None"
                                            {...register("taxType")}
                                            className="mr-1"
                                            defaultChecked
                                        />
                                        None
                                    </label>
                                    <label>
                                        <input
                                            type="radio"
                                            value="TDS"
                                            {...register("taxType")}
                                            className="mr-1"
                                        />
                                        TDS
                                    </label>
                                    <label>
                                        <input
                                            type="radio"
                                            value="TCS"
                                            {...register("taxType")}
                                            className="mr-1"
                                        />
                                        TCS
                                    </label>
                                </div>

                                {/* Select Tax Rate Dropdown (Simulated with Input) */}
                                <div className="w-1/3">
                                    <input
                                        type="number"
                                        step="0.01"
                                        placeholder="Rate (%)"
                                        {...register("taxRate", { valueAsNumber: true, min: 0, max: 100 })}
                                        className="w-full p-1 border rounded text-right text-sm"
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
            <div className={showPreview ? " absolute h-[calc(100vh-10rem)] w-auto top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" : " fixed bottom-0 right-0 h-64 w-48 p-4 overflow-hidden bg-gray-200"}>
                {/* <h2 className="text-2xl font-bold mb-4 text-gray-800">PDF Preview</h2> */}
                {!showPreview &&
                    <div
                        className=' absolute bg-gray-100/70 hover:bg-gray-400/80 hover:text-white font-semibold text-5xl cursor-pointer h-56 w-40 z-10 flex justify-center items-center'
                        onClick={() => setShowPreview(true)}>
                        <span className='text-xs'>Show PDF Preview</span>
                    </div>}
                <div className={showPreview ? "" : "bg-white shadow-xl scale-[0.2] origin-top-left "}>
                    {/* Pass the fully calculated formData to the PrintableInvoice */}
                    <PrintableInvoice ref={componentRef} data={formData as IInvoiceFormData} />
                </div>
            </div>
        </div>
    );
};

export default InvoiceForm;