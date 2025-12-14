// src/app/invoices/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getUserInvoices, deleteInvoice } from "@/lib/firestore";
import type { IInvoice } from "@/type/invoice";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  Plus,
  FileText,
  Trash2,
  MoreVertical,
  Download,
  Edit2,
  Send,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import SendInvoiceModal from "@/components/SendInvoiceModal";

export default function InvoicesPage() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<IInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendModalOpen, setSendModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<IInvoice | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchInvoices = async () => {
      if (user) {
        try {
          const data = await getUserInvoices(user.uid);
          setInvoices(data);
        } catch (error) {
          console.error("Error fetching invoices:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchInvoices();
  }, [user]);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this invoice?")) {
      try {
        await deleteInvoice(id);
        setInvoices(invoices.filter((inv) => inv.id !== id));
      } catch (error) {
        console.error("Error deleting invoice:", error);
      }
    }
  };

  const openSendModal = (invoice: IInvoice) => {
    setSelectedInvoice(invoice);
    setSendModalOpen(true);
  };

  const handleSendSuccess = async () => {
    // Refresh invoices to show updated status
    if (user) {
      const data = await getUserInvoices(user.uid);
      setInvoices(data);
    }
    setSendModalOpen(false);
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Invoices</h1>
              <p className="text-muted-foreground mt-1">
                Manage and track your invoices
              </p>
            </div>
            <Link href="/invoices/new">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Plus className="h-4 w-4 mr-2" />
                Create Invoice
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : invoices.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <div className="bg-primary/10 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-medium text-foreground">
                  No invoices yet
                </h3>
                <p className="text-muted-foreground mt-2 mb-6">
                  Create your first invoice to get started.
                </p>
                <Link href="/invoices/new">
                  <Button variant="outline">Create Invoice</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {invoices.map((invoice) => (
                <Card
                  key={invoice.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-indigo-100 p-3 rounded-lg">
                        <FileText className="h-6 w-6 text-indigo-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900">
                          {invoice.invoiceNumber}
                        </h4>
                        <p className="text-sm text-slate-500">
                          {invoice.billTo || "No Client"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-8">
                      <div className="text-right">
                        <p className="font-medium text-slate-900">
                          {new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: "USD",
                          }).format(invoice.totalAmount)}
                        </p>
                        <p className="text-sm text-slate-500">
                          {new Date(invoice.invoiceDate).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            invoice.status === "paid"
                              ? "bg-green-100 text-green-700"
                              : invoice.status === "sent"
                              ? "bg-blue-100 text-blue-700"
                              : invoice.status === "overdue"
                              ? "bg-red-100 text-red-700"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {invoice.status.charAt(0).toUpperCase() +
                            invoice.status.slice(1)}
                        </span>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            router.push(`/invoices/${invoice.id}/edit`)
                          }
                          className="text-slate-500 hover:text-indigo-600 hover:bg-indigo-50"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openSendModal(invoice)}
                          className="text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                        >
                          <Send className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(invoice.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {selectedInvoice && (
          <SendInvoiceModal
            isOpen={sendModalOpen}
            onClose={() => {
              setSendModalOpen(false);
              setSelectedInvoice(null);
            }}
            invoiceId={selectedInvoice.id}
            invoiceNumber={selectedInvoice.invoiceNumber}
            clientEmail={selectedInvoice.billToEmail}
          />
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
