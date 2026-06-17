import { PlanetData, PlanetStyleId } from '../../types/game';
import { PLANET_STYLE_CONFIGS } from '../../utils/helpers';

interface PlanetSwitcherProps {
  planets: PlanetData[];
  activePlanetId: string;
  onSwitchPlanet: (planetId: string) => void;
}

/* 星球切换面板：显示所有可用星球，支持点击切换 */
export function PlanetSwitcher({ planets, activePlanetId, onSwitchPlanet }: PlanetSwitcherProps) {
  return (
    <div className="fixed top-6 left-4 z-10">
      <div className="flex flex-col gap-2 bg-black/40 backdrop-blur-lg rounded-xl p-3 border border-white/10 shadow-2xl">
        <div className="text-white/50 text-xs font-medium mb-1 text-center">星球导航</div>
        {planets.map((planet) => {
          const style = PLANET_STYLE_CONFIGS[planet.styleId as PlanetStyleId];
          const isActive = planet.id === activePlanetId;

          return (
            <button
              key={planet.id}
              onClick={() => onSwitchPlanet(planet.id)}
              className={`
                relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300
                ${isActive
                  ? 'bg-white/20 scale-105'
                  : 'bg-white/5 hover:bg-white/10 hover:scale-102'
                }
              `}
            >
              <div
                className="w-9 h-9 flex items-center justify-center rounded-full text-lg shrink-0"
                style={{
                  backgroundColor: isActive ? `${style.atmosphereColor}40` : `${style.atmosphereColor}20`,
                  border: `2px solid ${isActive ? style.atmosphereColor : style.atmosphereColor}60`,
                }}
              >
                {style.icon}
              </div>

              <div className="text-left min-w-0">
                <div
                  className={`text-sm font-medium truncate ${
                    isActive ? 'text-white' : 'text-white/70'
                  }`}
                >
                  {planet.name}
                </div>
                <div
                  className="text-xs truncate"
                  style={{ color: isActive ? style.atmosphereColor : `${style.atmosphereColor}80` }}
                >
                  {style.name} · 生命指数 {planet.counts.lifeIndex.toFixed(0)}%
                </div>
              </div>

              {isActive && (
                <div
                  className="absolute -right-1 top-1/2 -translate-y-1/2 w-1.5 h-5 rounded-full"
                  style={{ backgroundColor: style.atmosphereColor }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
