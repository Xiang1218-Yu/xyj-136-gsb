import { ToolType, BuildingType, CreatureType } from '../../types/game';
import { BUILDING_CONFIGS, CREATURE_CONFIGS, TOOL_CONFIGS, CREATURES_BY_BIOME } from '../../utils/helpers';
import { useState } from 'react';

interface BuildPanelProps {
  selectedTool: ToolType | null;
  onSelectTool: (tool: ToolType | null) => void;
  onReset: () => void;
}

export function BuildPanel({ selectedTool, onSelectTool, onReset }: BuildPanelProps) {
  const buildingTools: BuildingType[] = ['forest', 'glacier', 'city', 'grassland'];
  const [activeTab, setActiveTab] = useState<'buildings' | 'creatures'>('buildings');

  const renderBuildingButton = (tool: BuildingType) => {
    const config = BUILDING_CONFIGS[tool];
    const isSelected = selectedTool === tool;

    return (
      <button
        key={tool}
        onClick={() => onSelectTool(isSelected ? null : tool)}
        className={`
          relative flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-300
          ${isSelected
            ? 'bg-white/20 scale-110 shadow-lg'
            : 'bg-white/5 hover:bg-white/10 hover:scale-105'
          }
        `}
        style={{
          boxShadow: isSelected ? `0 0 30px ${config.color}50` : 'none',
        }}
      >
        <div
          className="w-12 h-12 flex items-center justify-center rounded-full text-2xl"
          style={{
            backgroundColor: `${config.color}30`,
            border: `2px solid ${config.color}`,
          }}
        >
          {config.icon}
        </div>
        <span
          className="text-sm font-medium"
          style={{
            color: isSelected ? config.color : '#fff',
            textShadow: isSelected ? `0 0 10px ${config.color}` : 'none',
          }}
        >
          {config.name}
        </span>
        {isSelected && (
          <div
            className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-xs flex items-center justify-center"
            style={{ backgroundColor: config.color }}
          >
            ✓
          </div>
        )}
      </button>
    );
  };

  const renderCreatureButton = (tool: CreatureType) => {
    const config = CREATURE_CONFIGS[tool];
    const isSelected = selectedTool === tool;

    return (
      <button
        key={tool}
        onClick={() => onSelectTool(isSelected ? null : tool)}
        className={`
          relative flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all duration-300
          ${isSelected
            ? 'bg-white/20 scale-110 shadow-lg'
            : 'bg-white/5 hover:bg-white/10 hover:scale-105'
          }
        `}
        style={{
          boxShadow: isSelected ? `0 0 20px ${config.color}50` : 'none',
        }}
      >
        <div
          className="w-10 h-10 flex items-center justify-center rounded-full text-xl"
          style={{
            backgroundColor: `${config.color}30`,
            border: `2px solid ${config.color}`,
          }}
        >
          {config.icon}
        </div>
        <span
          className="text-xs font-medium"
          style={{
            color: isSelected ? config.color : '#fff',
            textShadow: isSelected ? `0 0 8px ${config.color}` : 'none',
          }}
        >
          {config.name}
        </span>
        {isSelected && (
          <div
            className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full text-xs flex items-center justify-center text-black/80"
            style={{ backgroundColor: config.color }}
          >
            ✓
          </div>
        )}
      </button>
    );
  };

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-10">
      <div className="flex items-center gap-2 mb-2 justify-center">
        <button
          onClick={() => setActiveTab('buildings')}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'buildings'
              ? 'bg-white/20 text-white'
              : 'bg-white/5 text-white/60 hover:text-white'
          }`}
        >
          🏗️ 建筑
        </button>
        <button
          onClick={() => setActiveTab('creatures')}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'creatures'
              ? 'bg-white/20 text-white'
              : 'bg-white/5 text-white/60 hover:text-white'
          }`}
        >
          🐾 生物
        </button>
      </div>

      <div className="flex items-center gap-4 bg-black/40 backdrop-blur-lg rounded-2xl p-4 border border-white/10 shadow-2xl">
        {activeTab === 'buildings' ? (
          <>
            {buildingTools.map(renderBuildingButton)}

            <div className="w-px h-16 bg-white/20 mx-2" />

            {(() => {
              const config = TOOL_CONFIGS.delete;
              const isSelected = selectedTool === 'delete';
              return (
                <button
                  onClick={() => onSelectTool(isSelected ? null : 'delete')}
                  className={`
                    relative flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-300
                    ${isSelected
                      ? 'bg-red-500/30 scale-110 shadow-lg'
                      : 'bg-white/5 hover:bg-red-500/20 hover:scale-105'
                    }
                  `}
                  style={{
                    boxShadow: isSelected ? `0 0 30px ${config.color}80` : 'none',
                  }}
                >
                  <div
                    className="w-12 h-12 flex items-center justify-center rounded-full text-2xl"
                    style={{
                      backgroundColor: `${config.color}30`,
                      border: `2px solid ${config.color}`,
                    }}
                  >
                    {config.icon}
                  </div>
                  <span
                    className="text-sm font-medium"
                    style={{
                      color: isSelected ? config.color : '#fff',
                      textShadow: isSelected ? `0 0 10px ${config.color}` : 'none',
                    }}
                  >
                    {config.name}
                  </span>
                  {isSelected && (
                    <div
                      className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-xs flex items-center justify-center"
                      style={{ backgroundColor: config.color }}
                    >
                      ✓
                    </div>
                  )}
                </button>
              );
            })()}
          </>
        ) : (
          <>
            {Object.entries(CREATURES_BY_BIOME).map(([biome, creatureTypes]) => (
              <div key={biome} className="flex flex-col items-center gap-1">
                <div className="text-xs text-white/50 mb-1">
                  {biome === 'forest' ? '🌲 森林' :
                   biome === 'grassland' ? '🌿 草地' :
                   biome === 'glacier' ? '🏔️ 冰川' : '🏙️ 城市'}
                </div>
                <div className="flex gap-2">
                  {creatureTypes.map(renderCreatureButton)}
                </div>
              </div>
            ))}
          </>
        )}

        {activeTab === 'buildings' && (
          <>
            <div className="w-px h-16 bg-white/20 mx-2" />

            <button
              onClick={onReset}
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/5 hover:bg-red-500/20 transition-all duration-300 hover:scale-105"
            >
              <div className="w-12 h-12 flex items-center justify-center rounded-full text-2xl bg-red-500/30 border-2 border-red-400">
                🔄
              </div>
              <span className="text-sm font-medium text-white">重置</span>
            </button>
          </>
        )}
      </div>

      {selectedTool && (
        <div className="mt-4 text-center">
          <p className="text-white/70 text-sm">
            已选择 <span style={{ color: TOOL_CONFIGS[selectedTool].color }} className="font-bold">
              {TOOL_CONFIGS[selectedTool].name}
            </span>
            {' '}- {selectedTool === 'delete' ? '点击建筑或生物将其删除' : '点击星球表面放置'}
          </p>
        </div>
      )}
    </div>
  );
}
