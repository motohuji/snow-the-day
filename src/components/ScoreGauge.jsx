import React from 'react';

export const ScoreGauge = ({ score, size = 120, strokeWidth = 10, badge, showLabel = true }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  // スコアに応じたカラーグラデーション
  const getColors = (s) => {
    if (s >= 90) return { stroke: '#0284c7', glow: 'rgba(2, 132, 199, 0.35)', text: 'text-sky-600' };
    if (s >= 75) return { stroke: '#0891b2', glow: 'rgba(8, 145, 178, 0.35)', text: 'text-cyan-600' };
    if (s >= 60) return { stroke: '#059669', glow: 'rgba(5, 150, 105, 0.35)', text: 'text-emerald-600' };
    if (s >= 45) return { stroke: '#d97706', glow: 'rgba(217, 119, 6, 0.35)', text: 'text-amber-600' };
    return { stroke: '#e11d48', glow: 'rgba(225, 29, 72, 0.35)', text: 'text-rose-600' };
  };

  const { stroke, glow, text } = getColors(score);

  return (
    <div className="relative flex flex-col items-center justify-center select-none" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90 filter drop-shadow-sm"
      >
        {/* 背景トラック (ライト背景で見やすい薄グレー) */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(15, 23, 42, 0.08)"
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
            filter: `drop-shadow(0 0 4px ${glow})`
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
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 mt-0.5">
            SCORE
          </span>
        )}
      </div>
    </div>
  );
};
