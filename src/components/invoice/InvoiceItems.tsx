import React from "react";
import {
  useFieldArray,
  Control,
  UseFormRegister,
  UseFormWatch,
  UseFormSetValue,
  FieldErrors,
} from "react-hook-form";
import { Plus, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { IInvoiceFormData, IInvoiceItem } from "@/type/invoice";
import { getUserProducts } from "@/lib/firestore";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect, useRef } from "react";
import type { IProduct } from "@/type/product";

interface InvoiceItemsProps {
  control: Control<IInvoiceFormData>;
  register: UseFormRegister<IInvoiceFormData>;
  watch: UseFormWatch<IInvoiceFormData>;
  setValue: UseFormSetValue<IInvoiceFormData>;
  errors: FieldErrors<IInvoiceFormData>;
}

export const InvoiceItems: React.FC<InvoiceItemsProps> = ({
  control,
  register,
  watch,
  setValue,
  errors,
}) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const { user } = useAuth();
  const [products, setProducts] = useState<IProduct[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<number | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      getUserProducts(user.uid).then(setProducts).catch(console.error);
    }
  }, [user]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  const handleProductSelect = (index: number, product: IProduct) => {
    setValue(`items.${index}.description`, product.name); // Or combine name + desc
    setValue(`items.${index}.rate`, product.rate);
    setValue(`items.${index}.gstRate`, product.gst || 0);
    setShowSuggestions(null);
  };

  const filterProducts = (query: string) => {
    if (!query) return [];
    return products.filter((p) =>
      p.name.toLowerCase().includes(query.toLowerCase())
    );
  };

  return (
    <Card ref={wrapperRef}>
      <CardHeader>
        <CardTitle className="text-lg">Items</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="hidden md:grid grid-cols-12 gap-4 text-sm font-medium text-muted-foreground mb-2">
          <div className="col-span-4">Description</div>
          <div className="col-span-2">Qty</div>
          <div className="col-span-2">Rate</div>
          <div className="col-span-2">GST %</div>
          <div className="col-span-2"></div>
        </div>

        {fields.map((item, index) => (
          <div
            key={item.id}
            className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start"
          >
            <div className="col-span-1 md:col-span-4 relative">
              <Input
                {...register(`items.${index}.description`, {
                  required: "Description is required",
                })}
                placeholder="Description"
                onFocus={() => setShowSuggestions(index)}
                autoComplete="off"
                error={errors.items?.[index]?.description?.message}
              />
              {showSuggestions === index && (
                <div className="absolute z-10 w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-md shadow-lg mt-1 max-h-48 overflow-y-auto">
                  {filterProducts(watch(`items.${index}.description`)).length >
                  0 ? (
                    filterProducts(watch(`items.${index}.description`)).map(
                      (product) => (
                        <div
                          key={product.id}
                          className="px-4 py-2 hover:bg-indigo-50 dark:hover:bg-slate-800 cursor-pointer text-sm"
                          onClick={() => handleProductSelect(index, product)}
                        >
                          <div className="font-medium text-foreground">
                            {product.name}
                          </div>
                          <div className="text-xs text-muted-foreground flex justify-between">
                            <span>
                              {product.description.substring(0, 30)}...
                            </span>
                            <span>₹{product.rate}</span>
                          </div>
                        </div>
                      )
                    )
                  ) : (
                    <div className="px-4 py-2 text-sm text-muted-foreground">
                      No products found
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="col-span-1 md:col-span-2">
              <Input
                type="number"
                step="0.01"
                placeholder="Qty"
                {...register(`items.${index}.qty`, {
                  valueAsNumber: true,
                  min: 0.01,
                  required: "Qty is required",
                })}
                error={errors.items?.[index]?.qty?.message}
              />
            </div>
            <div className="col-span-1 md:col-span-2">
              <Input
                type="number"
                step="0.01"
                placeholder="Rate"
                {...register(`items.${index}.rate`, {
                  valueAsNumber: true,
                  min: 0.01,
                  required: "Rate is required",
                })}
                error={errors.items?.[index]?.rate?.message}
              />
            </div>
            <div className="col-span-1 md:col-span-2">
              <Input
                type="number"
                step="0.01"
                placeholder="GST %"
                {...register(`items.${index}.gstRate`, {
                  valueAsNumber: true,
                  min: 0,
                })}
              />
            </div>
            <div className="col-span-1 md:col-span-2 flex justify-end pt-1">
              {" "}
              {/* Adjusted col-span */}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => remove(index)}
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={() =>
            append({
              description: "",
              qty: 1,
              rate: 0,
              amount: 0,
            } as IInvoiceItem)
          }
          className="w-full mt-2 border-dashed"
        >
          <Plus className="mr-2 h-4 w-4" /> Add Item
        </Button>
      </CardContent>
    </Card>
  );
};
