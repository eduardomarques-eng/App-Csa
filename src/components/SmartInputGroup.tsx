import { AlertCircle } from "lucide-react";

interface InputGroupProps {
  label: string;
  unit: string;
  value: number | "";
  onChange: (v: number | "") => void;
  required?: boolean;
}

export const SmartInputGroup = ({
  label,
  unit,
  value,
  onChange,
  required = true,
}: InputGroupProps) => {
  const isInvalid =
    required && (value === "" || value <= 0 || isNaN(value as number));

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-[9px] font-bold uppercase opacity-50 flex items-center gap-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <span className="text-[8px] font-mono opacity-40">{unit}</span>
      </div>
      <div className="relative">
        <input
          type="number"
          className={`w-full bg-transparent border p-3 text-sm font-bold outline-none focus:bg-white transition-colors ${
            isInvalid ? "border-red-500 bg-red-50" : "border-[#006874]"
          }`}
          value={value}
          onChange={(e) => {
            const val = e.target.value;
            onChange(val === "" ? "" : parseFloat(val));
          }}
          placeholder="0.00"
        />
        {isInvalid && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 flex items-center gap-1">
            <AlertCircle size={14} />
          </div>
        )}
      </div>
      {isInvalid && (
        <p className="text-[8px] font-bold uppercase text-red-500">
          Valor obrigatório e maior que zero
        </p>
      )}
    </div>
  );
};
