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
      className="group relative bg-white hover:bg-slate-50/90 border border-slate-200/90 hover:border-sky-400 rounded-2xl p-5 cursor-pointer transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-sky-500/10 hover:-translate-y-1 flex flex-col justify-between overflow-hidden"
    >
      {/* 背景のほのかなグロー効果 */}
      <div
        className="absolute -right-16 -top-16 w-40 h-40 rounded-full blur-3xl pointer-events-none opacity-10 transition-opacity group-hover:opacity-20"
        style={{ backgroundColor: badge.color }}
      />

      <div>
        {/* ヘッダー: 都道府県・地域・タグ */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200/60">
              {resort.prefecture}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              {resort.areaName}
            </span>
          </div>

          {/* ゴルフTha Day風のバッジ */}
          <span
            className="px-2.5 py-0.5 rounded-md text-[11px] font-black uppercase tracking-wider border shadow-sm"
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
        <h3 className="text-lg font-bold text-slate-900 group-hover:text-sky-600 transition-colors line-clamp-1 mb-1">
          {resort.name}
        </h3>
        <p className="text-xs text-slate-500 mb-4 flex items-center gap-2">
          <span className="text-sky-600 font-medium">#{resort.tag}</span>
          <span className="text-slate-300">•</span>
          <span>標高 {resort.baseElevation}m - {resort.topElevation}m</span>
        </p>

        {/* メインセクション: 円形ゲージ + 天気 + 概要 */}
        <div className="flex items-center justify-between gap-4 py-2 border-y border-slate-100 mb-4">
          <div className="flex items-center gap-3">
            <ScoreGauge score={score} size={84} strokeWidth={8} badge={badge} />
            <div className="space-y-0.5">
              <div className="text-sm font-bold text-slate-800 leading-snug">
                {badge.title}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <WeatherIcon type={current.weatherInfo.type} className="w-4 h-4 text-sky-500" />
                <span>{current.weatherInfo.label}</span>
              </div>
            </div>
          </div>

          <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-sky-500 group-hover:translate-x-1 transition-all flex-shrink-0" />
        </div>

        {/* コメント */}
        <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 mb-4 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
          {badge.comment}
        </p>
      </div>

      {/* ボトムメトリクス 4分割グリッド */}
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2 text-xs">
          {/* 12h新雪量 */}
          <div className="flex items-center gap-2 bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
            <Snowflake className="w-4 h-4 text-sky-500 flex-shrink-0" />
            <div className="min-w-0">
              <span className="text-[10px] text-slate-500 block">12h新雪</span>
              <span className="font-bold text-slate-900 font-outfit">
                +{current.freshSnow12h} <span className="text-[10px] font-normal text-slate-500">cm</span>
              </span>
            </div>
          </div>

          {/* 積雪深 */}
          <div className="flex items-center gap-2 bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
            <Mountain className="w-4 h-4 text-indigo-500 flex-shrink-0" />
            <div className="min-w-0">
              <span className="text-[10px] text-slate-500 block">積雪深</span>
              <span className="font-bold text-slate-900 font-outfit">
                {current.snowDepthCm} <span className="text-[10px] font-normal text-slate-500">cm</span>
              </span>
            </div>
          </div>

          {/* 山頂気温 */}
          <div className="flex items-center gap-2 bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
            <Thermometer className="w-4 h-4 text-rose-500 flex-shrink-0" />
            <div className="min-w-0">
              <span className="text-[10px] text-slate-500 block">山頂気温</span>
              <span className="font-bold text-slate-900 font-outfit">
                {current.temp} <span className="text-[10px] font-normal text-slate-500">℃</span>
              </span>
            </div>
          </div>

          {/* 風速 */}
          <div className="flex items-center gap-2 bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
            <Wind className="w-4 h-4 text-sky-500 flex-shrink-0" />
            <div className="min-w-0">
              <span className="text-[10px] text-slate-500 block">風速</span>
              <span className="font-bold text-slate-900 font-outfit">
                {current.windSpeed} <span className="text-[10px] font-normal text-slate-500">m/s</span>
              </span>
            </div>
          </div>
        </div>

        {/* リフト運休リスク警告 */}
        {isLiftRisk && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-semibold">
            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 text-amber-600" />
            <span className="truncate">突風 {current.windGust}m/s: リフト運休の可能性あり</span>
          </div>
        )}
      </div>
    </div>
  );
};
