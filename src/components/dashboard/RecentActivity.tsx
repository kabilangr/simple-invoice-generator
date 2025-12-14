import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { IInvoice } from '@/type/invoice';
import { FileText, CheckCircle, Send, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface RecentActivityProps {
    invoices: IInvoice[];
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ invoices }) => {
    // Sort by updated date (most recent first) and take top 5
    const recentInvoices = [...invoices]
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 5);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'paid': return <CheckCircle className="h-4 w-4 text-green-600" />;
            case 'sent': return <Send className="h-4 w-4 text-blue-600" />;
            case 'overdue': return <AlertCircle className="h-4 w-4 text-red-600" />;
            default: return <FileText className="h-4 w-4 text-slate-600" />;
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'paid': return 'Payment received';
            case 'sent': return 'Invoice sent';
            case 'overdue': return 'Payment overdue';
            default: return 'Invoice created';
        }
    };

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {recentInvoices.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
                    ) : (
                        recentInvoices.map((invoice) => (
                            <div key={invoice.id} className="flex items-start gap-4">
                                <div className={`mt-1 p-2 rounded-full ${
                                    invoice.status === 'paid' ? 'bg-green-100' :
                                    invoice.status === 'sent' ? 'bg-blue-100' :
                                    invoice.status === 'overdue' ? 'bg-red-100' :
                                    'bg-slate-100'
                                }`}>
                                    {getStatusIcon(invoice.status)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-foreground">
                                        {getStatusText(invoice.status)}
                                    </p>
                                    <p className="text-xs text-muted-foreground truncate">
                                        {invoice.invoiceNumber} - {invoice.billTo}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-medium text-foreground">
                                        ${invoice.totalAmount.toLocaleString()}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {new Date(invoice.updatedAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
                
                {recentInvoices.length > 0 && (
                    <div className="mt-6 pt-4 border-t text-center">
                        <Link href="/invoices" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                            View all invoices
                        </Link>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
