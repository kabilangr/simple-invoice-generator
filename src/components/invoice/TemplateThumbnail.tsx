import React from "react";
import InvoicePDF from "../InvoicePDF";
import { IInvoiceFormData } from "@/type/invoice";

interface TemplateThumbnailProps {
  template: string;
  color: string;
  selected: boolean;
  onClick: () => void;
}

const dummyData: IInvoiceFormData = {
  yourName: "Your Company",
  yourEmail: "contact@company.com",
  yourAddress: "123 Business Rd",
  yourCity: "Cityville",
  yourState: "State",
  yourCountry: "Country",
  yourPinCode: 12345,
  yourPhone: "+1 234 567 890",
  billTo: "Client Name",
  billToEmail: "client@example.com",
  billToAddress: "456 Client St",
  billToCity: "Client City",
  billToState: "State",
  billToCountry: "Country",
  billToPinCode: 67890,
  billToPhone: "+1 987 654 321",
  invoiceSubject: "Project Services",
  invoiceNumber: "INV-001",
  invoiceDate: new Date().toISOString(),
  dueDate: new Date().toISOString(),
  terms: "Net 30",
  items: [
    { description: "Service A", qty: 1, rate: 1000, amount: 1000 },
    { description: "Service B", qty: 2, rate: 500, amount: 1000 },
  ],
  discount: 0,
  taxType: "None",
  taxTypeLabel: "",
  taxRate: 0,
  adjustmentDescription: "",
  adjustmentAmount: 0,
  subTotal: 2000,
  totalAmount: 2000,
  balanceDue: 2000,
  notes: "Thank you!",
  authorizedSignature: "",
};

export const TemplateThumbnail: React.FC<TemplateThumbnailProps> = ({
  template,
  color,
  selected,
  onClick,
}) => {
  return (
    <div
      className={`cursor-pointer group relative flex flex-col items-center gap-2 p-2 rounded-lg border-2 transition-all ${
        selected
          ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20"
          : "border-transparent hover:border-slate-200 dark:hover:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900"
      }`}
      onClick={onClick}
    >
      <div className="relative w-[180px] h-[254px] overflow-hidden rounded shadow-sm bg-white border border-slate-100">
        <div className="absolute top-0 left-0 origin-top-left transform scale-[0.226]">
          {/* 180px / 794px ≈ 0.226 */}
          <div className="pointer-events-none select-none">
            <InvoicePDF data={dummyData} template={template} color={color} />
          </div>
        </div>
        {/* Overlay to prevent interaction with PDF content and show hover effect */}
        <div
          className={`absolute inset-0 transition-colors ${
            selected ? "bg-indigo-900/0" : "group-hover:bg-black/5"
          }`}
        />
      </div>
      <span
        className={`text-xs font-medium capitalize ${
          selected ? "text-indigo-600" : "text-slate-600 dark:text-slate-400"
        }`}
      >
        {template}
      </span>

      {selected && (
        <div className="absolute top-3 right-3 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center shadow-md z-10">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-3.5 h-3.5 text-white"
          >
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
      )}
    </div>
  );
};
