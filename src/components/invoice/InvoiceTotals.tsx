import React from "react";
import {
  UseFormRegister,
  UseFormSetValue,
  Control,
  useWatch,
} from "react-hook-form";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { IInvoiceFormData } from "@/type/invoice";

interface InvoiceTotalsProps {
  register: UseFormRegister<IInvoiceFormData>;
  setValue: UseFormSetValue<IInvoiceFormData>;
  control: Control<IInvoiceFormData>;
  subTotal: number;
  totalAmount: number;
  taxAmount: number;
}

import { isIntraState } from "@/lib/utils";

// ...

export const InvoiceTotals: React.FC<InvoiceTotalsProps> = ({
  register,
  setValue,
  control,
  subTotal,
  totalAmount,
  taxAmount,
}) => {
  const discount = useWatch({ control, name: "discount" }) || 0;
  const taxType = useWatch({ control, name: "taxType" });
  const taxMethod = useWatch({ control, name: "taxMethod" });
  const adjustmentAmount = useWatch({ control, name: "adjustmentAmount" }) || 0;
  const taxRate = useWatch({ control, name: "taxRate" }) || 0;
  const taxInclusive = useWatch({ control, name: "taxInclusive" });

  const yourState = useWatch({ control, name: "yourState" });
  const billToState = useWatch({ control, name: "billToState" });

  return (
    <div className="flex justify-end mt-6">
      <Card className="w-full lg:w-1/2 bg-slate-50 dark:bg-slate-900">
        <CardContent className="p-6 space-y-4">
          {/* Sub Total */}
          <div className="flex justify-between items-center text-lg font-medium text-foreground">
            <span>Sub Total</span>
            <span>{subTotal.toFixed(2)}</span>
          </div>

          {/* Discount */}
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-muted-foreground">
              Discount
            </label>
            <div className="flex items-center gap-2 w-1/2 justify-end">
              <div className="relative w-20">
                <Input
                  type="number"
                  step="0.01"
                  {...register("discount", {
                    valueAsNumber: true,
                    min: 0,
                    max: 100,
                  })}
                  className="text-right pr-6 h-8"
                />
                <span className="absolute right-2 top-1.5 text-xs text-muted-foreground">
                  %
                </span>
              </div>
              <span className="text-sm text-foreground min-w-[80px] text-right">
                - {(subTotal * (discount / 100)).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Tax */}
          <div className="flex justify-between items-start">
            <div className="flex flex-col gap-2 w-1/3">
              <select
                {...register("taxType", {
                  onChange: (e) => {
                    if (e.target.value === "None") {
                      setValue("taxRate", 0);
                      setValue("taxTypeLabel", "No Tax");
                      setValue("taxMethod", "global");
                    } else if (e.target.value === "GST") {
                      setValue("taxTypeLabel", "GST");
                    } else {
                      setValue("taxTypeLabel", "");
                      setValue("taxMethod", "global");
                    }
                  },
                })}
                className="h-8 w-full rounded-md border border-input bg-background px-2 text-sm"
              >
                <option value="None">None</option>
                <option value="GST">GST</option>
                <option value="TDS">TDS</option>
                <option value="TCS">TCS</option>
              </select>

              {taxType === "GST" && (
                <div className="flex flex-col gap-3 mt-2 border-t border-dashed border-slate-200 pt-2">
                  {/* Tax Method - Checkbox */}
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="taxMethod"
                      className="h-3 w-3 rounded border-gray-300"
                      checked={taxMethod === "item_wise"}
                      onChange={(e) => {
                        setValue(
                          "taxMethod",
                          e.target.checked ? "item_wise" : "global"
                        );
                      }}
                    />
                    <label
                      htmlFor="taxMethod"
                      className="text-xs text-muted-foreground whitespace-nowrap"
                    >
                      Per Item
                    </label>
                  </div>

                  {/* Tax Inclusion */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Tax Type
                    </label>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <input
                          type="radio"
                          id="inc_exclusive"
                          name="taxInclusiveRadio"
                          checked={!taxInclusive}
                          onChange={() =>
                            setValue("taxInclusive", false, {
                              shouldValidate: true,
                            })
                          }
                          className="h-3 w-3 border-gray-300 text-primary focus:ring-primary"
                        />
                        <label
                          htmlFor="inc_exclusive"
                          className="text-xs cursor-pointer"
                        >
                          Exclusive
                        </label>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="radio"
                          id="inc_inclusive"
                          name="taxInclusiveRadio"
                          checked={!!taxInclusive}
                          onChange={() =>
                            setValue("taxInclusive", true, {
                              shouldValidate: true,
                            })
                          }
                          className="h-3 w-3 border-gray-300 text-primary focus:ring-primary"
                        />
                        <label
                          htmlFor="inc_inclusive"
                          className="text-xs cursor-pointer"
                        >
                          Inclusive
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2 w-1/2 justify-end">
              {taxType === "GST" ? (
                // GST Logic
                isIntraState(yourState, billToState) ? (
                  // Intra-state: CGST + SGST
                  <>
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-sm text-muted-foreground">
                        CGST ({taxMethod === "global" ? taxRate / 2 : ""}%)
                      </span>
                      <span className="text-sm text-green-600 min-w-[80px] text-right">
                        {taxInclusive ? "(incl.) " : "+ "}{" "}
                        {(taxAmount / 2).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-sm text-muted-foreground">
                        SGST ({taxMethod === "global" ? taxRate / 2 : ""}%)
                      </span>
                      <span className="text-sm text-green-600 min-w-[80px] text-right">
                        {taxInclusive ? "(incl.) " : "+ "}{" "}
                        {(taxAmount / 2).toFixed(2)}
                      </span>
                    </div>
                  </>
                ) : (
                  // Inter-state: IGST
                  <div className="flex items-center justify-end gap-2">
                    <span className="text-sm text-muted-foreground">
                      IGST ({taxMethod === "global" ? taxRate : ""}%)
                    </span>
                    <span className="text-sm text-green-600 min-w-[80px] text-right">
                      {taxInclusive ? "(incl.) " : "+ "} {taxAmount.toFixed(2)}
                    </span>
                  </div>
                )
              ) : (
                // Other Tax Types (TDS, TCS, None)
                <div className="flex items-center gap-2 justify-end">
                  <Input
                    {...register("taxTypeLabel")}
                    disabled={taxType === "None"}
                    className="h-8 w-20 text-right"
                    placeholder="Label"
                  />
                  <div className="relative w-20">
                    <Input
                      type="number"
                      step="0.01"
                      {...register("taxRate", {
                        valueAsNumber: true,
                        min: 0,
                        max: 100,
                      })}
                      disabled={taxType === "None" || taxMethod === "item_wise"}
                      className="h-8 text-right pr-6 disabled:opacity-50"
                    />
                    <span className="absolute right-2 top-1.5 text-xs text-muted-foreground">
                      %
                    </span>
                  </div>
                  <span
                    className={`text-sm min-w-[80px] text-right ${
                      taxType === "TDS" ? "text-red-600" : "text-green-600"
                    }`}
                  >
                    {taxType === "TDS" ? "-" : "+"} {taxAmount.toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Adjustment */}
          <div className="flex justify-between items-center">
            <Input
              {...register("adjustmentDescription")}
              className="h-8 w-32 border-dashed bg-transparent"
            />
            <div className="flex items-center gap-2 w-1/2 justify-end">
              <Input
                type="number"
                step="0.01"
                {...register("adjustmentAmount", { valueAsNumber: true })}
                className="h-8 w-24 text-right"
              />
              <span className="text-sm font-medium min-w-[80px] text-right">
                {adjustmentAmount >= 0 ? "+" : ""} {adjustmentAmount.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Total */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <span className="text-xl font-bold text-foreground">Total (₹)</span>
            <span className="text-xl font-bold text-indigo-600">
              {totalAmount.toFixed(2)}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
