'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { X, Send } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { saveInvoice } from '@/lib/firestore';

interface SendInvoiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    invoiceId: string;
    invoiceNumber: string;
    clientEmail?: string;
}

const SendInvoiceModal: React.FC<SendInvoiceModalProps> = ({ 
    isOpen, 
    onClose, 
    invoiceId, 
    invoiceNumber,
    clientEmail 
}) => {
    const { user } = useAuth();
    const [email, setEmail] = useState(clientEmail || '');
    const [subject, setSubject] = useState(`Invoice ${invoiceNumber}`);
    const [message, setMessage] = useState(`Please find attached invoice ${invoiceNumber} for your review.`);
    const [sending, setSending] = useState(false);

    if (!isOpen) return null;

    const handleSend = async () => {
        if (!user || !email) return;
        setSending(true);

        // Mock email sending delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        try {
            // Update invoice status to 'sent'
            // We need to fetch the full invoice first, then update it
            const { getInvoice } = await import('@/lib/firestore');
            const currentInvoice = await getInvoice(invoiceId);
            if (currentInvoice) {
                await saveInvoice(user.uid, { ...currentInvoice, status: 'sent' as const }, invoiceId);
            }
            
            // In a real app, you would call an email API here
            console.log('Sending invoice:', { email, subject, message, invoiceId });
            
            alert(`Invoice sent successfully to ${email}!`);
            onClose();
        } catch (error) {
            console.error("Failed to send invoice:", error);
            alert("Failed to send invoice. Please try again.");
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="p-6 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-900">Send Invoice</h2>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="h-5 w-5" />
                    </Button>
                </div>
                
                <div className="p-6 space-y-4">
                    <Input
                        label="Recipient Email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="client@example.com"
                        required
                    />
                    
                    <Input
                        label="Subject"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Invoice subject"
                    />
                    
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Message</label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            rows={4}
                            placeholder="Email message..."
                        />
                    </div>
                </div>
                
                <div className="p-6 bg-slate-50 flex justify-end gap-3">
                    <Button variant="outline" onClick={onClose} disabled={sending}>
                        Cancel
                    </Button>
                    <Button 
                        className="bg-indigo-600 hover:bg-indigo-700"
                        onClick={handleSend}
                        disabled={sending || !email}
                    >
                        <Send className="h-4 w-4 mr-2" />
                        {sending ? 'Sending...' : 'Send Invoice'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default SendInvoiceModal;
