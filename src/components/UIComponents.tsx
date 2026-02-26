import { ReactNode } from "react";

export function SidebarTab({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-4 px-8 py-6 text-xs font-bold uppercase tracking-widest border-b border-[#006874] transition-all ${
        active ? "bg-[#086775] text-[#E4E3E0]" : "hover:bg-[#E4E3E0]"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

export function InputGroup({
  label,
  unit,
  value,
  onChange,
  min,
  max,
  step = 0.01,
}: {
  label: string;
  unit: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-[10px] font-bold uppercase opacity-50">
          {label}
        </label>
        <span className="text-[9px] font-mono bg-[#006874] text-[#E4E3E0] px-1.5 py-0.5">
          {unit}
        </span>
      </div>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className="w-full bg-transparent border border-[#006874] p-3 text-sm font-bold focus:bg-white outline-none transition-all"
      />
    </div>
  );
}

export function MetricBox({
  label,
  value,
  unit,
}: {
  label: string;
  value: string;
  unit: string;
}) {
  return (
    <div className="bg-[#E4E3E0] p-8 flex flex-col justify-between h-40">
      <span className="text-[10px] font-bold uppercase tracking-widest opacity-50">
        {label}
      </span>
      <div>
        <span className="text-4xl font-black tracking-tighter">{value}</span>
        <span className="text-[10px] font-bold uppercase ml-2 opacity-50">
          {unit}
        </span>
      </div>
    </div>
  );
}
