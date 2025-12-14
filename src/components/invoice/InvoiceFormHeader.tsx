import React, { useState, useEffect, useRef } from 'react';
import { UseFormRegister, FieldErrors, UseFormSetValue, Control, useWatch } from 'react-hook-form';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { IInvoiceFormData } from '@/type/invoice';
import { useCompany } from '@/context/CompanyContext';
import { useAuth } from '@/context/AuthContext';
import { getUserClients } from '@/lib/firestore';
import type { IClient } from '@/type/client';
import { Search } from 'lucide-react';

interface InvoiceFormHeaderProps {
  register: UseFormRegister<IInvoiceFormData>;
  errors: FieldErrors<IInvoiceFormData>;
  setValue: UseFormSetValue<IInvoiceFormData>;
  control: Control<IInvoiceFormData>;
  dataSource: 'profile' | 'company' | 'custom';
  setDataSource: (source: 'profile' | 'company' | 'custom') => void;
}

export const InvoiceFormHeader: React.FC<InvoiceFormHeaderProps> = ({ 
  register, 
  errors, 
  setValue,
  dataSource, 
  setDataSource,
  control 
}) => {
  const { selectedCompany } = useCompany();
  const { user } = useAuth();
  const [clients, setClients] = useState<IClient[]>([]);
  const [showClientSuggestions, setShowClientSuggestions] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      getUserClients(user.uid).then(setClients).catch(console.error);
    }
  }, [user]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowClientSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  const handleClientSelect = (client: IClient) => {
    setValue('billTo', client.name);
    setValue('billToEmail', client.email);
    setValue('billToAddress', client.address);
    setValue('billToCity', client.city);
    setValue('billToState', client.state);
    setValue('billToCountry', client.country);
    setValue('billToPinCode', client.pinCode ? parseInt(client.pinCode) : null);
    setValue('billToPhone', client.phone);
    setShowClientSuggestions(false);
  };

  const filterClients = (query: string) => {
    if (!query) return clients;
    return clients.filter(c => 
      c.name.toLowerCase().includes(query.toLowerCase())
    );
  };

  // Watch billTo field for search
  const billToValue = useWatch({
    control,
    name: 'billTo',
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Your Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">From</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Data Source Selection */}
          <div className="flex flex-wrap gap-4 p-3 bg-slate-50 dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800">
             <label className="flex items-center text-sm cursor-pointer text-foreground">
                <input
                    type="radio"
                    checked={dataSource === 'profile'}
                    onChange={() => setDataSource('profile')}
                    className="mr-2 text-indigo-600 focus:ring-indigo-500"
                />
                My Profile
             </label>
             <label className="flex items-center text-sm cursor-pointer text-foreground">
                <input
                    type="radio"
                    checked={dataSource === 'company'}
                    onChange={() => setDataSource('company')}
                    className="mr-2 text-indigo-600 focus:ring-indigo-500"
                />
                Company
             </label>
             <label className="flex items-center text-sm cursor-pointer text-foreground">
                <input
                    type="radio"
                    checked={dataSource === 'custom'}
                    onChange={() => setDataSource('custom')}
                    className="mr-2 text-indigo-600 focus:ring-indigo-500"
                />
                Custom
             </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Name"
              {...register("yourName", { required: "Name is required" })}
              error={errors.yourName?.message}
              disabled={dataSource !== 'custom'}
            />
            <Input
              label="Email"
              type="email"
              {...register("yourEmail")}
              error={errors.yourEmail?.message}
              disabled={dataSource !== 'custom'}
            />
            <Input
              label="Address"
              {...register("yourAddress")}
              disabled={dataSource !== 'custom'}
            />
            <Input
              label="City"
              {...register("yourCity")}
              disabled={dataSource !== 'custom'}
            />
            <Input
              label="State"
              {...register("yourState")}
              disabled={dataSource !== 'custom'}
            />
            <Input
              label="Country"
              {...register("yourCountry")}
              disabled={dataSource !== 'custom'}
            />
            <Input
              label="Pin Code"
              type="number"
              {...register("yourPinCode")}
              disabled={dataSource !== 'custom'}
              className="input-number-no-step"
            />
            <Input
              label="Phone"
              {...register("yourPhone")}
              disabled={dataSource !== 'custom'}
            />
          </div>
        </CardContent>
      </Card>

      {/* Client Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Bill To</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4" ref={wrapperRef}>
            <div className="relative">
                <Input
                label="Client Name"
                {...register("billTo", { required: "Client Name is required" })}
                error={errors.billTo?.message}
                onFocus={() => setShowClientSuggestions(true)}
                autoComplete="off"
                />
                {showClientSuggestions && (
                    <div className="absolute z-10 w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-md shadow-lg mt-1 max-h-48 overflow-y-auto">
                        {filterClients(billToValue || '').length > 0 ? (
                            filterClients(billToValue || '').map(client => (
                                <div
                                    key={client.id}
                                    className="px-4 py-2 hover:bg-indigo-50 dark:hover:bg-slate-800 cursor-pointer text-sm"
                                    onClick={() => handleClientSelect(client)}
                                >
                                    <div className="font-medium text-foreground">{client.name}</div>
                                    <div className="text-xs text-muted-foreground">{client.email}</div>
                                </div>
                            ))
                        ) : (
                            <div className="px-4 py-2 text-sm text-muted-foreground">No clients found</div>
                        )}
                    </div>
                )}
            </div>
            <Input
              label="Client Email"
              type="email"
              {...register("billToEmail")}
              error={errors.billToEmail?.message}
            />
            <Input
              label="Address"
              {...register("billToAddress")}
            />
            <Input
              label="City"
              {...register("billToCity")}
            />
            <Input
              label="State"
              {...register("billToState")}
            />
            <Input
              label="Country"
              {...register("billToCountry")}
            />
            <Input
              label="Pin Code"
              type="number"
              {...register("billToPinCode")}
              className="input-number-no-step"
            />
            <Input
              label="Phone"
              {...register("billToPhone")}
            />
          </div>
        </CardContent>
      </Card>
      
      {/* Invoice Details - Full Width */}
      <Card className="lg:col-span-2">
        <CardHeader>
            <CardTitle className="text-lg">Invoice Details</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Input
                    label="Invoice Number"
                    {...register("invoiceNumber", { required: "Invoice # is required" })}
                    error={errors.invoiceNumber?.message}
                />
                <Input
                    label="Invoice Date"
                    type="date"
                    {...register("invoiceDate")}
                />
                <Input
                    label="Due Date"
                    type="date"
                    {...register("dueDate")}
                />
                <Input
                    label="Payment Terms"
                    {...register("terms")}
                />
                <div className="md:col-span-4">
                    <Input
                        label="Subject"
                        {...register("invoiceSubject")}
                    />
                </div>
            </div>
        </CardContent>
      </Card>
    </div>
  );
};
