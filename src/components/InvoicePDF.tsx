import React from "react";
// Assuming IInvoicePDFProps is an interface for the data object
// that is passed to the component, similar to the one implied in the original code.
import type { IInvoicePDFProps, IInvoiceItem } from "../type/invoice";
import { ToWords } from "to-words";
import { isIntraState } from "@/lib/utils";

// A utility function to format currency
const formatCurrency = (amount: number): string => {
  // The PDF uses '25,000.00' format without the '₹' symbol.
  return new Intl.NumberFormat("en-IN", {
    style: "decimal", // Use decimal style to omit currency symbol
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

const numberToWords = (num: number): string => {
  // ... (ToWords implementation remains the same)
  const toWords = new ToWords({
    localeCode: "en-IN",
    converterOptions: {
      currency: true,
      ignoreDecimal: false,
      ignoreZeroCurrency: false,
      doNotAddOnly: false,
      currencyOptions: {
        name: "Rupee",
        plural: "Rupees",
        symbol: "₹",
        fractionalUnit: {
          name: "Paisa",
          plural: "Paise",
          symbol: "",
        },
      },
    },
  });
  // NOTE: This will return a detailed word format (e.g., "Twenty-Five Thousand Rupees Only")
  return `Indian Rupee ${toWords.convert(num)}`;
};

const InvoicePDF: React.FC<IInvoicePDFProps> = ({
  data,
  template = "classic",
  color = "#4f46e5",
}) => {
  const {
    yourName,
    yourAddress,
    yourCity,
    yourPinCode,
    yourState,
    yourCountry,
    yourEmail,
    yourPhone,
    billTo,
    billToEmail,
    billToPhone,
    billToAddress,
    billToCity,
    billToState,
    billToCountry,
    billToPinCode,
    invoiceSubject,
    invoiceNumber,
    invoiceDate,
    terms,
    dueDate,
    items,
    notes,
    authorizedSignature,
    logo,
    subTotal,
    totalAmount,
    balanceDue,
    discount,
    taxType,
    taxTypeLabel,
    taxRate,
    adjustmentDescription,
    adjustmentAmount,
    taxMethod,
    taxInclusive,
    taxAmount,
  } = data as any;

  const PlaceholderLogo: React.FC = () => (
    <div className="h-10 w-10 bg-slate-100 rounded flex items-center justify-center text-xs text-slate-400">
      Logo
    </div>
  );

  const formattedInvoiceDate = invoiceDate
    ? new Date(invoiceDate).toLocaleDateString("en-IN")
    : "N/A";
  const formattedDueDate = dueDate
    ? new Date(dueDate).toLocaleDateString("en-IN")
    : "N/A";

  // Calculations
  const discountAmount = subTotal * (discount / 100);
  const amountAfterDiscount = subTotal - discountAmount;

  const isTaxInclusive = (data as any).taxInclusive && taxType === "GST";

  // Use passed taxAmount if available, otherwise default to 0
  // (It should always be passed now)
  const finalTaxAmount = taxAmount || 0;

  const finalAdjustment = adjustmentAmount || 0;

  // --- TEMPLATE: MINIMAL ---
  if (template === "minimal") {
    return (
      <div className="p-8 bg-white min-h-[1123px] w-[794px] mx-auto font-sans text-slate-800 print:w-full print:h-auto print:min-h-screen print:p-8">
        <div className="flex justify-between items-end mb-12 pb-4 border-b border-slate-200">
          <div>
            <h1
              className="text-4xl font-light tracking-tight"
              style={{ color }}
            >
              INVOICE
            </h1>
            <p className="text-slate-500 mt-1">#{invoiceNumber}</p>
          </div>
          <div className="text-right">
            {logo && logo[0] ? (
              <img
                src={URL.createObjectURL(logo[0])}
                alt="Logo"
                className="max-h-12"
              />
            ) : (
              <PlaceholderLogo />
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-12 mb-12">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              From
            </p>
            <p className="font-medium">{yourName}</p>
            <div className="text-sm text-slate-500 mt-1 space-y-0.5">
              {yourAddress && <p>{yourAddress}</p>}
              {(yourCity || yourPinCode) && (
                <p>
                  {yourCity} {yourPinCode}
                </p>
              )}
              {yourCountry && <p>{yourCountry}</p>}
            </div>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Bill To
            </p>
            <p className="font-medium">{billTo}</p>
            <div className="text-sm text-slate-500 mt-1 space-y-0.5">
              {billToAddress && <p>{billToAddress}</p>}
              {(billToCity || billToPinCode) && (
                <p>
                  {billToCity} {billToPinCode}
                </p>
              )}
              {billToCountry && <p>{billToCountry}</p>}
            </div>
          </div>
        </div>

        <div className="mb-12">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                <th className="py-3">Description</th>
                <th className="py-3 text-right">Qty</th>
                <th className="py-3 text-right">
                  Rate {isTaxInclusive ? "(Incl. Tax)" : ""}
                </th>
                {taxMethod === "item_wise" && (
                  <th className="py-3 text-right">GST</th>
                )}
                <th className="py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item: IInvoiceItem, index: number) => (
                <tr key={index}>
                  <td className="py-4 text-sm">{item.description}</td>
                  <td className="py-4 text-sm text-right">{item.qty}</td>
                  <td className="py-4 text-sm text-right">
                    {formatCurrency(item.rate)}
                  </td>
                  {taxMethod === "item_wise" && (
                    <td className="py-4 text-sm text-right">
                      {item.gstRate || 0}%
                    </td>
                  )}
                  <td className="py-4 text-sm text-right font-medium">
                    {formatCurrency(item.qty * item.rate)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end mb-12">
          <div className="w-1/2 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Subtotal</span>
              <span>{formatCurrency(subTotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Discount ({discount}%)</span>
                <span className="text-red-500">
                  -{formatCurrency(discountAmount)}
                </span>
              </div>
            )}
            {taxAmount > 0 && (
              <>
                {taxType === "GST" && isIntraState(yourState, billToState) ? (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">
                        CGST ({taxRate / 2}%)
                      </span>
                      <span>
                        {isTaxInclusive ? "(incl.) " : ""}
                        {formatCurrency(taxAmount / 2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">
                        SGST ({taxRate / 2}%)
                      </span>
                      <span>
                        {isTaxInclusive ? "(incl.) " : ""}
                        {formatCurrency(taxAmount / 2)}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">
                      {taxType === "GST" ? "IGST" : taxTypeLabel || taxType} (
                      {taxRate}%)
                    </span>
                    <span>
                      {isTaxInclusive ? "(incl.) " : ""}
                      {formatCurrency(taxAmount)}
                    </span>
                  </div>
                )}
              </>
            )}
            <div className="flex justify-between text-lg font-bold pt-4 border-t border-slate-200">
              <span>Total</span>
              <span style={{ color }}>{formatCurrency(totalAmount)}</span>
            </div>
          </div>
        </div>

        <div className="text-sm text-slate-500">
          <p className="font-medium text-slate-900 mb-1">Notes</p>
          <p>{notes}</p>
        </div>
      </div>
    );
  }

  // --- TEMPLATE: BOLD ---
  if (template === "bold") {
    return (
      <div className="bg-white min-h-[1123px] w-[794px] mx-auto font-sans text-slate-900 print:w-full print:h-auto print:min-h-screen">
        <div className="p-8 text-white" style={{ backgroundColor: color }}>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-5xl font-black tracking-tighter">INVOICE</h1>
              <p className="mt-2 opacity-80">#{invoiceNumber}</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-xl">{yourName}</p>
              <p className="opacity-80 text-sm">{yourEmail}</p>
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="flex justify-between mb-12">
            <div>
              <p className="text-xs font-bold uppercase text-slate-400 mb-1">
                Billed To
              </p>
              <h3 className="text-xl font-bold">{billTo}</h3>
              <p className="text-slate-500 text-sm">{billToEmail}</p>
              <p className="text-slate-500 text-sm">{billToAddress}</p>
            </div>
            <div className="text-right">
              <div className="mb-4">
                <p className="text-xs font-bold uppercase text-slate-400 mb-1">
                  Date Issued
                </p>
                <p className="font-medium">{formattedInvoiceDate}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase text-slate-400 mb-1">
                  Due Date
                </p>
                <p className="font-medium">{formattedDueDate}</p>
              </div>
            </div>
          </div>

          <table className="w-full mb-12">
            <thead style={{ backgroundColor: color }} className="text-white">
              <tr>
                <th className="py-3 px-4 text-left text-sm font-bold uppercase">
                  Item
                </th>
                <th className="py-3 px-4 text-right text-sm font-bold uppercase">
                  Qty
                </th>
                <th className="py-2 text-right font-semibold text-white border-b-2 border-gray-200">
                  Rate {isTaxInclusive ? "(Incl. Tax)" : ""}
                </th>
                {taxMethod === "item_wise" && (
                  <th className="py-2 text-right font-semibold text-white border-b-2 border-gray-200">
                    GST
                  </th>
                )}
                <th className="py-2 text-right font-semibold text-white border-b-2 border-gray-200">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item: IInvoiceItem, index: number) => (
                <tr key={index} className="even:bg-slate-50">
                  <td className="py-3 px-4 text-sm font-medium">
                    {item.description}
                  </td>
                  <td className="py-3 px-4 text-sm text-right">{item.qty}</td>
                  <td className="py-3 px-4 text-sm text-right">
                    {formatCurrency(item.rate)}
                  </td>
                  {taxMethod === "item_wise" && (
                    <td className="py-3 px-4 text-sm text-right">
                      {item.gstRate || 0}%
                    </td>
                  )}
                  <td className="py-3 px-4 text-sm text-right font-bold">
                    {formatCurrency(item.qty * item.rate)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end">
            <div className="w-1/2 bg-slate-50 p-6 rounded-lg">
              <div className="flex justify-between mb-2">
                <span className="font-medium text-slate-600">Subtotal</span>
                <span className="font-bold">{formatCurrency(subTotal)}</span>
              </div>
              {taxAmount > 0 && (
                <>
                  {taxType === "GST" && isIntraState(yourState, billToState) ? (
                    <>
                      <div className="flex justify-between mb-2 pb-2 border-b border-slate-200">
                        <span className="font-medium text-slate-600">CGST</span>
                        <span className="font-bold">
                          {isTaxInclusive ? "(incl.) " : ""}
                          {formatCurrency(taxAmount / 2)}
                        </span>
                      </div>
                      <div className="flex justify-between mb-4 pb-4 border-b border-slate-200">
                        <span className="font-medium text-slate-600">SGST</span>
                        <span className="font-bold">
                          {isTaxInclusive ? "(incl.) " : ""}
                          {formatCurrency(taxAmount / 2)}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between mb-4 pb-4 border-b border-slate-200">
                      <span className="font-medium text-slate-600">
                        {taxType === "GST" ? "IGST" : "Tax"}
                      </span>
                      <span className="font-bold">
                        {isTaxInclusive ? "(incl.) " : ""}
                        {formatCurrency(taxAmount)}
                      </span>
                    </div>
                  )}
                </>
              )}
              <div
                className="flex justify-between text-xl font-black"
                style={{ color }}
              >
                <span>Total</span>
                <span>{formatCurrency(totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- TEMPLATE: MODERN ---
  if (template === "modern") {
    return (
      <div className="bg-white min-h-[1123px] w-[794px] mx-auto font-sans text-slate-800 print:w-full print:h-auto print:min-h-screen flex">
        {/* Sidebar */}
        <div
          className="w-1/3 p-8 text-white"
          style={{ backgroundColor: color }}
        >
          <div className="mb-12">
            {logo && logo[0] ? (
              <img
                src={URL.createObjectURL(logo[0])}
                alt="Logo"
                className="max-h-24 max-w-full mb-6 rounded-lg bg-white/10 p-2"
              />
            ) : (
              <div className="h-24 w-24 bg-white/20 rounded-lg flex items-center justify-center text-2xl font-bold mb-6">
                Logo
              </div>
            )}
            <h2 className="text-2xl font-bold mb-2">{yourName}</h2>
            <div className="text-sm opacity-90 space-y-1">
              {yourAddress && <p>{yourAddress}</p>}
              {(yourCity || yourPinCode) && (
                <p>
                  {yourCity} {yourPinCode}
                </p>
              )}
              {yourCountry && <p>{yourCountry}</p>}
              {yourEmail && (
                <p className="mt-4 pt-4 border-t border-white/20">
                  {yourEmail}
                </p>
              )}
              {yourPhone && <p>{yourPhone}</p>}
            </div>
          </div>

          <div className="mb-12">
            <p className="text-xs font-bold uppercase tracking-wider opacity-60 mb-2">
              Billed To
            </p>
            <h3 className="text-xl font-bold mb-2">{billTo}</h3>
            <div className="text-sm opacity-90 space-y-1">
              {billToAddress && <p>{billToAddress}</p>}
              {(billToCity || billToPinCode) && (
                <p>
                  {billToCity} {billToPinCode}
                </p>
              )}
              {billToCountry && <p>{billToCountry}</p>}
              {billToEmail && <p className="mt-2">{billToEmail}</p>}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="w-2/3 p-12 bg-slate-50">
          <div className="flex justify-between items-start mb-12">
            <div>
              <h1 className="text-4xl font-light text-slate-900 tracking-tight">
                INVOICE
              </h1>
              <p className="text-slate-500 mt-1">#{invoiceNumber}</p>
            </div>
            <div className="text-right">
              <div className="mb-4">
                <p className="text-xs font-bold uppercase text-slate-400">
                  Date
                </p>
                <p className="font-medium">{formattedInvoiceDate}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase text-slate-400">
                  Due Date
                </p>
                <p className="font-medium">{formattedDueDate}</p>
              </div>
            </div>
          </div>

          <table className="w-full mb-12">
            <thead>
              <tr className="border-b-2 border-slate-200 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3">Description</th>
                <th className="py-3 text-right">Qty</th>
                <th className="py-3 text-right font-semibold text-slate-600">
                  Rate {isTaxInclusive ? "(Incl. Tax)" : ""}
                </th>
                {taxMethod === "item_wise" && (
                  <th className="py-3 text-right font-semibold text-slate-600">
                    GST
                  </th>
                )}
                <th className="py-3 text-right font-semibold text-slate-600">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {items.map((item: IInvoiceItem, index: number) => (
                <tr key={index}>
                  <td className="py-4 text-sm font-medium text-slate-700">
                    {item.description}
                  </td>
                  <td className="py-4 text-sm text-right text-slate-600">
                    {item.qty}
                  </td>
                  <td className="py-4 text-sm text-right text-slate-600">
                    {formatCurrency(item.rate)}
                  </td>
                  {taxMethod === "item_wise" && (
                    <td className="py-4 text-sm text-right text-slate-600">
                      {item.gstRate || 0}%
                    </td>
                  )}
                  <td className="py-4 text-sm text-right font-bold text-slate-900">
                    {formatCurrency(item.qty * item.rate)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end mb-12">
            <div className="w-2/3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Subtotal</span>
                <span className="font-medium">{formatCurrency(subTotal)}</span>
              </div>
              {taxAmount > 0 && (
                <>
                  {taxType === "GST" && isIntraState(yourState, billToState) ? (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">
                          CGST ({taxRate / 2}%)
                        </span>
                        <span className="font-medium">
                          {isTaxInclusive ? "(incl.) " : ""}
                          {formatCurrency(taxAmount / 2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">
                          SGST ({taxRate / 2}%)
                        </span>
                        <span className="font-medium">
                          {isTaxInclusive ? "(incl.) " : ""}
                          {formatCurrency(taxAmount / 2)}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">
                        {taxType === "GST" ? "IGST" : "Tax"} ({taxRate}%)
                      </span>
                      <span className="font-medium">
                        {isTaxInclusive ? "(incl.) " : ""}
                        {formatCurrency(taxAmount)}
                      </span>
                    </div>
                  )}
                </>
              )}
              <div className="flex justify-between text-xl font-bold pt-4 border-t-2 border-slate-200 mt-4">
                <span className="text-slate-900">Total</span>
                <span style={{ color }}>{formatCurrency(totalAmount)}</span>
              </div>
            </div>
          </div>

          {notes && (
            <div className="bg-white p-6 rounded-lg border border-slate-200">
              <p className="text-xs font-bold uppercase text-slate-400 mb-2">
                Notes
              </p>
              <p className="text-sm text-slate-600">{notes}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- TEMPLATE: PROFESSIONAL ---
  if (template === "professional") {
    return (
      <div
        className="bg-white min-h-[1123px] w-[794px] mx-auto font-serif text-slate-900 print:w-full print:h-auto print:min-h-screen p-12 border-t-8"
        style={{ borderColor: color }}
      >
        <div className="text-center mb-16">
          {logo && logo[0] && (
            <img
              src={URL.createObjectURL(logo[0])}
              alt="Logo"
              className="h-16 mx-auto mb-6"
            />
          )}
          <h1
            className="text-4xl font-bold tracking-widest uppercase mb-2"
            style={{ color }}
          >
            INVOICE
          </h1>
          <p className="text-slate-500 tracking-widest">#{invoiceNumber}</p>
        </div>

        <div className="flex justify-between mb-16 border-b border-slate-100 pb-12">
          <div className="text-center w-1/3">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">
              From
            </p>
            <h3 className="font-bold text-lg mb-1">{yourName}</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              {yourAddress}
              <br />
              {yourCity} {yourPinCode}
              <br />
              {yourCountry}
            </p>
          </div>
          <div className="text-center w-1/3 border-l border-r border-slate-100 px-8">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">
              Details
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Date Issued:</span>
                <span className="font-medium">{formattedInvoiceDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Due Date:</span>
                <span className="font-medium">{formattedDueDate}</span>
              </div>
            </div>
          </div>
          <div className="text-center w-1/3">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">
              Bill To
            </p>
            <h3 className="font-bold text-lg mb-1">{billTo}</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              {billToAddress}
              <br />
              {billToCity} {billToPinCode}
              <br />
              {billToCountry}
            </p>
          </div>
        </div>

        <table className="w-full mb-12">
          <thead>
            <tr className="border-b border-slate-900 text-left text-xs font-bold uppercase tracking-widest">
              <th className="py-4">Item Description</th>
              <th className="py-4 text-center">Quantity</th>
              <th className="py-4 text-right font-semibold">
                Rate {isTaxInclusive ? "(Incl. Tax)" : ""}
              </th>
              {taxMethod === "item_wise" && (
                <th className="py-4 text-right font-semibold">GST</th>
              )}
              <th className="py-4 text-right font-semibold">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item: IInvoiceItem, index: number) => (
              <tr key={index}>
                <td className="py-4 text-sm">{item.description}</td>
                <td className="py-4 text-sm text-center text-slate-500">
                  {item.qty}
                </td>
                <td className="py-4 text-sm text-right text-slate-500">
                  {formatCurrency(item.rate)}
                </td>
                {taxMethod === "item_wise" && (
                  <td className="py-4 text-sm text-right text-slate-500">
                    {item.gstRate || 0}%
                  </td>
                )}
                <td className="py-4 text-sm text-right font-medium">
                  {formatCurrency(item.qty * item.rate)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end mb-16">
          <div className="w-1/2">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-sm text-slate-500">Subtotal</span>
              <span className="font-medium">{formatCurrency(subTotal)}</span>
            </div>
            {taxAmount > 0 && (
              <>
                {taxType === "GST" && isIntraState(yourState, billToState) ? (
                  <>
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-sm text-slate-500">
                        CGST ({taxRate / 2}%)
                      </span>
                      <span className="font-medium">
                        {isTaxInclusive ? "(incl.) " : ""}
                        {formatCurrency(taxAmount / 2)}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-sm text-slate-500">
                        SGST ({taxRate / 2}%)
                      </span>
                      <span className="font-medium">
                        {isTaxInclusive ? "(incl.) " : ""}
                        {formatCurrency(finalTaxAmount / 2)}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-sm text-slate-500">
                      {taxType === "GST" ? "IGST" : "Tax"} ({taxRate}%)
                    </span>
                    <span className="font-medium">
                      {isTaxInclusive ? "(incl.) " : ""}
                      {formatCurrency(taxAmount)}
                    </span>
                  </div>
                )}
              </>
            )}
            <div className="flex justify-between py-4 text-xl font-bold">
              <span>Total Due</span>
              <span style={{ color }}>{formatCurrency(totalAmount)}</span>
            </div>
          </div>
        </div>

        {authorizedSignature && (
          <div className="text-center mt-24">
            <p className="font-script text-3xl mb-2 text-slate-600">
              {authorizedSignature}
            </p>
            <p className="text-xs uppercase tracking-widest text-slate-400 border-t border-slate-200 inline-block pt-2 px-8">
              Authorized Signature
            </p>
          </div>
        )}
      </div>
    );
  }

  // --- TEMPLATE: ELEGANT ---
  if (template === "elegant") {
    return (
      <div className="bg-white min-h-[1123px] w-[794px] mx-auto font-serif text-slate-800 print:w-full print:h-auto print:min-h-screen p-12 border border-slate-200">
        <div className="text-center border-b-2 border-double border-slate-300 pb-8 mb-8">
          {logo && logo[0] && (
            <img
              src={URL.createObjectURL(logo[0])}
              alt="Logo"
              className="h-20 mx-auto mb-4"
            />
          )}
          <h1
            className="text-5xl font-medium tracking-widest text-slate-900 uppercase"
            style={{ color }}
          >
            Invoice
          </h1>
          <p className="text-slate-500 mt-2 italic">#{invoiceNumber}</p>
        </div>

        <div className="flex justify-between mb-12">
          <div className="text-left">
            <h3 className="font-bold text-lg text-slate-900 mb-2">From:</h3>
            <p className="font-medium text-lg">{yourName}</p>
            <div className="text-slate-600 text-sm leading-relaxed">
              {yourAddress && <p>{yourAddress}</p>}
              {(yourCity || yourPinCode) && (
                <p>
                  {yourCity} {yourPinCode}
                </p>
              )}
              {yourCountry && <p>{yourCountry}</p>}
              {yourEmail && <p>{yourEmail}</p>}
            </div>
          </div>
          <div className="text-right">
            <h3 className="font-bold text-lg text-slate-900 mb-2">To:</h3>
            <p className="font-medium text-lg">{billTo}</p>
            <div className="text-slate-600 text-sm leading-relaxed">
              {billToAddress && <p>{billToAddress}</p>}
              {(billToCity || billToPinCode) && (
                <p>
                  {billToCity} {billToPinCode}
                </p>
              )}
              {billToCountry && <p>{billToCountry}</p>}
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-12 mb-12 border-y border-slate-100 py-6">
          <div className="text-center">
            <p className="text-xs uppercase tracking-widest text-slate-400 mb-1">
              Date Issued
            </p>
            <p className="font-medium text-lg">{formattedInvoiceDate}</p>
          </div>
          <div className="text-center">
            <p className="text-xs uppercase tracking-widest text-slate-400 mb-1">
              Due Date
            </p>
            <p className="font-medium text-lg">{formattedDueDate}</p>
          </div>
        </div>

        <table className="w-full mb-12">
          <thead>
            <tr className="border-b border-slate-300 text-left text-sm font-bold uppercase tracking-wider text-slate-600">
              <th className="py-2 px-2">Description</th>
              <th className="py-2 px-2 text-center">Qty</th>
              <th className="py-2 px-2 text-right">Rate</th>
              {taxMethod === "item_wise" && (
                <th className="py-2 px-2 text-right">GST</th>
              )}
              <th className="py-2 px-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item: IInvoiceItem, index: number) => (
              <tr key={index}>
                <td className="py-3 px-2 text-sm">{item.description}</td>
                <td className="py-3 px-2 text-sm text-center text-slate-500">
                  {item.qty}
                </td>
                <td className="py-3 px-2 text-sm text-right text-slate-500">
                  {formatCurrency(item.rate)}
                </td>
                {taxMethod === "item_wise" && (
                  <td className="py-3 px-2 text-sm text-right text-slate-500">
                    {item.gstRate || 0}%
                  </td>
                )}
                <td className="py-3 px-2 text-sm text-right font-medium">
                  {formatCurrency(item.qty * item.rate)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end mb-16">
          <div className="w-1/2 bg-slate-50 p-6 rounded border border-slate-100">
            <div className="flex justify-between py-2 border-b border-slate-200 border-dashed">
              <span className="text-sm text-slate-600">Subtotal</span>
              <span className="font-medium">{formatCurrency(subTotal)}</span>
            </div>
            {finalTaxAmount > 0 && (
              <>
                {taxType === "GST" && isIntraState(yourState, billToState) ? (
                  <>
                    <div className="flex justify-between py-2 border-b border-slate-200 border-dashed">
                      <span className="text-sm text-slate-600">
                        CGST ({taxRate / 2}%)
                      </span>
                      <span className="font-medium">
                        {isTaxInclusive ? "(incl.) " : "+ "}
                        {formatCurrency(finalTaxAmount / 2)}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-200 border-dashed">
                      <span className="text-sm text-slate-600">
                        SGST ({taxRate / 2}%)
                      </span>
                      <span className="font-medium">
                        {isTaxInclusive ? "(incl.) " : "+ "}
                        {formatCurrency(finalTaxAmount / 2)}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between py-2 border-b border-slate-200 border-dashed">
                    <span className="text-sm text-slate-600">
                      {taxType === "GST" ? "IGST" : taxTypeLabel || taxType}
                      {taxRate > 0 ? ` (${taxRate}%)` : ""}
                    </span>
                    <span className="font-medium">
                      {taxType === "TDS"
                        ? "-"
                        : isTaxInclusive
                        ? "(incl.) "
                        : "+"}{" "}
                      {formatCurrency(finalTaxAmount)}
                    </span>
                  </div>
                )}
              </>
            )}
            <div className="flex justify-between py-4 text-xl font-medium">
              <span className="text-slate-900">Total</span>
              <span style={{ color }}>{formatCurrency(totalAmount)}</span>
            </div>
          </div>
        </div>

        {authorizedSignature && (
          <div className="flex justify-end mt-12">
            <div className="text-center">
              <p className="font-script text-3xl mb-2 text-slate-600">
                {authorizedSignature}
              </p>
              <p className="text-xs uppercase tracking-widest text-slate-400 border-t border-slate-300 pt-2 px-8">
                Authorized Signature
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- TEMPLATE: TECH ---
  if (template === "tech") {
    return (
      <div className="bg-slate-900 min-h-[1123px] w-[794px] mx-auto font-mono text-slate-300 print:w-full print:h-auto print:min-h-screen p-8 print:bg-white print:text-black">
        <div className="border-2 border-slate-700 p-8 h-full print:border-black">
          <div className="flex justify-between items-start mb-12 border-b-2 border-slate-700 pb-8 print:border-black">
            <div>
              <h1 className="text-4xl font-bold tracking-tighter text-green-400 print:text-black mb-2">
                &gt; INVOICE_
              </h1>
              <p className="text-slate-500 print:text-slate-600">
                ID: {invoiceNumber}
              </p>
            </div>
            <div className="text-right">
              {logo && logo[0] ? (
                <img
                  src={URL.createObjectURL(logo[0])}
                  alt="Logo"
                  className="h-12 grayscale opacity-80"
                />
              ) : (
                <div className="text-2xl font-bold text-slate-600">[LOGO]</div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-12">
            <div className="bg-slate-800 p-6 rounded print:bg-slate-100">
              <p className="text-xs text-green-400 mb-2 print:text-black">
                // FROM
              </p>
              <p className="font-bold text-white print:text-black text-lg">
                {yourName}
              </p>
              <div className="text-sm mt-2 space-y-1">
                {yourAddress && <p>{yourAddress}</p>}
                {(yourCity || yourPinCode) && (
                  <p>
                    {yourCity} {yourPinCode}
                  </p>
                )}
                {yourEmail && <p>{yourEmail}</p>}
              </div>
            </div>
            <div className="bg-slate-800 p-6 rounded print:bg-slate-100">
              <p className="text-xs text-green-400 mb-2 print:text-black">
                // TO
              </p>
              <p className="font-bold text-white print:text-black text-lg">
                {billTo}
              </p>
              <div className="text-sm mt-2 space-y-1">
                {billToAddress && <p>{billToAddress}</p>}
                {(billToCity || billToPinCode) && (
                  <p>
                    {billToCity} {billToPinCode}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-8 mb-12 text-sm">
            <div>
              <span className="text-slate-500 print:text-slate-600">
                DATE_ISSUED:
              </span>{" "}
              <span className="text-white print:text-black">
                {formattedInvoiceDate}
              </span>
            </div>
            <div>
              <span className="text-slate-500 print:text-slate-600">
                DUE_DATE:
              </span>{" "}
              <span className="text-white print:text-black">
                {formattedDueDate}
              </span>
            </div>
          </div>

          <table className="w-full mb-12 border-collapse">
            <thead>
              <tr className="border-b border-slate-700 print:border-black text-left text-xs text-green-400 print:text-black">
                <th className="py-2 px-4">ITEM</th>
                <th className="py-2 px-4 text-right">QTY</th>
                <th className="py-2 px-4 text-right">RATE</th>
                {taxMethod === "item_wise" && (
                  <th className="py-2 px-4 text-right">GST</th>
                )}
                <th className="py-2 px-4 text-right">AMT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 print:divide-slate-200">
              {items.map((item: IInvoiceItem, index: number) => (
                <tr key={index}>
                  <td className="py-3 px-4 text-sm">{item.description}</td>
                  <td className="py-3 px-4 text-sm text-right">{item.qty}</td>
                  <td className="py-3 px-4 text-sm text-right">
                    {formatCurrency(item.rate)}
                  </td>
                  {taxMethod === "item_wise" && (
                    <td className="py-3 px-4 text-sm text-right text-white print:text-black">
                      {item.gstRate || 0}%
                    </td>
                  )}
                  <td className="py-3 px-4 text-sm text-right text-white print:text-black">
                    {formatCurrency(item.qty * item.rate)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end">
            <div className="w-1/2 border-t-2 border-slate-700 print:border-black pt-4">
              <div className="flex justify-between mb-2 text-sm">
                <span>SUBTOTAL</span>
                <span>{formatCurrency(subTotal)}</span>
              </div>
              {finalTaxAmount > 0 && (
                <>
                  {taxType === "GST" && isIntraState(yourState, billToState) ? (
                    <>
                      <div className="flex justify-between mb-2 text-sm">
                        <span>CGST ({taxRate / 2}%)</span>
                        <span>
                          {isTaxInclusive ? "(incl.) " : ""}
                          {formatCurrency(finalTaxAmount / 2)}
                        </span>
                      </div>
                      <div className="flex justify-between mb-2 text-sm">
                        <span>SGST ({taxRate / 2}%)</span>
                        <span>
                          {isTaxInclusive ? "(incl.) " : ""}
                          {formatCurrency(finalTaxAmount / 2)}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between mb-2 text-sm">
                      <span>
                        {taxType === "GST" ? "IGST" : "TAX"} ({taxRate}%)
                      </span>
                      <span>
                        {isTaxInclusive ? "(incl.) " : ""}
                        {formatCurrency(finalTaxAmount)}
                      </span>
                    </div>
                  )}
                </>
              )}
              <div className="flex justify-between text-xl font-bold text-green-400 print:text-black mt-4 pt-4 border-t border-slate-800 print:border-slate-300">
                <span>TOTAL</span>
                <span>{formatCurrency(totalAmount)}</span>
              </div>
            </div>
          </div>

          <div className="mt-12 text-xs text-slate-600 text-center">
            &lt;END_OF_TRANSMISSION /&gt;
          </div>
        </div>
      </div>
    );
  }

  // --- TEMPLATE: CREATIVE ---
  if (template === "creative") {
    return (
      <div className="bg-white min-h-[1123px] w-[794px] mx-auto font-sans text-slate-800 print:w-full print:h-auto print:min-h-screen flex flex-row-reverse">
        {/* Sidebar Right */}
        <div
          className="w-1/3 p-8 text-white flex flex-col justify-between"
          style={{ backgroundColor: color }}
        >
          <div>
            <div className="text-right mb-12">
              <h1 className="text-5xl font-bold leading-none mb-2">
                IN
                <br />
                VO
                <br />
                ICE
              </h1>
              <p className="opacity-70 text-lg">#{invoiceNumber}</p>
            </div>

            <div className="mb-12 text-right">
              <p className="text-xs font-bold uppercase opacity-60 mb-2">
                Issued To
              </p>
              <h3 className="text-xl font-bold mb-2">{billTo}</h3>
              <div className="text-sm opacity-90 space-y-1">
                {billToAddress && <p>{billToAddress}</p>}
                {(billToCity || billToPinCode) && (
                  <p>
                    {billToCity} {billToPinCode}
                  </p>
                )}
                {billToCountry && <p>{billToCountry}</p>}
              </div>
            </div>

            <div className="text-right">
              <div className="mb-6">
                <p className="text-xs font-bold uppercase opacity-60">Date</p>
                <p className="text-xl font-medium">{formattedInvoiceDate}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase opacity-60">Due</p>
                <p className="text-xl font-medium">{formattedDueDate}</p>
              </div>
            </div>
          </div>

          <div className="text-right mt-12">
            <p className="text-4xl font-bold">{formatCurrency(totalAmount)}</p>
            <p className="text-sm opacity-70">Total Due</p>
          </div>
        </div>

        {/* Main Content Left */}
        <div className="w-2/3 p-12 flex flex-col">
          <div className="mb-12">
            {logo && logo[0] ? (
              <img
                src={URL.createObjectURL(logo[0])}
                alt="Logo"
                className="max-h-20 mb-6"
              />
            ) : (
              <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 font-bold mb-6">
                LOGO
              </div>
            )}
            <h2 className="text-2xl font-bold text-slate-900">{yourName}</h2>
            <div className="text-sm text-slate-500 mt-2">
              {yourAddress && <p>{yourAddress}</p>}
              {(yourCity || yourPinCode) && (
                <p>
                  {yourCity} {yourPinCode}
                </p>
              )}
              {yourEmail && <p>{yourEmail}</p>}
            </div>
          </div>

          <div className="flex-grow">
            <table className="w-full mb-8">
              <thead>
                <tr className="text-left text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  <th className="py-3">Item</th>
                  <th className="py-3 text-right">Qty</th>
                  <th className="py-3 text-right">Price</th>
                  {taxMethod === "item_wise" && (
                    <th className="py-3 text-right">GST</th>
                  )}
                  <th className="py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {items.map((item: IInvoiceItem, index: number) => (
                  <tr key={index}>
                    <td className="py-4 text-sm font-medium">
                      {item.description}
                    </td>
                    <td className="py-4 text-sm text-right text-slate-500">
                      {item.qty}
                    </td>
                    <td className="py-4 text-sm text-right text-slate-500">
                      {formatCurrency(item.rate)}
                    </td>
                    {taxMethod === "item_wise" && (
                      <td className="py-4 text-sm text-right text-slate-500">
                        {item.gstRate || 0}%
                      </td>
                    )}
                    <td className="py-4 text-sm text-right font-bold">
                      {formatCurrency(item.qty * item.rate)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-slate-50 p-6 rounded-xl">
            <div className="flex justify-between mb-2 text-sm">
              <span className="text-slate-500">Subtotal</span>
              <span className="font-medium">{formatCurrency(subTotal)}</span>
            </div>
            {finalTaxAmount > 0 && (
              <>
                {taxType === "GST" && isIntraState(yourState, billToState) ? (
                  <>
                    <div className="flex justify-between mb-2 text-sm">
                      <span className="text-slate-500">
                        CGST ({taxRate / 2}%)
                      </span>
                      <span className="font-medium">
                        {isTaxInclusive ? "(incl.) " : ""}
                        {formatCurrency(finalTaxAmount / 2)}
                      </span>
                    </div>
                    <div className="flex justify-between mb-2 text-sm">
                      <span className="text-slate-500">
                        SGST ({taxRate / 2}%)
                      </span>
                      <span className="font-medium">
                        {isTaxInclusive ? "(incl.) " : ""}
                        {formatCurrency(finalTaxAmount / 2)}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between mb-2 text-sm">
                    <span className="text-slate-500">
                      {taxType === "GST" ? "IGST" : "Tax"} ({taxRate}%)
                    </span>
                    <span className="font-medium">
                      {isTaxInclusive ? "(incl.) " : ""}
                      {formatCurrency(finalTaxAmount)}
                    </span>
                  </div>
                )}
              </>
            )}
            <div className="flex justify-between pt-4 mt-2 border-t border-slate-200 text-lg font-bold">
              <span>Total</span>
              <span style={{ color }}>{formatCurrency(totalAmount)}</span>
            </div>
          </div>

          {notes && (
            <div className="mt-8 pt-8 border-t border-slate-100">
              <p className="text-sm font-bold text-slate-900 mb-2">Notes</p>
              <p className="text-sm text-slate-500">{notes}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- TEMPLATE: CLASSIC (Default) ---
  return (
    <div
      className="p-8 bg-white min-h-[1123px] w-[794px] mx-auto font-sans text-gray-800 
                        print:w-full print:h-auto print:min-h-screen print:p-8"
    >
      {/* ... (Existing Classic Template Code) ... */}
      {/* --- Header (Logo and Invoice Title) --- */}
      <header className="flex justify-between items-start mb-6">
        <div className="w-1/3">
          {logo && logo[0] ? (
            <img
              src={URL.createObjectURL(logo[0])}
              alt="Company Logo"
              className="max-h-16 max-w-full"
            />
          ) : (
            <PlaceholderLogo />
          )}
        </div>
        <div className="text-right">
          <h1 className="text-3xl font-bold text-black mb-1" style={{ color }}>
            TAX INVOICE
          </h1>
          <p className="text-lg text-gray-700">#{invoiceNumber}</p>
        </div>
      </header>

      {/* --- Sender and Recipient Info --- */}
      <div className="flex justify-between mb-8 text-sm print:break-after-avoid">
        <div className="w-1/3 space-y-1">
          <p className="font-semibold text-gray-900">{yourName}</p>
          {yourAddress && <p>{yourAddress}</p>}
          {(yourCity || yourPinCode) && (
            <p>
              {yourCity} {yourCity && yourPinCode ? "-" : ""} {yourPinCode}
            </p>
          )}
          {yourState && <p>{yourState}</p>}
          {yourCountry && <p>{yourCountry}</p>}
          {yourEmail && <p className="text-gray-700">{yourEmail}</p>}
          {yourPhone && <p className="text-gray-700">{yourPhone}</p>}
        </div>

        <div className="w-1/3 text-right">
          <p
            className="font-bold text-gray-700 text-base mb-1"
            style={{ color }}
          >
            Bill To
          </p>
          <p className="font-semibold">{billTo}</p>
          {billToAddress && <p>{billToAddress}</p>}
          {(billToCity || billToPinCode) && (
            <p>
              {billToCity} {billToPinCode && billToCity ? "-" : ""}{" "}
              {billToPinCode}
            </p>
          )}
          {billToState && <p>{billToState}</p>}
          {billToCountry && <p>{billToCountry}</p>}
          {billToEmail && <p className="text-gray-700">{billToEmail}</p>}
          {billToPhone && <p className="text-gray-700">{billToPhone}</p>}
        </div>
      </div>

      {/* --- Subject --- */}
      <div className="mb-8 print:break-after-avoid">
        <p className="font-bold text-gray-700 text-sm mb-1" style={{ color }}>
          Subject:
        </p>
        <p className="text-gray-900 font-medium whitespace-pre-wrap leading-tight">
          {invoiceSubject}
        </p>
      </div>

      {/* --- Items Table --- */}
      <div className="mb-8 border border-black">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 text-left text-sm font-semibold text-gray-700 border-b border-black print:break-inside-avoid">
              <th className="p-2 border-r border-black w-[5%] text-center">
                #
              </th>
              <th className="p-2 border-r border-black w-[55%]">
                Item & Description
              </th>
              <th className="p-2 border-r border-black w-[10%] text-right">
                Qty
              </th>
              <th className="p-2 border-r border-black w-[15%] text-right">
                Rate
              </th>
              {taxMethod === "item_wise" && (
                <th className="p-2 border-r border-black w-[10%] text-right">
                  GST
                </th>
              )}
              <th className="p-2 w-[15%] text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item: IInvoiceItem, index: number) => (
              <tr
                key={index}
                className="text-sm align-top border-b border-gray-300 last:border-b-0 print:break-inside-avoid"
              >
                <td className="p-2 border-r border-gray-300 text-center">
                  {index + 1}
                </td>
                <td className="p-2 border-r border-gray-300 whitespace-pre-wrap text-xs leading-snug">
                  {item.description}
                </td>
                <td className="p-2 border-r border-gray-300 text-right">
                  {item.qty.toFixed(2)}
                </td>
                <td className="p-2 border-r border-gray-300 text-right">
                  {formatCurrency(item.rate)}
                </td>
                {taxMethod === "item_wise" && (
                  <td className="p-2 border-r border-gray-300 text-right">
                    {item.gstRate || 0}%
                  </td>
                )}
                <td className="p-2 text-right">
                  {formatCurrency(item.qty * item.rate)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- Footer Details (Dates and Totals) --- */}
      <div className="print:break-before-auto print:break-inside-avoid">
        <div className="flex justify-between text-sm">
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

          <div className="w-1/3">
            <table className="min-w-full text-right text-sm">
              <tbody>
                <tr className="print:break-inside-avoid">
                  <td className="p-1 pr-0 font-semibold">Sub Total</td>
                  <td className="p-1 pl-0">{formatCurrency(subTotal)}</td>
                </tr>
                {discount > 0 && (
                  <tr className="print:break-inside-avoid">
                    <td className="p-1 pr-0 font-medium">
                      Discount ({discount}%)
                    </td>
                    <td className="p-1 pl-0 text-red-600">
                      - {formatCurrency(discountAmount)}
                    </td>
                  </tr>
                )}
                {finalTaxAmount > 0 && (
                  <>
                    {taxType === "GST" &&
                    isIntraState(yourState, billToState) ? (
                      <>
                        <tr className="print:break-inside-avoid">
                          <td className="p-1 pr-0 font-medium">
                            CGST ({taxRate / 2}%)
                          </td>
                          <td className="p-1 pl-0 text-green-600">
                            {isTaxInclusive ? "(incl.) " : "+ "}
                            {formatCurrency(finalTaxAmount / 2)}
                          </td>
                        </tr>
                        <tr className="print:break-inside-avoid">
                          <td className="p-1 pr-0 font-medium">
                            SGST ({taxRate / 2}%)
                          </td>
                          <td className="p-1 pl-0 text-green-600">
                            {isTaxInclusive ? "(incl.) " : "+ "}
                            {formatCurrency(finalTaxAmount / 2)}
                          </td>
                        </tr>
                      </>
                    ) : (
                      <tr className="print:break-inside-avoid">
                        <td className="p-1 pr-0 font-medium">
                          {taxType === "GST" ? "IGST" : taxTypeLabel || taxType}
                          {taxRate > 0 ? ` (${taxRate}%)` : ""}
                        </td>
                        <td
                          className={`p-1 pl-0 ${
                            taxType === "TDS"
                              ? "text-red-600"
                              : "text-green-600"
                          }`}
                        >
                          {taxType === "TDS"
                            ? "-"
                            : isTaxInclusive
                            ? "(incl.) "
                            : "+"}{" "}
                          {formatCurrency(finalTaxAmount)}
                        </td>
                      </tr>
                    )}
                  </>
                )}
                {finalAdjustment !== 0 && (
                  <tr className="print:break-inside-avoid">
                    <td className="p-1 pr-0 font-medium">
                      {adjustmentDescription}
                    </td>
                    <td
                      className={`p-1 pl-0 ${
                        finalAdjustment < 0 ? "text-red-600" : "text-green-600"
                      }`}
                    >
                      {finalAdjustment >= 0 ? "+" : ""}{" "}
                      {formatCurrency(finalAdjustment)}
                    </td>
                  </tr>
                )}
                <tr className="border-b border-t border-black print:break-inside-avoid">
                  <td className="p-1 pr-0 font-semibold">Total</td>
                  <td className="p-1 pl-0">{formatCurrency(totalAmount)}</td>
                </tr>
                <tr className="text-base font-bold print:break-inside-avoid">
                  <td className="p-1 pr-0">Balance Due</td>
                  <td className="p-1 pl-0">{formatCurrency(balanceDue)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-8 text-sm print:break-inside-avoid">
          <p className="font-medium text-gray-900">
            Total In Words:{" "}
            <span className="italic">{numberToWords(totalAmount)}</span>
          </p>
        </div>

        <div className="mt-6 print:break-inside-avoid">
          <p className="font-bold text-gray-700 text-sm mb-1" style={{ color }}>
            Notes
          </p>
          <p className="text-gray-600">{notes}</p>
        </div>

        <div className="mt-20 pt-1 text-right w-1/3 float-right print:break-inside-avoid">
          <p className="border-t border-black pt-1 text-sm font-semibold mb-1">
            {authorizedSignature}
          </p>
          <p className="text-xs text-gray-600">Authorized Signature</p>
        </div>
      </div>
    </div>
  );
};

export default InvoicePDF;
