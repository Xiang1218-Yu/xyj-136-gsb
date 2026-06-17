import { useState } from 'react';
import { PlanetState } from '../../types/game';
import { PLANET_THEME_CONFIGS } from '../../utils/helpers';

interface PlanetSwitcherProps {
  planets: PlanetState[];
  currentPlanetId: string;
  onSwitchPlanet: (planetId: string) => void;
}

/**
 * 星球切换面板组件
 * 显示所有可用星球列表，支持点击切换当前查看的星球
 * 每个星球显示名称、主题图标和生命指数
 */
export function PlanetSwitcher({ planets, currentPlanetId, onSwitchPlanet }: PlanetSwitcherProps) {
  // 面板展开/折叠状态
  const [isExpanded, setIsExpanded] = useState(false);

  const currentPlanet = planets.find(p => p.id === currentPlanetId)!;
  const currentTheme = PLANET_THEME_CONFIGS[currentPlanet.theme];

  return (
    <div className="fixed top-6 left-6 z-10">
      <div className="bg-black/40 backdrop-blur-lg rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition-all duration-300 w-full"
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-xl border-2"
            style={{
              backgroundColor: `${currentTheme.baseColor}30`,
              borderColor: currentTheme.baseColor,
              boxShadow: `0 0 15px ${currentTheme.baseColor}40`,
            }}
          >
            {currentTheme.icon}
          </div>
          <div className="text-left">
            <div className="text-white font-bold text-sm">{currentPlanet.name}</div>
            <div className="text-white/50 text-xs">{currentTheme.name}</div>
          </div>
          <div className="ml-auto text-white/50 text-lg transition-transform duration-300" style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
            ▼
          </div>
        </button>

        {isExpanded && (
          <div className="border-t border-white/10 max-h-80 overflow-y-auto">
            {planets.map((planet) => {
              const theme = PLANET_THEME_CONFIGS[planet.theme];
              const isSelected = planet.id === currentPlanetId;

              return (
                <button
                  key={planet.id}
                  onClick={() => {
                    onSwitchPlanet(planet.id);
                    setIsExpanded(false);
                  }}
                  className={`
                    flex items-center gap-3 px-4 py-3 w-full transition-all duration-200
                    ${isSelected ? 'bg-white/10' : 'hover:bg-white/5'}
                  `}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-base border"
                    style={{
                      backgroundColor: `${theme.baseColor}30`,
                      borderColor: isSelected ? theme.baseColor : 'transparent',
                    }}
                  >
                    {theme.icon}
                  </div>
                  <div className="text-left flex-1">
                    <div className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-white/80'}`}>
                      {planet.name}
                    </div>
                    <div className="text-white/40 text-xs">
                      生命指数: {planet.lifeIndex.toFixed(1)}%
                    </div>
                  </div>
                  {isSelected && (
                    <div className="text-green-400 text-xs">✓</div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {isExpanded && (
        <div className="mt-2 text-center">
          <p className="text-white/40 text-xs">点击星球进行切换</p>
        </div>
      )}
    </div>
  );
}
