import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { IInvoice } from '@/type/invoice';

interface RevenueChartProps {
    invoices: IInvoice[];
}

export const RevenueChart: React.FC<RevenueChartProps> = ({ invoices }) => {
    // Calculate monthly revenue for the last 6 months
    const getLast6Months = () => {
        const months = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            months.push(d);
        }
        return months;
    };

    const months = getLast6Months();
    const data = months.map(month => {
        const monthName = month.toLocaleString('default', { month: 'short' });
        const year = month.getFullYear();
        
        const monthlyTotal = invoices
            .filter(inv => {
                const invDate = new Date(inv.invoiceDate);
                return invDate.getMonth() === month.getMonth() && 
                       invDate.getFullYear() === year &&
                       inv.status === 'paid';
            })
            .reduce((sum, inv) => sum + inv.totalAmount, 0);
            
        return { name: monthName, value: monthlyTotal };
    });

    const maxVal = Math.max(...data.map(d => d.value), 1000); // Avoid division by zero

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Revenue Overview</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-64 flex items-end justify-between gap-2 mt-4">
                    {data.map((item, index) => (
                        <div key={index} className="flex flex-col items-center gap-2 flex-1 group">
                            <div className="relative w-full flex justify-center items-end h-full">
                                <div 
                                    className="w-full max-w-[40px] bg-indigo-600 rounded-t-md transition-all duration-500 hover:bg-indigo-500 relative group-hover:shadow-lg"
                                    style={{ height: `${(item.value / maxVal) * 100}%`, minHeight: '4px' }}
                                >
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                        ${item.value.toLocaleString()}
                                    </div>
                                </div>
                            </div>
                            <span className="text-xs font-medium text-slate-500">{item.name}</span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};
