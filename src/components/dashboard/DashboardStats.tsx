import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { DollarSign, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { IInvoice } from '@/type/invoice';

interface DashboardStatsProps {
    invoices: IInvoice[];
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ invoices }) => {
    const totalRevenue = invoices
        .filter(inv => inv.status === 'paid')
        .reduce((sum, inv) => sum + inv.totalAmount, 0);

    const outstandingAmount = invoices
        .filter(inv => inv.status === 'sent' || inv.status === 'overdue')
        .reduce((sum, inv) => sum + inv.totalAmount, 0);

    const paidInvoicesCount = invoices.filter(inv => inv.status === 'paid').length;
    const overdueInvoicesCount = invoices.filter(inv => inv.status === 'overdue').length;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const stats = [
        {
            label: 'Total Revenue',
            value: formatCurrency(totalRevenue),
            icon: DollarSign,
            color: 'text-green-600',
            bg: 'bg-green-100',
            desc: 'All time paid invoices'
        },
        {
            label: 'Outstanding',
            value: formatCurrency(outstandingAmount),
            icon: Clock,
            color: 'text-blue-600',
            bg: 'bg-blue-100',
            desc: 'Pending payments'
        },
        {
            label: 'Paid Invoices',
            value: paidInvoicesCount.toString(),
            icon: CheckCircle,
            color: 'text-indigo-600',
            bg: 'bg-indigo-100',
            desc: 'Total successful payments'
        },
        {
            label: 'Overdue',
            value: overdueInvoicesCount.toString(),
            icon: AlertCircle,
            color: 'text-red-600',
            bg: 'bg-red-100',
            desc: 'Invoices past due date'
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
                <Card key={index}>
                    <CardContent className="p-6">
                        <div className="flex items-start justify-between space-x-4 pt-6">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                                <h3 className="text-2xl font-bold text-foreground mt-2">{stat.value}</h3>
                            </div>
                            <div className={`p-3 rounded-full ${stat.bg} shrink-0`}>
                                <stat.icon className={`h-6 w-6 ${stat.color}`} />
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-4">{stat.desc}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};
