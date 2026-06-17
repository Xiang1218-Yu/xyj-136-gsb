import { useState } from 'react';
import { AudioSettings, MusicStyle } from '../../audio/AudioSystem';

interface VolumeControlProps {
  settings: AudioSettings;
  currentStyle: MusicStyle;
  isInitialized: boolean;
  onStartMusic: () => void;
  onSetMusicVolume: (volume: number) => void;
  onSetSfxVolume: (volume: number) => void;
  onToggleMute: () => void;
}

const STYLE_NAMES: Record<MusicStyle, string> = {
  barren: '🌑 荒芜宇宙',
  sprout: '🌱 萌芽新生',
  growth: '🌳 生机勃勃',
  prosperity: '🏙️ 繁荣昌盛',
  civilization: '🌍 璀璨文明',
  perfection: '✨ 完美世界',
};

export function VolumeControl({
  settings,
  currentStyle,
  isInitialized,
  onStartMusic,
  onSetMusicVolume,
  onSetSfxVolume,
  onToggleMute,
}: VolumeControlProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!isInitialized) {
    return (
      <button
        onClick={onStartMusic}
        className="fixed top-4 left-4 z-20 flex items-center gap-2 px-4 py-2.5 bg-black/40 backdrop-blur-lg rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300 group"
      >
        <span className="text-2xl group-hover:scale-110 transition-transform">🔊</span>
        <span className="text-white font-medium">开启音乐</span>
      </button>
    );
  }

  return (
    <div className="fixed top-4 left-4 z-20">
      <div className="bg-black/40 backdrop-blur-lg rounded-xl border border-white/10 overflow-hidden">
        <div
          className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-white/5 transition-all duration-300"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleMute();
            }}
            className="text-2xl hover:scale-110 transition-transform"
          >
            {settings.muted ? '🔇' : settings.musicVolume > 0.6 ? '🔊' : settings.musicVolume > 0.2 ? '🔉' : '🔈'}
          </button>

          <div className="flex flex-col items-start">
            <span className="text-white text-sm font-medium">
              {STYLE_NAMES[currentStyle]}
            </span>
            <span className="text-white/50 text-xs">
              {settings.muted ? '已静音' : '点击调节音量'}
            </span>
          </div>

          <svg
            className={`w-4 h-4 text-white/50 ml-2 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {isExpanded && (
          <div className="px-4 pb-4 space-y-4 border-t border-white/10 pt-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-white/80 text-sm flex items-center gap-1.5">
                  🎵 背景音乐
                </span>
                <span className="text-white/50 text-xs">
                  {Math.round(settings.musicVolume * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={settings.musicVolume}
                onChange={(e) => onSetMusicVolume(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-white/20 rounded-full appearance-none cursor-pointer accent-green-400"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-white/80 text-sm flex items-center gap-1.5">
                  🔔 操作音效
                </span>
                <span className="text-white/50 text-xs">
                  {Math.round(settings.sfxVolume * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={settings.sfxVolume}
                onChange={(e) => onSetSfxVolume(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-white/20 rounded-full appearance-none cursor-pointer accent-blue-400"
              />
            </div>

            <button
              onClick={onToggleMute}
              className={`w-full py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                settings.muted
                  ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                  : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
              }`}
            >
              {settings.muted ? '🔊 取消静音' : '🔇 全部静音'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
