'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { useCompany } from "@/context/CompanyContext";
import { isProfileComplete, hasCompanies, getUserInvoices } from "@/lib/firestore";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { IInvoice } from "@/type/invoice";
import { Button } from "@/components/ui/Button";
import { Plus } from "lucide-react";
import Link from "next/link";
import CustomSelect from "@/components/ui/CustomSelect";

export default function Home() {
  const { user, signOut } = useAuth();
  const { companies, selectedCompany, selectCompany } = useCompany();
  const router = useRouter();
  const [profileComplete, setProfileComplete] = useState<boolean | null>(null);
  const [userHasCompanies, setUserHasCompanies] = useState<boolean | null>(null);
  const [invoices, setInvoices] = useState<IInvoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkProfile = async () => {
      if (user) {
        try {
          const complete = await isProfileComplete(user.uid);
          setProfileComplete(complete);

          if (!complete) {
            router.push('/profile');
            return;
          }

          // Check if user has companies
          const hasComp = await hasCompanies(user.uid);
          setUserHasCompanies(hasComp);

          if (!hasComp) {
            router.push('/companies');
            return;
          }

          // Fetch invoices for analytics
          const invData = await getUserInvoices(user.uid);
          setInvoices(invData);

        } catch (error) {
          console.error('Error checking profile:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    checkProfile();
  }, [user, router]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
           <div>
              <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
              <p className="text-muted-foreground mt-1">Welcome back, {user?.displayName || 'User'}</p>
           </div>
           <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              {companies.length > 0 && (
                <div className="w-full sm:w-64">
                  <CustomSelect
                    value={selectedCompany ? { label: selectedCompany.companyName, value: selectedCompany.id } : null}
                    onChange={(option: any) => option && selectCompany(option.value)}
                    options={companies.map(c => ({ label: c.companyName, value: c.id }))}
                    placeholder="Select Company"
                    isSearchable={false}
                  />
                </div>
              )}
              <Link href="/invoices/new">
                  <Button className="bg-indigo-600 hover:bg-indigo-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Invoice
                  </Button>
              </Link>
           </div>
        </div>

        {/* Stats Cards */}
        <DashboardStats invoices={invoices} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Revenue Chart */}
            <div className="lg:col-span-2">
                <RevenueChart invoices={invoices} />
            </div>

            {/* Recent Activity */}
            <div>
                <RecentActivity invoices={invoices} />
            </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
