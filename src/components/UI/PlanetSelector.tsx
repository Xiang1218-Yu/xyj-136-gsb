import { PlanetState } from '../../types/game';
import { PLANET_STYLE_CONFIGS } from '../../utils/helpers';

interface PlanetSelectorProps {
  planets: PlanetState[];
  currentPlanetId: string;
  onSelectPlanet: (planetId: string) => void;
}

export function PlanetSelector({ planets, currentPlanetId, onSelectPlanet }: PlanetSelectorProps) {
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-10">
      <div className="flex items-center gap-3 bg-black/40 backdrop-blur-lg rounded-2xl p-3 border border-white/10 shadow-2xl">
        {planets.map((planet) => {
          const styleConfig = PLANET_STYLE_CONFIGS[planet.style];
          const isSelected = currentPlanetId === planet.id;

          return (
            <button
              key={planet.id}
              onClick={() => onSelectPlanet(planet.id)}
              className={`
                relative flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl transition-all duration-300
                ${isSelected
                  ? 'bg-white/20 scale-105 shadow-lg'
                  : 'bg-white/5 hover:bg-white/10 hover:scale-105'
                }
              `}
              style={{
                boxShadow: isSelected ? `0 0 25px ${styleConfig.baseColor}50` : 'none',
              }}
            >
              <div
                className="w-10 h-10 flex items-center justify-center rounded-full text-xl"
                style={{
                  backgroundColor: `${styleConfig.baseColor}30`,
                  border: `2px solid ${styleConfig.baseColor}`,
                  boxShadow: isSelected ? `0 0 15px ${styleConfig.baseColor}80` : 'none',
                }}
              >
                {styleConfig.icon}
              </div>
              <span
                className="text-xs font-medium whitespace-nowrap"
                style={{
                  color: isSelected ? styleConfig.baseColor : '#fff',
                  textShadow: isSelected ? `0 0 8px ${styleConfig.baseColor}` : 'none',
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
