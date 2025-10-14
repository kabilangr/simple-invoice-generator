


export interface IInvoiceItem {
    description: string;
    qty: number;
    rate: number;
    amount: number;
}

export type TaxType = 'None' | 'TDS' | 'TCS';


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
    adjustmentDescription: string;
    adjustmentAmount: number;

    subTotal: number;
    totalAmount: number;
    balanceDue: number;

    notes: string;
    authorizedSignature: string;
    logo?: FileList;
}


export interface IInvoicePDFProps {
    data: IInvoiceFormData;
}