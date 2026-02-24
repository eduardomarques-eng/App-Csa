import { AlertCircle } from "lucide-react";

interface Option {
  value: string;
  label: string;
}

interface SelectGroupProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Option[];
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
}

export const SmartSelectGroup = ({
  label,
  value,
  onChange,
  options,
  required = true,
  placeholder = "Selecione...",
  disabled = false,
}: SelectGroupProps) => {
  const isInvalid = required && (value === "" || value === undefined);

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-[9px] font-bold uppercase opacity-50 flex items-center gap-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      </div>
      <div className="relative">
        <select
          className={`w-full bg-transparent border p-3 text-sm font-bold outline-none focus:bg-white transition-colors appearance-none ${
            isInvalid ? "border-red-500 bg-red-50" : "border-[#141414]"
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none flex items-center gap-2">
          {isInvalid && <AlertCircle size={14} className="text-red-500" />}
          <svg
            className={`w-4 h-4 ${isInvalid ? "text-red-500" : "text-[#141414]"}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {isInvalid && (
        <p className="text-[8px] font-bold uppercase text-red-500">
          Seleção obrigatória
        </p>
      )}
    </div>
  );
};
