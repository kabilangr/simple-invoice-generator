// src/components/InvoiceForm.tsx
"use client";
import React, {
  useRef,
  forwardRef,
  type ForwardedRef,
  useMemo,
  useEffect,
  useState,
} from "react";
import {
  useForm,
  useFieldArray,
  useWatch,
  SubmitHandler,
} from "react-hook-form";
import { useReactToPrint } from "react-to-print";
import InvoicePDF from "./InvoicePDF";
import { useAuth } from "@/context/AuthContext";
import { useCompany } from "@/context/CompanyContext";
import {
  getUserProfile,
  saveInvoice,
  checkUsageLimit,
  decrementCredits,
  getNextInvoiceNumber,
} from "@/lib/firestore";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Printer, Eye, EyeOff } from "lucide-react";
import PricingModal from "@/components/PricingModal";

import type { IInvoiceFormData } from "../type/invoice";
import { InvoiceFormHeader } from "./invoice/InvoiceFormHeader";
import { InvoiceItems } from "./invoice/InvoiceItems";
import { InvoiceTotals } from "./invoice/InvoiceTotals";
import { InvoiceFooter } from "./invoice/InvoiceFooter";
import { TemplateThumbnail } from "./invoice/TemplateThumbnail";
import { TemplateSelectionModal } from "./invoice/TemplateSelectionModal";

const defaultValues: IInvoiceFormData = {
  // Your Info
  yourName: "",
  yourState: "",
  yourCountry: "",
  yourEmail: "",
  yourAddress: "",
  yourCity: "",
  yourPinCode: null,
  yourPhone: "",
  // Client Info
  billTo: "",
  billToEmail: "",
  billToAddress: "",
  billToCity: "",
  billToState: "",
  billToCountry: "",
  billToPinCode: null,
  billToPhone: "",
  // Invoice Details
  invoiceSubject: "",
  invoiceNumber: "INV-000001",
  invoiceDate: new Date().toISOString().split("T")[0],
  terms: "Due on Receipt",
  dueDate: "",
  // Items
  items: [],
  discount: 0, // 0%
  taxType: "None", // Default to 'None'
  taxTypeLabel: "No Tax", // Default label
  taxRate: 0, // 0%
  adjustmentDescription: "Adjustment", // Default label
  adjustmentAmount: 0,
  // Totals (Initial values)
  subTotal: 0,
  totalAmount: 0,
  balanceDue: 0,
  // Footer/Notes
  notes: "Thanks for your business.",
  authorizedSignature: "",
  logo: undefined,
  taxInclusive: false,
};

