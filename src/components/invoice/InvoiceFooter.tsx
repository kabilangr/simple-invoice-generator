import React from 'react';
import { UseFormRegister } from 'react-hook-form';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { IInvoiceFormData } from '@/type/invoice';

interface InvoiceFooterProps {
  register: UseFormRegister<IInvoiceFormData>;
}

export const InvoiceFooter: React.FC<InvoiceFooterProps> = ({ register }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <textarea
            {...register("notes")}
            rows={4}
            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Add any notes..."
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Authorized Signature</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            label="Signatory Name"
            {...register("authorizedSignature")}
            placeholder="Name of authorized person"
          />
        </CardContent>
      </Card>
    </div>
  );
};
