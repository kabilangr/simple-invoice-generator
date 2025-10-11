


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

    billTo: string;

    invoiceSubject: string;
    invoiceNumber: string;
    invoiceDate: string;
    terms: string;
    dueDate: string;

    items: IInvoiceItem[];

    discount: number;
    taxType: TaxType;
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