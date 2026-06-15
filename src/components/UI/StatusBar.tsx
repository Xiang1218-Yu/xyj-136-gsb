import { BUILDING_CONFIGS } from '../../utils/helpers';

interface StatusBarProps {
  lifeIndex: number;
  forestCount: number;
  glacierCount: number;
  cityCount: number;
  grasslandCount: number;
}

export function StatusBar({
  lifeIndex,
  forestCount,
  glacierCount,
  cityCount,
  grasslandCount,
}: StatusBarProps) {
  const stats = [
    { type: 'forest' as const, count: forestCount },
    { type: 'glacier' as const, count: glacierCount },
    { type: 'city' as const, count: cityCount },
    { type: 'grassland' as const, count: grasslandCount },
  ];

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-10">
      <div className="flex items-center gap-6 bg-black/40 backdrop-blur-lg rounded-2xl px-8 py-4 border border-white/10 shadow-2xl">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "'Orbitron', sans-serif" }}>
            星球重生模拟器
          </h1>
          <p className="text-white/50 text-xs">Planet Rebirth Simulator</p>
        </div>

        <div className="w-px h-12 bg-white/20" />

        <div className="min-w-[200px]">
          <div className="flex justify-between items-center mb-2">
            <span className="text-white/70 text-sm">生命指数</span>
            <span
              className="text-lg font-bold"
              style={{
                fontFamily: "'Orbitron', sans-serif",
                color: lifeIndex > 70 ? '#7cfc00' : lifeIndex > 40 ? '#ffa500' : '#ff6b6b',
              }}
            >
              {lifeIndex.toFixed(1)}%
            </span>
          </div>
          <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${lifeIndex}%`,
                background: lifeIndex > 70
                  ? 'linear-gradient(90deg, #32cd32, #7cfc00)'
                  : lifeIndex > 40
                  ? 'linear-gradient(90deg, #ffa500, #ffd700)'
                  : 'linear-gradient(90deg, #ff6b6b, #ff8c8c)',
                boxShadow: `0 0 10px ${lifeIndex > 70 ? '#7cfc00' : lifeIndex > 40 ? '#ffa500' : '#ff6b6b'}`,
              }}
            />
          </div>
        </div>

        <div className="w-px h-12 bg-white/20" />

        <div className="flex gap-4">
          {stats.map(({ type, count }) => {
            const config = BUILDING_CONFIGS[type];
            return (
              <div key={type} className="text-center">
                <div
                  className="w-10 h-10 mx-auto mb-1 rounded-full flex items-center justify-center text-xl"
                  style={{
                    backgroundColor: `${config.color}30`,
                    border: `2px solid ${config.color}50`,
                  }}
                >
                  {config.icon}
                </div>
                <span
                  className="text-sm font-bold"
                  style={{
                    color: config.color,
                    fontFamily: "'Orbitron', sans-serif",
                  }}
                >
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
