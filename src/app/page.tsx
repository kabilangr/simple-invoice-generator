'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import InvoiceForm from "@/components/InvoiceForm";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { useCompany } from "@/context/CompanyContext";
import { isProfileComplete, hasCompanies } from "@/lib/firestore";

export default function Home() {
  const { user, signOut } = useAuth();
  const { companies, selectedCompany, selectCompany } = useCompany();
  const router = useRouter();
  const [profileComplete, setProfileComplete] = useState<boolean | null>(null);
  const [userHasCompanies, setUserHasCompanies] = useState<boolean | null>(null);
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
          }
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
      <ProtectedRoute>
        <div className="flex min-h-screen items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="">
        {/* Header with Sign Out */}
        <header className="bg-white shadow-sm">
          <div className="container mx-auto px-8 py-4 flex justify-between items-center">
            <h1 className="text-xl font-semibold text-gray-800">Invoice Generator</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{user?.email || user?.phoneNumber}</span>

              {/* Company Selector Dropdown */}
              {companies.length > 0 && (
                <div className="relative">
                  <select
                    value={selectedCompany?.id || ''}
                    onChange={(e) => selectCompany(e.target.value)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Company</option>
                    {companies.map((company) => (
                      <option key={company.id} value={company.id}>
                        {company.companyName}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <button
                onClick={() => router.push('/companies')}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
              >
                Manage Companies
              </button>

              <button
                onClick={() => router.push('/profile')}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
              >
                Profile
              </button>
              <button
                onClick={() => signOut()}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Sign Out
              </button>
            </div>
          </div>
        </header>

        <main className="">
          <InvoiceForm />
        </main>
        <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        </footer>
      </div>
    </ProtectedRoute>
  );
}
