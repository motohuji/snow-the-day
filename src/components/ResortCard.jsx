import React from 'react';
import { ScoreGauge } from './ScoreGauge';
import { WeatherIcon } from './WeatherIcon';
import { Snowflake, Mountain, Wind, Thermometer, ChevronRight, AlertTriangle } from 'lucide-react';

export const ResortCard = ({ data, onSelect }) => {
  const { resort, current, scoreResult } = data;
  const { score, badge, factors } = scoreResult;

  const isLiftRisk = current.windSpeed > 12 || current.windGust > 16;

  return (
    <div
      onClick={() => onSelect(data)}
      className="group relative bg-slate-900/90 active:bg-slate-850 hover:bg-slate-850 border border-slate-800 hover:border-sky-500/50 rounded-2xl p-4 sm:p-5 cursor-pointer transition-all duration-200 shadow-lg active:scale-[0.99] flex flex-col justify-between overflow-hidden"
    >
      {/* 背景のほのかなグロー効果 */}
      <div
        className="absolute -right-16 -top-16 w-36 h-36 rounded-full blur-3xl pointer-events-none opacity-15 transition-opacity group-hover:opacity-25"
        style={{ backgroundColor: badge.color }}
      />

      <div>
        {/* ヘッダー: 都道府県・地域・タグ */}
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-sky-400 border border-sky-400/20 flex-shrink-0">
              {resort.prefecture}
            </span>
            <span className="text-xs text-slate-400 truncate">
              {resort.areaName}
            </span>
          </div>

          {/* ゴルフTha Day風のバッジ */}
          <span
            className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border flex-shrink-0 shadow-sm"
            style={{
              backgroundColor: badge.bgLight,
              color: badge.color,
              borderColor: badge.color + '40'
            }}
          >
            {badge.level}
          </span>
        </div>

        {/* スキー場名 */}
        <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-sky-300 transition-colors line-clamp-1 mb-0.5">
          {resort.name}
        </h3>
        <p className="text-[11px] text-slate-400 mb-3 truncate flex items-center gap-1.5">
          <span className="text-sky-400 font-medium">#{resort.tag}</span>
          <span className="text-slate-600">•</span>
          <span>標高 {resort.baseElevation}m - {resort.topElevation}m</span>
        </p>

        {/* メインセクション: 円形ゲージ + 天気 + 概要 */}
        <div className="flex items-center justify-between py-2 border-y border-slate-800/80 mb-3">
          <div className="flex items-center gap-3">
            <ScoreGauge score={score} size={74} strokeWidth={7} badge={badge} />
            <div>
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Condition
              </div>
              <div className="text-xs sm:text-sm font-bold text-white mt-0.5" style={{ color: badge.color }}>
                {badge.title}
              </div>
              <div className="text-[10px] text-slate-400 line-clamp-2 max-w-[130px] sm:max-w-[160px] mt-0.5 leading-tight">
                {badge.comment}
              </div>
            </div>
          </div>

          <div className="text-right flex flex-col items-end justify-center pl-2 flex-shrink-0">
            <div className="p-1.5 bg-slate-800/70 rounded-xl border border-slate-700/50 mb-0.5">
              <WeatherIcon name={current.weatherInfo.icon} className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-medium text-slate-300 whitespace-nowrap">
              {current.weatherInfo.label}
            </span>
          </div>
        </div>

        {/* 4大パラメータグリッド (スマホで2x2) */}
        <div className="grid grid-cols-2 gap-1.5 sm:gap-2 text-xs">
          {/* 12時間降雪 */}
          <div className="p-2 rounded-xl bg-slate-800/50 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400">
              <span className="flex items-center gap-1 text-[10px]">
                <Snowflake className="w-3 h-3 text-cyan-400 flex-shrink-0" />
                12h新雪
              </span>
              <span className="font-outfit font-bold text-cyan-300 text-xs sm:text-sm">
                {current.freshSnow12h > 0 ? `+${current.freshSnow12h}cm` : '0cm'}
              </span>
            </div>
          </div>

          {/* 積雪深 */}
          <div className={`p-2 rounded-xl border ${current.snowDepthCm <= 0 ? 'bg-slate-900 border-slate-800 text-slate-500' : 'bg-slate-800/50 border-slate-800'}`}>
            <div className="flex items-center justify-between text-slate-400">
              <span className="flex items-center gap-1 text-[10px]">
                <Mountain className="w-3 h-3 text-indigo-400 flex-shrink-0" />
                積雪深
                {current.isArtificial && (
                  <span className="px-1 py-0.2 rounded text-[9px] bg-sky-500/20 text-sky-300 font-bold">
                    公式
                  </span>
                )}
              </span>
              <div className="text-right">
                <span className="font-outfit font-bold text-slate-200 text-xs sm:text-sm">
                  {current.snowDepthCm}cm
                </span>
                {current.isArtificial && (
                  <span className="block text-[9px] text-slate-400 font-normal leading-none mt-0.5">
                    気象:{current.openMeteoSnowDepthCm ?? 0}cm
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 山頂気温 */}
          <div className="p-2 rounded-xl bg-slate-800/50 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400">
              <span className="flex items-center gap-1 text-[10px]">
                <Thermometer className="w-3 h-3 text-rose-400 flex-shrink-0" />
                山頂気温
              </span>
              <span className="font-outfit font-bold text-slate-200 text-xs sm:text-sm">
                {current.temp > 0 ? `+${current.temp}` : current.temp}℃
              </span>
            </div>
          </div>

          {/* 山頂風速 */}
          <div className={`p-2 rounded-xl border ${isLiftRisk ? 'bg-rose-950/30 border-rose-500/40' : 'bg-slate-800/50 border-slate-800'}`}>
            <div className="flex items-center justify-between text-slate-400">
              <span className="flex items-center gap-1 text-[10px]">
                <Wind className="w-3 h-3 text-sky-400 flex-shrink-0" />
                風速
              </span>
              <span className={`font-outfit font-bold text-xs sm:text-sm ${isLiftRisk ? 'text-rose-400' : 'text-slate-200'}`}>
                {current.windSpeed}m/s
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* フッター: 詳細リンク */}
      <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs text-sky-400 font-semibold group-hover:text-sky-300 transition-colors">
        <span className="text-[11px] text-slate-400">詳細・週間予報</span>
        <div className="flex items-center gap-1">
          <span>詳細を見る</span>
          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </div>
  );
};
