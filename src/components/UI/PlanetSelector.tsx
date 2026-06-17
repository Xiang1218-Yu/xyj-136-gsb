import { PlanetState } from '../../types/game';
import { PLANET_STYLE_CONFIGS } from '../../utils/helpers';

interface PlanetSelectorProps {
  planets: PlanetState[];
  currentPlanetId: string;
  onSelectPlanet: (planetId: string) => void;
}

export function PlanetSelector({ planets, currentPlanetId, onSelectPlanet }: PlanetSelectorProps) {
  return (
    <div className="fixed left-4 top-28 z-10">
      <div className="flex flex-col items-stretch gap-2 bg-black/40 backdrop-blur-lg rounded-2xl p-3 border border-white/10 shadow-2xl">
        <div className="text-white/60 text-xs text-center mb-1 font-medium">🪐 星球选择</div>
        {planets.map((planet) => {
          const styleConfig = PLANET_STYLE_CONFIGS[planet.style];
          const isSelected = currentPlanetId === planet.id;

          return (
            <button
              key={planet.id}
              onClick={() => onSelectPlanet(planet.id)}
              className={`
                relative flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300
                ${isSelected
                  ? 'bg-white/20 scale-100 shadow-lg'
                  : 'bg-white/5 hover:bg-white/10 hover:scale-100'
                }
              `}
              style={{
                boxShadow: isSelected ? `0 0 20px ${styleConfig.baseColor}50` : 'none',
              }}
            >
              <div
                className="w-9 h-9 flex items-center justify-center rounded-full text-lg flex-shrink-0"
                style={{
                  backgroundColor: `${styleConfig.baseColor}30`,
                  border: `2px solid ${styleConfig.baseColor}`,
                  boxShadow: isSelected ? `0 0 12px ${styleConfig.baseColor}80` : 'none',
                }}
              >
                {styleConfig.icon}
              </div>
              <div className="flex flex-col items-start">
                <span
                  className="text-sm font-medium whitespace-nowrap"
                  style={{
                    color: isSelected ? styleConfig.baseColor : '#fff',
                    textShadow: isSelected ? `0 0 6px ${styleConfig.baseColor}` : 'none',
                  }}
                >
                  {planet.name}
                </span>
                <div className="flex items-center gap-1 text-[10px] text-white/50">
                  <span>生命:</span>
                  <span
                    className="font-bold"
                    style={{ color: isSelected ? styleConfig.baseColor : '#7cfc00' }}
                  >
                    {Math.floor(planet.lifeIndex)}
                  </span>
                </div>
              </div>
              {isSelected && (
                <div
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[10px] flex items-center justify-center text-black/80"
                  style={{ backgroundColor: styleConfig.baseColor }}
                >
                  ✓
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
