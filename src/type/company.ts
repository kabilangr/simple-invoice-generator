// src/type/company.ts

export interface ICompany {
    id: string;
    userId: string;
    companyName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    country: string;
    pinCode: string;
    website?: string;
    taxId?: string;
    logo?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface ICompanyFormData {
    companyName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    country: string;
    pinCode: string;
    website?: string;
    taxId?: string;
    logo?: FileList;
}
