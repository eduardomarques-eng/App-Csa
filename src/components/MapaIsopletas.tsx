import React from "react";
import { MapPin } from "lucide-react";

interface RegionProps {
  name: string;
  v0: number;
  color: string;
  selected: boolean;
  onClick: () => void;
}

const RegionCard: React.FC<RegionProps> = ({
  name,
  v0,
  color,
  selected,
  onClick,
}) => (
  <button
    onClick={onClick}
    className={`relative p-4 border text-left transition-all overflow-hidden flex flex-col justify-between h-24 ${
      selected
        ? "border-[#141414] shadow-md"
        : "border-[#D1D1D1] hover:border-[#141414] opacity-70 hover:opacity-100"
    }`}
  >
    <div
      className="absolute top-0 left-0 w-2 h-full"
      style={{ backgroundColor: color }}
    />
    <div className="pl-4">
      <h4 className="text-[10px] font-black uppercase tracking-widest">
        {name}
      </h4>
      <div className="flex items-center gap-1 mt-2">
        <MapPin size={12} className="opacity-40" />
        <span className="text-sm font-bold">{v0} m/s</span>
      </div>
    </div>
    {selected && (
      <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#141414]" />
    )}
  </button>
);

export const MapaIsopletas = ({
  selectedRegion,
  onSelect,
}: {
  selectedRegion: string;
  onSelect: (region: string) => void;
}) => {
  const regions = [
    { name: "Região I", v0: 30, color: "#A7F3D0" }, // emerald-200
    { name: "Região II", v0: 35, color: "#FDE68A" }, // amber-200
    { name: "Região III", v0: 40, color: "#FDBA74" }, // orange-300
    { name: "Região IV", v0: 45, color: "#F87171" }, // red-400
    { name: "Região V", v0: 50, color: "#991B1B" }, // red-800
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-end mb-4">
        <div>
          <h3 className="text-xs font-black uppercase tracking-widest">
            Mapa de Isopletas
          </h3>
          <p className="text-[10px] font-bold uppercase opacity-40">
            NBR 6123 - Velocidade Básica do Vento (V0)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {regions.map((r) => (
          <RegionCard
            key={r.name}
            name={r.name}
            v0={r.v0}
            color={r.color}
            selected={selectedRegion === r.name}
            onClick={() => onSelect(r.name)}
          />
        ))}
      </div>

      <div className="p-4 bg-[#F9F9F7] border border-[#141414] mt-4">
        <p className="text-[9px] font-bold uppercase opacity-60 leading-relaxed">
          * Selecione a região correspondente ao local da obra conforme o mapa
          de isopletas da NBR 6123. A velocidade básica do vento (V0) é o
          principal fator para a determinação da pressão dinâmica.
        </p>
      </div>
    </div>
  );
};
