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
      className="group relative bg-slate-900/80 hover:bg-slate-850/90 border border-slate-800 hover:border-sky-500/50 rounded-2xl p-5 cursor-pointer transition-all duration-300 shadow-lg hover:shadow-sky-500/10 hover:-translate-y-1 flex flex-col justify-between backdrop-blur-md overflow-hidden"
    >
      {/* 背景のほのかなグロー効果 */}
      <div
        className="absolute -right-16 -top-16 w-40 h-40 rounded-full blur-3xl pointer-events-none opacity-20 transition-opacity group-hover:opacity-40"
        style={{ backgroundColor: badge.color }}
      />

      <div>
        {/* ヘッダー: 都道府県・地域・タグ */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-sky-400 border border-sky-400/20">
              {resort.prefecture}
            </span>
            <span className="text-xs text-slate-400">
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
        <h3 className="text-lg font-bold text-white group-hover:text-sky-300 transition-colors line-clamp-1 mb-1">
          {resort.name}
        </h3>
        <p className="text-xs text-slate-400 mb-4 flex items-center gap-2">
          <span className="text-sky-400 font-medium">#{resort.tag}</span>
          <span className="text-slate-600">•</span>
          <span>標高 {resort.baseElevation}m - {resort.topElevation}m</span>
        </p>

        {/* メインセクション: 円形ゲージ + 天気 + 概要 */}
        <div className="flex items-center justify-between gap-4 py-2 border-y border-slate-800/80 mb-4">
          <div className="flex items-center gap-3">
            <ScoreGauge score={score} size={88} strokeWidth={8} badge={badge} />
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Condition
              </div>
              <div className="text-sm font-bold text-white mt-0.5" style={{ color: badge.color }}>
                {badge.title}
              </div>
              <div className="text-[11px] text-slate-400 line-clamp-2 max-w-[140px] mt-0.5 leading-tight">
                {badge.comment}
              </div>
            </div>
          </div>

          <div className="text-right flex flex-col items-end justify-center pl-2">
            <div className="p-2 bg-slate-800/70 rounded-xl border border-slate-700/50 mb-1">
              <WeatherIcon name={current.weatherInfo.icon} className="w-7 h-7" />
            </div>
            <span className="text-xs font-medium text-slate-300">
              {current.weatherInfo.label}
            </span>
          </div>
        </div>

        {/* 4大パラメータグリッド */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          {/* 12時間降雪 */}
          <div className={`p-2.5 rounded-xl border ${current.freshSnow12h >= 10 ? 'bg-cyan-950/40 border-cyan-500/40 text-cyan-200' : 'bg-slate-800/40 border-slate-800 text-slate-300'}`}>
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="flex items-center gap-1 font-medium text-[11px]">
                <Snowflake className="w-3.5 h-3.5 text-cyan-400" />
                12h新雪
              </span>
              <span className="font-outfit font-bold text-cyan-300">
                {current.freshSnow12h > 0 ? `+${current.freshSnow12h}cm` : '0cm'}
              </span>
            </div>
            <div className="w-full bg-slate-700/50 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-cyan-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (current.freshSnow12h / 25) * 100)}%` }}
              />
            </div>
          </div>

          {/* 積雪深 */}
          <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-800 text-slate-300">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="flex items-center gap-1 font-medium text-[11px]">
                <Mountain className="w-3.5 h-3.5 text-indigo-400" />
                積雪深
              </span>
              <span className="font-outfit font-bold text-slate-200">
                {current.snowDepthCm}cm
              </span>
            </div>
            <div className="w-full bg-slate-700/50 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-indigo-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (current.snowDepthCm / 200) * 100)}%` }}
              />
            </div>
          </div>

          {/* 山頂気温 */}
          <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-800 text-slate-300">
            <div className="flex items-center justify-between text-slate-400">
              <span className="flex items-center gap-1 font-medium text-[11px]">
                <Thermometer className="w-3.5 h-3.5 text-rose-400" />
                山頂気温
              </span>
              <span className="font-outfit font-bold text-slate-200">
                {current.temp > 0 ? `+${current.temp}` : current.temp}℃
              </span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              {current.temp <= -5 ? '❄️ 極上パウダースノー' : current.temp <= 0 ? '👍 良好な雪質' : '⚠️ やや湿雪・緩み'}
            </div>
          </div>

          {/* 山頂風速 */}
          <div className={`p-2.5 rounded-xl border ${isLiftRisk ? 'bg-rose-950/30 border-rose-500/40' : 'bg-slate-800/40 border-slate-800'} text-slate-300`}>
            <div className="flex items-center justify-between text-slate-400">
              <span className="flex items-center gap-1 font-medium text-[11px]">
                <Wind className="w-3.5 h-3.5 text-sky-400" />
                風速
              </span>
              <span className={`font-outfit font-bold ${isLiftRisk ? 'text-rose-400' : 'text-slate-200'}`}>
                {current.windSpeed}m/s
              </span>
            </div>
            <div className="text-[10px] flex items-center gap-1 mt-1">
              {isLiftRisk ? (
                <span className="text-rose-400 font-semibold flex items-center gap-0.5">
                  <AlertTriangle className="w-3 h-3" /> 突風{current.windGust}m 運休注意
                </span>
              ) : (
                <span className="text-emerald-400">リフト運行安定</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* フッター: 詳細リンク */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 group-hover:text-sky-400 transition-colors">
        <span>時間別・週間予報と詳細内訳</span>
        <div className="flex items-center gap-1 font-semibold text-sky-400">
          詳細を見る
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </div>
  );
};
