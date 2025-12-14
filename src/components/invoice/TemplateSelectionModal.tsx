import React from "react";
import { Button } from "@/components/ui/Button";
import { TemplateThumbnail } from "./TemplateThumbnail";
import { X } from "lucide-react";

interface TemplateSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTemplate: string;
  onSelectTemplate: (template: string) => void;
  selectedColor: string;
  onSelectColor: (color: string) => void;
}

export const TemplateSelectionModal: React.FC<TemplateSelectionModalProps> = ({
  isOpen,
  onClose,
  selectedTemplate,
  onSelectTemplate,
  selectedColor,
  onSelectColor,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col border border-slate-200 dark:border-slate-800">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Customize Design
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Choose a template and color scheme for your invoice
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Color Selection */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Accent Color
            </h3>
            <div className="flex flex-wrap gap-3">
              {[
                "#4f46e5", // Indigo
                "#0ea5e9", // Sky
                "#10b981", // Emerald
                "#f59e0b", // Amber
                "#ef4444", // Red
                "#ec4899", // Pink
                "#8b5cf6", // Violet
                "#111827", // Gray/Black
              ].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => onSelectColor(c)}
                  className={`w-10 h-10 rounded-full border-4 transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    selectedColor === c
                      ? "border-white dark:border-slate-900 ring-2 ring-slate-900 dark:ring-white scale-110 shadow-lg"
                      : "border-transparent"
                  }`}
                  style={{ backgroundColor: c }}
                  aria-label={`Select color ${c}`}
                />
              ))}
            </div>
          </div>

          {/* Template Selection */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Select Template
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {[
                "classic",
                "minimal",
                "bold",
                "modern",
                "professional",
                "elegant",
                "tech",
                "creative",
              ].map((t) => (
                <TemplateThumbnail
                  key={t}
                  template={t}
                  color={selectedColor}
                  selected={selectedTemplate === t}
                  onClick={() => onSelectTemplate(t)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50/50 dark:bg-slate-900/50 rounded-b-xl">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={onClose}
            className="text-white hover:opacity-90 transition-opacity"
            style={{ backgroundColor: selectedColor }}
          >
            Apply Changes
          </Button>
        </div>
      </div>
    </div>
  );
};
