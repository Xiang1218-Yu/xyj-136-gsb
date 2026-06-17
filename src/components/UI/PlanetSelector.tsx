import { useState } from 'react';
import { PlanetId, PlanetData } from '../../types/game';
import { PLANET_STYLES, PLANET_IDS } from '../../utils/helpers';

interface PlanetSelectorProps {
  /** 当前选中的星球 ID */
  currentPlanetId: PlanetId;
  /** 所有星球的数据映射 */
  planets: Record<PlanetId, PlanetData>;
  /** 切换星球的回调 */
  onSwitchPlanet: (planetId: PlanetId) => void;
}

/**
 * 星球选择器组件
 *
 * 职责：
 * - 展示所有可用星球的列表
 * - 显示每个星球的生命指数和基本信息
 * - 处理星球切换交互
 */
export function PlanetSelector({
  currentPlanetId,
  planets,
  onSwitchPlanet,
}: PlanetSelectorProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const currentStyle = PLANET_STYLES[currentPlanetId];
  const currentData = planets[currentPlanetId];

  return (
    <div className="fixed top-4 left-4 z-10">
      {/* 折叠/展开按钮 */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-3 px-4 py-3 bg-black/40 backdrop-blur-lg rounded-2xl border border-white/10 shadow-2xl hover:bg-black/50 transition-all duration-300"
      >
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
          style={{
            background: `radial-gradient(circle at 30% 30%, ${currentStyle.vibrantColor}, ${currentStyle.primaryColor}, ${currentStyle.baseColor})`,
            boxShadow: `0 0 20px ${currentStyle.atmosphereColor}60`,
          }}
        >
          {currentStyle.icon}
        </div>
        <div className="text-left">
          <p className="text-white font-bold text-sm">{currentStyle.name}</p>
          <p className="text-white/60 text-xs">
            生命指数: <span className="text-green-400 font-medium">{Math.floor(currentData.lifeIndex)}</span>
          </p>
        </div>
        <div
          className={`ml-2 text-white/60 transition-transform duration-300 ${
            isExpanded ? 'rotate-180' : ''
          }`}
        >
          ▼
        </div>
      </button>

      {/* 展开的星球列表 */}
      {isExpanded && (
        <div className="mt-2 bg-black/40 backdrop-blur-lg rounded-2xl border border-white/10 shadow-2xl p-3 overflow-hidden">
          <p className="text-white/50 text-xs mb-2 px-2">选择星球</p>
          <div className="flex flex-col gap-1">
            {PLANET_IDS.map((planetId) => {
              const style = PLANET_STYLES[planetId];
              const data = planets[planetId];
              const isSelected = planetId === currentPlanetId;

              return (
                <button
                  key={planetId}
                  onClick={() => {
                    onSwitchPlanet(planetId);
                    setIsExpanded(false);
                  }}
                  className={`
                    flex items-center gap-3 p-3 rounded-xl transition-all duration-300
                    ${isSelected
                      ? 'bg-white/15 scale-105'
                      : 'hover:bg-white/10 hover:scale-102'
                    }
                  `}
                >
                  {/* 星球图标 */}
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-base flex-shrink-0"
                    style={{
                      background: `radial-gradient(circle at 30% 30%, ${style.vibrantColor}, ${style.primaryColor}, ${style.baseColor})`,
                      boxShadow: isSelected
                        ? `0 0 15px ${style.atmosphereColor}80`
                        : 'none',
                    }}
                  >
                    {style.icon}
                  </div>

                  {/* 星球信息 */}
                  <div className="text-left flex-1 min-w-0">
                    <p
                      className={`text-sm font-medium truncate ${
                        isSelected ? 'text-white' : 'text-white/80'
                      }`}
                    >
                      {style.name}
                    </p>
                    <p className="text-white/50 text-xs truncate">
                      {style.description}
                    </p>
                  </div>

                  {/* 生命指数 */}
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-white/50">生命</p>
                    <p
                      className="text-sm font-bold"
                      style={{
                        color:
                          data.lifeIndex > 60
                            ? '#4ade80'
                            : data.lifeIndex > 30
                            ? '#fbbf24'
                            : '#f87171',
                      }}
                    >
                      {Math.floor(data.lifeIndex)}
                    </p>
                  </div>

                  {/* 选中指示器 */}
                  {isSelected && (
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: style.vibrantColor }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
