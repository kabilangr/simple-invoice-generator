export interface IClient {
    id: string;
    userId: string;
    name: string;
    email: string;
    address: string;
    city: string;
    state: string;
    country: string;
    pinCode: string;
    phone: string;
    vatId?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IClientFormData {
    name: string;
    email: string;
    address: string;
    city: string;
    state: string;
    country: string;
    pinCode: string;
    phone: string;
    vatId?: string;
}
