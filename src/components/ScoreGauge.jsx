import React from 'react';

export const ScoreGauge = ({ score, size = 120, strokeWidth = 10, badge, showLabel = true }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  // スコアに応じたカラーグラデーション
  const getColors = (s) => {
    if (s >= 90) return { stroke: '#38bdf8', glow: 'rgba(56, 189, 248, 0.4)', text: 'text-sky-400' };
    if (s >= 75) return { stroke: '#06b6d4', glow: 'rgba(6, 182, 212, 0.4)', text: 'text-cyan-400' };
    if (s >= 60) return { stroke: '#10b981', glow: 'rgba(16, 185, 129, 0.4)', text: 'text-emerald-400' };
    if (s >= 45) return { stroke: '#f59e0b', glow: 'rgba(245, 158, 11, 0.4)', text: 'text-amber-400' };
    return { stroke: '#ef4444', glow: 'rgba(239, 68, 68, 0.4)', text: 'text-rose-500' };
  };

  const { stroke, glow, text } = getColors(score);

  return (
    <div className="relative flex flex-col items-center justify-center select-none" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90 filter drop-shadow-md"
      >
        {/* 背景トラック */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* スコア進捗リング */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          style={{
            transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
            filter: `drop-shadow(0 0 6px ${glow})`
          }}
        />
      </svg>

      {/* 中央スコア数値 */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span
          className={`font-outfit font-black tracking-tight ${text}`}
          style={{ fontSize: size * 0.32, lineHeight: 1 }}
        >
          {score}
        </span>
        {showLabel && (
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mt-0.5">
            SCORE
          </span>
        )}
      </div>
    </div>
  );
};
