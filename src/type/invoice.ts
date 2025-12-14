export interface IInvoiceItem {
  description: string;
  qty: number;
  rate: number;
  amount: number;
  gstRate?: number; // GST Percentage
}

export type TaxType = "None" | "GST" | "TDS" | "TCS";

export interface IInvoiceFormData {
  yourName: string;
  yourState: string;
  yourCountry: string;
  yourEmail: string;
  yourAddress: string;
  yourCity: string;
  yourPinCode: number | null;
  yourPhone: string;

  billTo: string;
  billToEmail: string;
  billToAddress: string;
  billToCity: string;
  billToState: string;
  billToCountry: string;
  billToPinCode: number | null;
  billToPhone: string;

  invoiceSubject: string;
  invoiceNumber: string;
  invoiceDate: string;
  terms: string;
  dueDate: string;

  items: IInvoiceItem[];

  discount: number;
  taxType: TaxType;
  taxTypeLabel: string;
  taxRate: number;
  taxMethod?: "global" | "item_wise"; // New field
  taxInclusive?: boolean; // New field
  adjustmentDescription: string;
  adjustmentAmount: number;

  subTotal: number;
  totalAmount: number;
  balanceDue: number;
  taxAmount?: number;

  notes: string;
  authorizedSignature: string;
  logo?: FileList;
  template?: string;
  color?: string;
}

export interface IInvoice extends Omit<IInvoiceFormData, "logo"> {
  id: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  status: "draft" | "sent" | "paid" | "overdue";
  logoUrl?: string;
}

export interface IInvoicePDFProps {
  data: IInvoiceFormData;
  template?: string;
  color?: string;
}
