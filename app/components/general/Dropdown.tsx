// app/components/ui/Dropdown.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

interface DropdownOption {
  label: string;
  value: string;
}

interface DropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  width?: string;
  allLabel?: string;
}

const Dropdown = ({
  options,
  value,
  onChange,
  placeholder = "All",
  icon,
  width = "w-full sm:w-52",
  allLabel = "All",
}: DropdownProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    if (open) window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  const selectedLabel = options.find((o) => o.value === value)?.label;

  return (
    <div className={`relative ${width}`} ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`w-full flex items-center justify-between px-3.5 py-2.5 bg-white border rounded-xl text-sm transition-all
          ${value
            ? "border-indigo-300 text-indigo-700 bg-indigo-50"
            : "border-gray-200 text-gray-700 hover:border-indigo-200"
          }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-medium truncate">
            {selectedLabel ?? placeholder}
          </span>
        </div>
        <ChevronDown
          size={14}
          className={`text-gray-400 transition-transform flex-shrink-0 ml-2 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute top-full mt-1.5 w-full bg-white border border-gray-100 rounded-xl shadow-lg z-50 py-1.5 overflow-hidden">
          {/* All / clear option */}
          <button
            type="button"
            onClick={() => { onChange(""); setOpen(false); }}
            className={`w-full text-left px-3.5 py-2 text-sm transition-colors
              ${!value
                ? "text-indigo-600 bg-indigo-50 font-semibold"
                : "text-gray-600 hover:bg-gray-50"
              }`}
          >
            {allLabel}
          </button>

          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`w-full text-left px-3.5 py-2 text-sm transition-colors
                ${value === opt.value
                  ? "text-indigo-600 bg-indigo-50 font-semibold"
                  : "text-gray-600 hover:bg-gray-50"
                }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dropdown;