import React from 'react';
// Assuming IInvoicePDFProps is an interface for the data object
// that is passed to the component, similar to the one implied in the original code.
import type { IInvoicePDFProps, IInvoiceItem } from '../type/invoice';
import { ToWords } from 'to-words';

// A utility function to format currency
const formatCurrency = (amount: number): string => {
    // The PDF uses '25,000.00' format without the '₹' symbol.
    return new Intl.NumberFormat('en-IN', {
        style: 'decimal', // Use decimal style to omit currency symbol
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
};

const numberToWords = (num: number): string => {
    // ... (ToWords implementation remains the same)
    const toWords = new ToWords({
        localeCode: 'en-IN',
        converterOptions: {
            currency: true,
            ignoreDecimal: false,
            ignoreZeroCurrency: false,
            doNotAddOnly: false,
            currencyOptions: {
                name: 'Rupee',
                plural: 'Rupees',
                symbol: '₹',
                fractionalUnit: {
                    name: 'Paisa',
                    plural: 'Paise',
                    symbol: '',
                },
            },
        },
    });
    // NOTE: This will return a detailed word format (e.g., "Twenty-Five Thousand Rupees Only")
    return `Indian Rupee ${toWords.convert(num)}`;
};


const InvoicePDF: React.FC<IInvoicePDFProps> = ({ data }) => {
    const {
        yourName, yourAddress, yourCity, yourPinCode, yourState, yourCountry, yourEmail, yourPhone, billTo, billToEmail, billToPhone, billToAddress, billToCity, billToState, billToCountry, billToPinCode,
        invoiceSubject, invoiceNumber, invoiceDate, terms, dueDate,
        items, notes, authorizedSignature, logo,
        subTotal, totalAmount, balanceDue,
        // --- NEW FIELDS DESTRUCTURED ---
        discount, taxType, taxTypeLabel, taxRate, adjustmentDescription, adjustmentAmount
    } = data;

    const PlaceholderLogo: React.FC = () => (
        <div className="h-10"></div>
    );


    const formattedInvoiceDate = invoiceDate ? new Date(invoiceDate).toLocaleDateString('en-IN') : 'N/A';
    const formattedDueDate = dueDate ? new Date(dueDate).toLocaleDateString('en-IN') : 'N/A';

    // --- Recalculate amounts for display consistency ---
    const discountAmount = subTotal * (discount / 100);
    const amountAfterDiscount = subTotal - discountAmount;

    let taxAmount = 0;
    if (taxType !== 'None' && taxRate > 0) {
        taxAmount = amountAfterDiscount * (taxRate / 100);
    }

    const finalAdjustment = adjustmentAmount || 0;
    // --- End Recalculation ---

    return (
        // KEY CHANGE 1: Use classes to enforce A4 size and allow printing.
        // `print:w-full print:h-[297mm]` ensures A4 size during print preview.
        // `print:p-8` maintains consistent padding.
        // `break-after-page` is a Tailwind utility for CSS 'page-break-after: always'
        <div className="p-8 bg-white min-h-[1123px] w-[794px] mx-auto font-sans text-gray-800 
                        print:w-full print:h-auto print:min-h-screen print:p-8">

            {/* --- Header (Logo and Invoice Title) --- */}
            <header className="flex justify-between items-start mb-6">
                <div className="w-1/3">
                    {/* The PDF has no visible logo, so we render the placeholder/empty space */}
                    {logo && logo[0] ? (
                        <img src={URL.createObjectURL(logo[0])} alt="Company Logo" className="max-h-16 max-w-full" />
                    ) : (
                        <PlaceholderLogo />
                    )}
                </div>
                <div className="text-right">
                    {/* Invoice title is simple, uppercase, and centered on the page for a clean look */}
                    <h1 className="text-3xl font-bold text-black mb-1">
                        TAX INVOICE
                    </h1>
                    <p className="text-lg text-gray-700">
                        #{invoiceNumber}
                    </p>
                </div>
            </header>

            {/* --- Sender and Recipient Info --- */}
            {/* Added `break-after-avoid` to ensure this important block stays together */}
            <div className="flex justify-between mb-8 text-sm print:break-after-avoid">
                {/* Sender Info (Kabilan GR) */}
                <div className="w-1/3 space-y-1">
                    <p className="font-semibold text-gray-900">{yourName}</p>
                    {yourAddress && <p>{yourAddress}</p>}
                    {(yourCity || yourPinCode) && <p>{yourCity} {yourCity && yourPinCode ? "-" : ""} {yourPinCode}</p>}
                    {yourState && <p>{yourState}</p>}
                    {yourCountry && <p>{yourCountry}</p>}
                    {yourEmail && <p className="text-gray-700">{yourEmail}</p>}
                    {yourPhone && <p className="text-gray-700">{yourPhone}</p>}
                </div>

                {/* Recipient Info (Bill To) */}
                <div className="w-1/3 text-right">
                    <p className="font-bold text-gray-700 text-base mb-1">Bill To</p>
                    <p className="font-semibold">{billTo}</p>
                    {billToAddress && <p>{billToAddress}</p>}
                    {(billToCity || billToPinCode) && <p>{billToCity} {billToPinCode && billToCity ? "-" : ""} {billToPinCode}</p>}
                    {billToState && <p>{billToState}</p>}
                    {billToCountry && <p>{billToCountry}</p>}
                    {billToEmail && <p className="text-gray-700">{billToEmail}</p>}
                    {billToPhone && <p className="text-gray-700">{billToPhone}</p>}
                </div>
            </div>

            {/* --- Subject --- */}
            {/* Added `break-after-avoid` */}
            <div className="mb-8 print:break-after-avoid">
                <p className="font-bold text-gray-700 text-sm mb-1">Subject:</p>
                {/* The PDF's subject text is plain, not in a box or gray background */}
                <p className="text-gray-900 font-medium whitespace-pre-wrap leading-tight">
                    {invoiceSubject}
                </p>
            </div>

            {/* --- Items Table --- */}
            <div className="mb-8 border border-black">
                <table className="min-w-full border-collapse">
                    <thead>
                        <tr className="bg-gray-100 text-left text-sm font-semibold text-gray-700 border-b border-black print:break-inside-avoid"><th className="p-2 border-r border-black w-[5%] text-center">#</th><th className="p-2 border-r border-black w-[55%]">Item & Description</th><th className="p-2 border-r border-black w-[10%] text-right">Qty</th><th className="p-2 border-r border-black w-[15%] text-right">Rate</th><th className="p-2 w-[15%] text-right">Amount</th></tr>
                    </thead>
                    <tbody>
                        {items.map((item, index) => (
                            <tr key={index} className="text-sm align-top border-b border-gray-300 last:border-b-0 print:break-inside-avoid"><td className="p-2 border-r border-gray-300 text-center">{index + 1}</td><td className="p-2 border-r border-gray-300 whitespace-pre-wrap text-xs leading-snug">{item.description}</td><td className="p-2 border-r border-gray-300 text-right">{item.qty.toFixed(2)}</td><td className="p-2 border-r border-gray-300 text-right">{formatCurrency(item.rate)}</td><td className="p-2 text-right">{formatCurrency(item.qty * item.rate)}</td></tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* --- Footer Details (Dates and Totals) --- */}
            {/* KEY CHANGE 4: Wrap the whole footer in a div that avoids page breaks */}
            <div className="print:break-before-auto print:break-inside-avoid">
                <div className="flex justify-between text-sm">

                    {/* Dates and Terms - Left side */}
                    <div className="w-1/3 space-y-1">
                        <p className="flex justify-between">
                            <span className="font-bold">Invoice Date:</span>
                            <span>{formattedInvoiceDate}</span>
                        </p>
                        <p className="flex justify-between">
                            <span className="font-bold">Terms:</span>
                            <span>{terms}</span>
                        </p>
                        <p className="flex justify-between">
                            <span className="font-bold">Due Date:</span>
                            <span>{formattedDueDate}</span>
                        </p>
                    </div>

                    {/* Totals Summary - Right side (UPDATED) */}
                    <div className="w-1/3">
                        <table className="min-w-full text-right text-sm">
                            <tbody>
                                {/* 1. Sub Total */}
                                <tr className="print:break-inside-avoid">
                                    <td className="p-1 pr-0 font-semibold">Sub Total</td>
                                    <td className="p-1 pl-0">{formatCurrency(subTotal)}</td>
                                </tr>

                                {/* 2. Discount */}
                                {discount > 0 && (
                                    <tr className="print:break-inside-avoid">
                                        <td className="p-1 pr-0 font-medium">Discount ({discount}%)</td>
                                        <td className="p-1 pl-0 text-red-600">- {formatCurrency(discountAmount)}</td>
                                    </tr>
                                )}

                                {/* 3. TDS/TCS */}
                                {taxAmount > 0 && (
                                    <tr className="print:break-inside-avoid">
                                        <td className="p-1 pr-0 font-medium">{taxType} {(taxTypeLabel) ? `-${taxTypeLabel}` : taxTypeLabel} ({taxRate}%)</td>
                                        <td className="p-1 pl-0 text-red-600">- {formatCurrency(taxAmount)}</td>
                                    </tr>
                                )}

                                {/* 4. Adjustment */}
                                {finalAdjustment !== 0 && (
                                    <tr className="print:break-inside-avoid">
                                        <td className="p-1 pr-0 font-medium">{adjustmentDescription}</td>
                                        <td className={`p-1 pl-0 ${finalAdjustment < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                            {finalAdjustment >= 0 ? '+' : ''} {formatCurrency(finalAdjustment)}
                                        </td>
                                    </tr>
                                )}

                                {/* 5. Total */}
                                <tr className="border-b border-t border-black print:break-inside-avoid">
                                    <td className="p-1 pr-0 font-semibold">Total</td>
                                    <td className="p-1 pl-0">{formatCurrency(totalAmount)}</td>
                                </tr>

                                {/* 6. Balance Due */}
                                <tr className="text-base font-bold print:break-inside-avoid">
                                    <td className="p-1 pr-0">Balance Due</td>
                                    <td className="p-1 pl-0">{formatCurrency(balanceDue)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Total in Words */}
                <div className="mt-8 text-sm print:break-inside-avoid">
                    <p className="font-medium text-gray-900">
                        Total In Words: <span className="italic">{numberToWords(totalAmount)}</span>
                    </p>
                </div>

                {/* Notes */}
                <div className="mt-6 print:break-inside-avoid">
                    <p className="font-bold text-gray-700 text-sm mb-1">Notes</p>
                    <p className="text-gray-600">{notes}</p>
                </div>

                {/* Signature */}
                <div className="mt-20 pt-1 text-right w-1/3 float-right print:break-inside-avoid">
                    <p className="border-t border-black pt-1 text-sm font-semibold mb-1">{authorizedSignature}</p>
                    <p className="text-xs text-gray-600">Authorized Signature</p>
                </div>
            </div>
        </div>
    );
};

export default InvoicePDF;