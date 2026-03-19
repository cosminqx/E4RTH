import type { MapCategory } from "@/lib/api";

type ActiveLayers = Record<MapCategory, boolean>;

type LayerControlsProps = {
  activeLayers: ActiveLayers;
  onToggleLayer: (category: MapCategory) => void;
  counts: Record<MapCategory, number>;
};

const LAYER_LABELS: Record<MapCategory, string> = {
  air: "Air",
  weather: "Weather",
  biodiversity: "Biodiversity",
};

const DOT_COLORS: Record<MapCategory, string> = {
  air: "bg-emerald-500",
  weather: "bg-cyan-500",
  biodiversity: "bg-fuchsia-500",
};

export default function LayerControls({
  activeLayers,
  onToggleLayer,
  counts,
}: LayerControlsProps) {
  return (
    <div className="absolute top-4 right-4 z-20 w-64 rounded-2xl border border-white/35 bg-white/75 p-3 backdrop-blur-md shadow-[0_8px_24px_rgba(0,0,0,0.18)]">
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700">
        Layers
      </p>
      {(Object.keys(LAYER_LABELS) as MapCategory[]).map((category) => {
        const isActive = activeLayers[category];
        return (
          <button
            key={category}
            type="button"
            onClick={() => onToggleLayer(category)}
            className={`mb-2 flex w-full items-center justify-between rounded-xl border px-3 py-2 text-sm transition-all last:mb-0 ${
              isActive
                ? "border-slate-300 bg-white text-slate-900"
                : "border-slate-200 bg-slate-100/90 text-slate-500"
            }`}
          >
            <span className="flex items-center gap-2">
              <span
                className={`h-2.5 w-2.5 rounded-full ${DOT_COLORS[category]} ${
                  isActive ? "opacity-100" : "opacity-45"
                }`}
              />
              {LAYER_LABELS[category]}
            </span>
            <span className="text-xs font-medium">{counts[category]}</span>
          </button>
        );
      })}
    </div>
  );
}