// --- Main Form Component ---
const InvoiceForm: React.FC<{
  initialData?: IInvoiceFormData;
  invoiceId?: string;
}> = ({ initialData, invoiceId }) => {
  const [isPdfPreviewOpen, setIsPdfPreviewOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [template, setTemplate] = useState<
    | "classic"
    | "minimal"
    | "bold"
    | "modern"
    | "professional"
    | "elegant"
    | "tech"
    | "creative"
  >((initialData?.template as any) || "classic");
  const [color, setColor] = useState(initialData?.color || "#4f46e5");
  const [dataSource, setDataSource] = useState<
    "profile" | "company" | "custom"
  >("company");
  const [dataLoaded, setDataLoaded] = useState(false);
  const { user } = useAuth();
  const { selectedCompany } = useCompany();

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<IInvoiceFormData>({
    defaultValues: initialData || defaultValues,
    mode: "onChange",
  });

  // Load data based on selected source (skip if editing)
  useEffect(() => {
    if (initialData) {
      setDataLoaded(true);
      return;
    }
    const loadData = async () => {
      if (!user) return;

      try {
        // Auto-increment invoice number if creating new
        if (!initialData && !invoiceId) {
          const nextNum = await getNextInvoiceNumber(user.uid);
          setValue("invoiceNumber", nextNum);
        }

        if (dataSource === "profile") {
          // Load user profile data
          const profile = await getUserProfile(user.uid);
          if (profile) {
            setValue("yourName", profile.fullName);
            setValue("yourEmail", profile.email);
            setValue("yourPhone", profile.phone);
            setValue("yourAddress", "");
            setValue("yourCity", "");
            setValue("yourState", "");
            setValue("yourCountry", "");
            setValue("yourPinCode", null);
            setDataLoaded(true);
          }
        } else if (dataSource === "company" && selectedCompany) {
          // Load company data
          setValue("yourName", selectedCompany.companyName);
          setValue("yourEmail", selectedCompany.email);
          setValue("yourPhone", selectedCompany.phone);
          setValue("yourAddress", selectedCompany.address);
          setValue("yourCity", selectedCompany.city);
          setValue("yourState", selectedCompany.state);
          setValue("yourCountry", selectedCompany.country);
          setValue(
            "yourPinCode",
            selectedCompany.pinCode ? parseInt(selectedCompany.pinCode) : null
          );
          setDataLoaded(true);
        } else if (dataSource === "custom") {
          // Clear fields for custom entry
          // We might want to keep existing values if switching TO custom, but for now let's clear or keep as is.
          // Actually, clearing might be annoying. Let's just enable editing.
          setDataLoaded(true);
        }
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };

    loadData();
  }, [user, dataSource, selectedCompany, setValue, initialData, invoiceId]);

  const formData = watch();

  const watchedValues = useWatch({
    control,
    name: [
      "items",
      "discount",
      "taxType",
      "taxRate",
      "adjustmentAmount",
      "taxMethod",
      "taxInclusive",
    ],
  });

  const [
    watchedItems,
    watchedDiscount,
    watchedTaxType,
    watchedTaxRate,
    watchedAdjustmentAmount,
    watchedTaxMethod,
    watchedTaxInclusive,
  ] = watchedValues;

  const { subTotal, totalAmount, balanceDue, taxAmount } = useMemo(() => {
    const calculatedSubTotal =
      formData.items?.reduce(
        (sum, item) => sum + (item.qty * item.rate || 0),
        0
      ) || 0;

    const discountAmount = calculatedSubTotal * (formData.discount / 100);
    const amountAfterDiscount = calculatedSubTotal - discountAmount;

    let calculatedTaxAmount = 0;

    const isTaxInclusive = formData.taxInclusive && formData.taxType === "GST";

    if (formData.taxType !== "None") {
      if (formData.taxType === "GST" && formData.taxMethod === "item_wise") {
        // Calculate per-item tax
        calculatedTaxAmount =
          formData.items?.reduce((sum, item) => {
            const itemAmount = item.qty * item.rate || 0;
            const gst = item.gstRate || 0;
            if (isTaxInclusive) {
              // Back-calculate tax: Tax = Amount - (Amount / (1 + Rate/100))
              // Amount = Base + Tax = Base * (1 + Rate/100)
              // Base = Amount / (1 + Rate/100)
              // Tax = Amount - Base
              const baseAmount = itemAmount / (1 + gst / 100);
              return sum + (itemAmount - baseAmount);
            }
            return sum + itemAmount * (gst / 100);
          }, 0) || 0;
      } else if (formData.taxRate > 0) {
        // Global tax calculation
        if (isTaxInclusive) {
          const baseAmount = amountAfterDiscount / (1 + formData.taxRate / 100);
          calculatedTaxAmount = amountAfterDiscount - baseAmount;
        } else {
          calculatedTaxAmount = amountAfterDiscount * (formData.taxRate / 100);
        }
      }
    }

    const adjustment = formData.adjustmentAmount || 0;

    // Determine if tax should be added or subtracted
    // GST and TCS are added. TDS is subtracted.
    const isTaxDeducted = formData.taxType === "TDS";

    let calculatedTotalAmount = 0;

    if (isTaxInclusive) {
      // If inclusive, the SubTotal (amountAfterDiscount) already includes tax.
      // So Total = SubTotal + Adjustment
      calculatedTotalAmount = amountAfterDiscount + adjustment;
      // However, for display purposes, usually SubTotal should be exclusive?
      // But here 'subTotal' is sum of (qty * rate). If rate is inclusive, subTotal is inclusive.
      // So we keep subTotal as inclusive sum.
    } else {
      calculatedTotalAmount = isTaxDeducted
        ? amountAfterDiscount - calculatedTaxAmount + adjustment
        : amountAfterDiscount + calculatedTaxAmount + adjustment;
    }

    return {
      subTotal: calculatedSubTotal,
      totalAmount: calculatedTotalAmount,
      balanceDue: calculatedTotalAmount,
      taxAmount: calculatedTaxAmount,
    };
  }, [
    watchedItems,
    watchedDiscount,
    watchedTaxType,
    watchedTaxRate,
    watchedAdjustmentAmount,
    watchedTaxMethod,
    formData.items,
    formData.discount,
    formData.taxType,
    formData.taxRate,
    formData.adjustmentAmount,
    formData.taxMethod,
    formData.taxInclusive,
  ]);

  formData.subTotal = subTotal;
  formData.totalAmount = totalAmount;
  formData.balanceDue = balanceDue;
  formData.taxAmount = taxAmount;

  const componentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Invoice ${formData.invoiceNumber}`,
  });

  const [saving, setSaving] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [currentCredits, setCurrentCredits] = useState(0);
  const router = useRouter();

  const checkLimits = async (): Promise<boolean> => {
    if (!user) return false;
    const status = await checkUsageLimit(user.uid);
    if (!status.allowed) {
      // Fetch current credits to show in modal
      const profile = await getUserProfile(user.uid);
      setCurrentCredits(profile?.credits || 0);
      setShowPricingModal(true);
      return false;
    }
    return true;
  };

  const onSave: SubmitHandler<IInvoiceFormData> = async (data) => {
    if (!user) return;

    setSaving(true);
    try {
      const allowed = await checkLimits();
      if (!allowed) {
        setSaving(false);
        return;
      }

      const finalData = {
        ...data,
        subTotal,
        totalAmount,
        balanceDue,
        status: "draft" as const,
        template, // Save template
        color, // Save color
      };

      if (invoiceId) {
        // Update existing invoice
        await saveInvoice(user.uid, finalData, invoiceId);
        router.push("/invoices");
      } else {
        // Create new invoice
        await saveInvoice(user.uid, finalData);
        await decrementCredits(user.uid); // Deduct credit only for new invoices
        router.push("/invoices");
      }
    } catch (error) {
      console.error("Error saving invoice:", error);
      alert("Failed to save invoice");
    } finally {
      setSaving(false);
    }
  };

  const onSubmit: SubmitHandler<IInvoiceFormData> = async (data) => {
    if (!user) return;

    const allowed = await checkLimits();
    if (!allowed) return;

    setSaving(true);
    try {
      const finalData = {
        ...data,
        subTotal,
        totalAmount,
        balanceDue,
        status: "sent" as const, // Mark as sent/finalized when printing
        template,
        color,
      };

      // Save the invoice first
      if (invoiceId) {
        await saveInvoice(user.uid, finalData, invoiceId);
      } else {
        await saveInvoice(user.uid, finalData);
        await decrementCredits(user.uid);
      }

      // Then print
      handlePrint();

      // Optional: Redirect or refresh?
      // If we redirect, the print dialog might get interrupted or context lost.
      // Better to just save and let them stay or manually go back.
      // But user might expect it to be "saved" in the list.
    } catch (error) {
      console.error("Error saving invoice:", error);
      alert("Failed to save invoice");
    } finally {
      setSaving(false);
    }
  };

  const PrintableInvoice = forwardRef(
    (
      props: { data: IInvoiceFormData; template: string; color: string },
      ref: ForwardedRef<HTMLDivElement>
    ) => (
      <div ref={ref}>
        <InvoicePDF {...props} />
      </div>
    )
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-50/5">
      {/* --- Form Section --- */}
      <div className="container mx-auto p-6 max-w-7xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Header & Client Info */}
          <InvoiceFormHeader
            register={register}
            errors={errors}
            setValue={setValue}
            control={control}
            dataSource={dataSource}
            setDataSource={setDataSource}
          />

          {/* Items */}
          <InvoiceItems
            control={control}
            register={register}
            watch={watch}
            setValue={setValue}
            errors={errors}
          />

          {/* Totals */}
          <InvoiceTotals
            register={register}
            setValue={setValue}
            control={control}
            subTotal={subTotal}
            totalAmount={totalAmount}
            taxAmount={taxAmount}
          />

          {/* Footer */}
          <InvoiceFooter register={register} />

          {/* Template Selection */}
          {/* Template Selection Modal Trigger */}
          <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-white border shadow-sm flex items-center justify-center overflow-hidden">
                <div className="w-full h-full transform scale-50 origin-center">
                  {/* Mini preview icon or just a color block */}
                  <div
                    className="w-full h-full"
                    style={{ backgroundColor: color }}
                  ></div>
                </div>
              </div>
              <div>
                <p className="font-medium text-sm">
                  Current Design: <span className="capitalize">{template}</span>
                </p>
                <p className="text-xs text-slate-500">Color: {color}</p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsTemplateModalOpen(true)}
            >
              Customize Design
            </Button>
          </div>

          <TemplateSelectionModal
            isOpen={isTemplateModalOpen}
            onClose={() => setIsTemplateModalOpen(false)}
            selectedTemplate={template}
            onSelectTemplate={(t) => setTemplate(t as any)}
            selectedColor={color}
            onSelectColor={setColor}
          />

          {/* Actions */}
          <div className="flex flex-col sm:flex-row justify-end gap-4 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsPdfPreviewOpen(true)}
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              Preview PDF
            </Button>

            <Button
              type="button"
              onClick={handleSubmit(onSave)}
              disabled={saving}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700"
            >
              {saving ? "Saving..." : "Save Invoice"}
            </Button>

            <Button
              type="submit"
              variant="secondary"
              className="flex items-center gap-2"
            >
              <Printer className="h-4 w-4" />
              Print / Download
            </Button>
          </div>
        </form>

        {/* PDF Preview Modal */}
        {isPdfPreviewOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
              <div className="flex justify-between items-center p-4 border-b dark:border-slate-800">
                <h3 className="text-lg font-semibold text-foreground">
                  Invoice Preview
                </h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsPdfPreviewOpen(false)}
                >
                  <EyeOff className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex-1 overflow-auto p-8 bg-gray-100 dark:bg-slate-950">
                <div
                  className="bg-white shadow-lg mx-auto"
                  style={{ width: "210mm", minHeight: "297mm" }}
                >
                  <PrintableInvoice
                    ref={componentRef}
                    data={formData}
                    template={template}
                    color={color}
                  />
                </div>
              </div>
              <div className="p-4 border-t flex justify-end gap-4">
                <Button
                  variant="outline"
                  onClick={() => setIsPdfPreviewOpen(false)}
                >
                  Close
                </Button>
                <Button onClick={handlePrint}>
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Hidden Printable Component */}
        <div style={{ display: "none" }}>
          <PrintableInvoice
            ref={componentRef}
            data={formData}
            template={template}
            color={color}
          />
        </div>

        <PricingModal
          isOpen={showPricingModal}
          onClose={() => setShowPricingModal(false)}
          onSuccess={() => {
            // Retry the action that triggered the modal?
            // For now just close, user clicks save again.
            setShowPricingModal(false);
          }}
          currentCredits={currentCredits}
        />
      </div>
    </div>
  );
};

export default InvoiceForm;
