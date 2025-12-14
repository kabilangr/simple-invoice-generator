// src/app/clients/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getUserClients, saveClient, deleteClient } from '@/lib/firestore';
import type { IClient } from '@/type/client';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { Plus, Users, Trash2, Edit2, X, MapPin, Phone, Mail } from 'lucide-react';
import { useForm } from 'react-hook-form';

interface IClientForm {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    country: string;
    pinCode: string;
    vatId?: string;
}

export default function ClientsPage() {
    const { user } = useAuth();
    const [clients, setClients] = useState<IClient[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClient, setEditingClient] = useState<IClient | null>(null);

    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<IClientForm>();

    useEffect(() => {
        fetchClients();
    }, [user]);

    const fetchClients = async () => {
        if (user) {
            try {
                const data = await getUserClients(user.uid);
                setClients(data);
            } catch (error) {
                console.error("Error fetching clients:", error);
            } finally {
                setLoading(false);
            }
        }
    };

    const onSubmit = async (data: IClientForm) => {
        if (!user) return;
        try {
            await saveClient(user.uid, data, editingClient?.id);
            await fetchClients();
            closeModal();
        } catch (error) {
            console.error("Error saving client:", error);
            alert("Failed to save client");
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this client?')) {
            try {
                await deleteClient(id);
                setClients(clients.filter(c => c.id !== id));
            } catch (error) {
                console.error("Error deleting client:", error);
            }
        }
    };

    const openModal = (client?: IClient) => {
        if (client) {
            setEditingClient(client);
            setValue('name', client.name);
            setValue('email', client.email);
            setValue('phone', client.phone);
            setValue('address', client.address);
            setValue('city', client.city);
            setValue('state', client.state);
            setValue('country', client.country);
            setValue('pinCode', client.pinCode);
            setValue('vatId', client.vatId);
        } else {
            setEditingClient(null);
            reset();
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingClient(null);
        reset();
    };

    return (
        <ProtectedRoute>
            <DashboardLayout>
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-foreground">Clients</h1>
                            <p className="text-muted-foreground mt-1">Manage your client relationships</p>
                        </div>
                        <Button onClick={() => openModal()} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Client
                        </Button>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : clients.length === 0 ? (
                        <Card className="text-center py-12">
                            <CardContent>
                                <div className="bg-primary/10 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Users className="h-8 w-8 text-primary" />
                                </div>
                                <h3 className="text-lg font-medium text-foreground">No clients yet</h3>
                                <p className="text-muted-foreground mt-2 mb-6">Add clients to quickly create invoices for them.</p>
                                <Button variant="outline" onClick={() => openModal()}>Add Your First Client</Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {clients.map((client) => (
                                <Card key={client.id} className="hover:shadow-md transition-shadow">
                                    <CardContent className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="bg-primary/10 p-2 rounded-lg">
                                                <Users className="h-5 w-5 text-primary" />
                                            </div>
                                            <div className="flex gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => openModal(client)} className="h-8 w-8 text-muted-foreground hover:text-primary">
                                                    <Edit2 className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => handleDelete(client.id)} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                        <h4 className="font-semibold text-foreground mb-1">{client.name}</h4>
                                        <div className="space-y-2 mt-4">
                                            <div className="flex items-center text-sm text-muted-foreground">
                                                <Mail className="h-4 w-4 mr-2" />
                                                {client.email}
                                            </div>
                                            <div className="flex items-center text-sm text-muted-foreground">
                                                <Phone className="h-4 w-4 mr-2" />
                                                {client.phone}
                                            </div>
                                            <div className="flex items-start text-sm text-muted-foreground">
                                                <MapPin className="h-4 w-4 mr-2 mt-0.5" />
                                                <span>{client.city}, {client.country}</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>

                {/* Add/Edit Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                        <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b border-border flex justify-between items-center sticky top-0 bg-card z-10">
                                <h2 className="text-xl font-bold text-foreground">
                                    {editingClient ? 'Edit Client' : 'Add New Client'}
                                </h2>
                                <Button variant="ghost" size="icon" onClick={closeModal}>
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>
                            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input
                                        label="Client Name"
                                        {...register('name', { required: 'Name is required' })}
                                        error={errors.name?.message}
                                        placeholder="Company or Person Name"
                                    />
                                    <Input
                                        label="Email"
                                        type="email"
                                        {...register('email', { required: 'Email is required' })}
                                        error={errors.email?.message}
                                        placeholder="client@example.com"
                                    />
                                    <Input
                                        label="Phone"
                                        {...register('phone')}
                                        placeholder="+1 234 567 890"
                                    />
                                    <Input
                                        label="VAT / Tax ID"
                                        {...register('vatId')}
                                        placeholder="Optional"
                                    />
                                </div>
                                
                                <div className="border-t border-border pt-4 mt-2">
                                    <h3 className="text-sm font-medium text-foreground mb-3">Address Details</h3>
                                    <div className="space-y-4">
                                        <Input
                                            label="Street Address"
                                            {...register('address')}
                                            placeholder="123 Business Rd"
                                        />
                                        <div className="grid grid-cols-2 gap-4">
                                            <Input
                                                label="City"
                                                {...register('city')}
                                                placeholder="City"
                                            />
                                            <Input
                                                label="State / Province"
                                                {...register('state')}
                                                placeholder="State"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <Input
                                                label="Country"
                                                {...register('country')}
                                                placeholder="Country"
                                            />
                                            <Input
                                                label="Postal Code"
                                                {...register('pinCode')}
                                                placeholder="Zip Code"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 flex justify-end gap-3 border-t border-border mt-4">
                                    <Button type="button" variant="outline" onClick={closeModal}>Cancel</Button>
                                    <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                                        {editingClient ? 'Update Client' : 'Save Client'}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </DashboardLayout>
        </ProtectedRoute>
    );
}
