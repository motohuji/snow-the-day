import React, { useState } from 'react';
import { ScoreGauge } from './ScoreGauge';
import { WeatherIcon } from './WeatherIcon';
import {
  X,
  Snowflake,
  Mountain,
  Wind,
  Thermometer,
  Cloud,
  Clock,
  Calendar,
  Layers
} from 'lucide-react';

export const DetailModal = ({ data, weights, onClose }) => {
  const [activeTab, setActiveTab] = useState('hourly'); // 'hourly' | 'daily' | 'factors'
  if (!data) return null;

  const { resort, current, scoreResult, next24Hours, dailyForecast } = data;
  const { score, badge, factors } = scoreResult;

  const factorRows = [
    {
      label: '12h新雪量',
      icon: <Snowflake className="w-3.5 h-3.5 text-cyan-400" />,
      actual: `${current.freshSnow12h} cm`,
      score: factors.freshSnow,
      weight: weights.freshSnow,
      desc: '夜間〜早朝のまとまった降雪があるほど高得点'
    },
    {
      label: 'ゲレンデ積雪深',
      icon: <Mountain className="w-3.5 h-3.5 text-indigo-400" />,
      actual: current.isArtificial
        ? `${current.snowDepthCm} cm (公式・人工) / 気象:${current.openMeteoSnowDepthCm ?? 0} cm`
        : `${current.snowDepthCm} cm`,
      score: factors.snowDepth,
      weight: weights.snowDepth,
      desc: current.isArtificial
        ? `公式発表/実測の積雪深(${current.snowDepthCm}cm)でスコア算出中。参考として気象モデル(Open-Meteo)の自然積雪量は ${current.openMeteoSnowDepthCm ?? 0}cm です。`
        : 'ブッシュや小石の露出がなく下地が十分安定しているか'
    },
    {
      label: '山頂気温・雪質',
      icon: <Thermometer className="w-3.5 h-3.5 text-rose-400" />,
      actual: `${current.temp} ℃`,
      score: factors.temperature,
      weight: weights.temperature,
      desc: '-10℃〜-3℃のドライパウダー帯が最高得点'
    },
    {
      label: '風速 (リフト運行)',
      icon: <Wind className="w-3.5 h-3.5 text-sky-400" />,
      actual: `${current.windSpeed} m/s`,
      score: factors.wind,
      weight: weights.wind,
      desc: '風が穏やかなほど高得点。突風15m/s以上は運休リスク大減点'
    },
    {
      label: '天候・視界',
      icon: <Cloud className="w-3.5 h-3.5 text-slate-300" />,
      actual: `${current.weatherInfo.label}`,
      score: factors.weather,
      weight: weights.weather,
      desc: '雨や濃霧は減点、晴れ・穏やかな降雪は好評価'
    }
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-slate-900 border-t sm:border border-slate-700/80 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col animate-slide-up pb-safe"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 背景アクセント */}
        <div
          className="absolute top-0 right-0 w-60 h-60 rounded-full blur-3xl pointer-events-none opacity-15"
          style={{ backgroundColor: badge.color }}
        />

        {/* ボトムシートドラッグハンドル (スマホのみ) */}
        <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto my-2.5 sm:hidden flex-shrink-0" />

        {/* ヘッダー */}
        <div className="relative p-4 sm:p-5 border-b border-slate-800 flex items-start justify-between flex-shrink-0">
          <div className="min-w-0 pr-3">
            <div className="flex items-center gap-1.5 mb-1 flex-wrap">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-sky-400 border border-sky-400/20">
                {resort.prefecture}
              </span>
              <span className="text-xs text-slate-400 truncate">{resort.areaName}</span>
              <span className="text-slate-600 hidden xs:inline">•</span>
              <span className="text-xs text-sky-400 font-medium hidden xs:inline">#{resort.tag}</span>
            </div>
            <h2 className="text-lg sm:text-2xl font-black text-white leading-tight truncate">
              {resort.name}
            </h2>
            <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5">
              標高 {resort.baseElevation}m〜{resort.topElevation}m (標高差 {resort.topElevation - resort.baseElevation}m)
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* スコアハイライトエリア */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border-b border-slate-800 flex items-center justify-between gap-3 sm:gap-6 flex-shrink-0">
          <div className="flex items-center gap-3 sm:gap-5 min-w-0">
            <ScoreGauge
              score={score}
              size={window.innerWidth < 640 ? 84 : 105}
              strokeWidth={window.innerWidth < 640 ? 8 : 10}
              badge={badge}
            />
            <div className="min-w-0">
              <span
                className="px-2 py-0.5 rounded text-[10px] sm:text-xs font-black uppercase tracking-wider border inline-block mb-1"
                style={{
                  backgroundColor: badge.bgLight,
                  color: badge.color,
                  borderColor: badge.color + '50'
                }}
              >
                {badge.level} • RANK {badge.rank}
              </span>
              <div className="text-sm sm:text-lg font-bold text-white truncate">{badge.title}</div>
              <p className="text-[11px] text-slate-300 mt-0.5 line-clamp-2 leading-tight">
                {badge.comment}
              </p>
            </div>
          </div>

          <div className="text-center p-2 sm:p-3 rounded-xl bg-slate-800/70 border border-slate-700 flex-shrink-0 min-w-[72px] sm:min-w-[90px]">
            <WeatherIcon name={current.weatherInfo.icon} className="w-6 h-6 sm:w-8 sm:h-8 mx-auto" />
            <div className="text-[10px] sm:text-xs font-bold text-white mt-0.5">{current.weatherInfo.label}</div>
            <div className="text-[10px] text-sky-300 font-outfit">{current.temp}℃</div>
          </div>
        </div>

        {/* タブセレクター */}
        <div className="flex border-b border-slate-800 bg-slate-950/80 px-2 sm:px-6 flex-shrink-0">
          <button
            onClick={() => setActiveTab('hourly')}
            className={`flex-1 py-2.5 sm:py-3 text-center text-xs font-bold transition-colors border-b-2 flex items-center justify-center gap-1 ${
              activeTab === 'hourly'
                ? 'border-sky-400 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>24時間推移</span>
          </button>
          <button
            onClick={() => setActiveTab('daily')}
            className={`flex-1 py-2.5 sm:py-3 text-center text-xs font-bold transition-colors border-b-2 flex items-center justify-center gap-1 ${
              activeTab === 'daily'
                ? 'border-sky-400 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>週間7日予報</span>
          </button>
          <button
            onClick={() => setActiveTab('factors')}
            className={`flex-1 py-2.5 sm:py-3 text-center text-xs font-bold transition-colors border-b-2 flex items-center justify-center gap-1 ${
              activeTab === 'factors'
                ? 'border-sky-400 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>スコア内訳</span>
          </button>
        </div>

        {/* タブコンテンツ */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {/* 1. 24時間推移 */}
          {activeTab === 'hourly' && (
            <div>
              <div className="text-[11px] text-slate-400 mb-2.5 flex items-center justify-between">
                <span>時間帯別のコンディション予測</span>
                <span className="text-[10px] text-sky-400">横スワイプ可能 →</span>
              </div>
              <div className="overflow-x-auto pb-2 scrollbar-none -mx-1 px-1">
                <div className="flex gap-2 min-w-max">
                  {next24Hours.map((h, i) => (
                    <div
                      key={i}
                      className={`flex flex-col items-center justify-between p-2.5 rounded-xl border min-w-[64px] sm:min-w-[72px] text-center transition-all ${
                        i === 0
                          ? 'bg-sky-950/40 border-sky-400/60 shadow-md'
                          : 'bg-slate-800/40 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="text-[11px] font-semibold text-slate-400">
                        {h.time}
                      </div>
                      <div className="my-1">
                        <WeatherIcon name={h.weatherInfo.icon} className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      <div className="text-xs font-bold text-white font-outfit">
                        {h.temp}℃
                      </div>
                      <div className="text-[10px] text-cyan-300 font-medium font-outfit mt-0.5">
                        {h.snowfall > 0 ? `+${h.snowfall}cm` : '-'}
                      </div>
                      <div
                        className="w-full py-0.5 rounded-md text-[10px] font-outfit font-black mt-1.5"
                        style={{
                          backgroundColor: h.badge.bgLight,
                          color: h.badge.color
                        }}
                      >
                        {h.score}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 2. 週間7日予報 */}
          {activeTab === 'daily' && (
            <div className="space-y-1.5">
              <div className="text-[11px] text-slate-400 mb-1">
                今後7日間の日別スノースコア予測
              </div>
              {dailyForecast.map((d, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between p-2.5 rounded-xl border transition-colors text-xs gap-2 ${
                    d.isToday
                      ? 'bg-sky-950/30 border-sky-500/40'
                      : 'bg-slate-800/30 border-slate-800/80 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-1.5 min-w-[78px]">
                    <span className="font-outfit font-bold text-white">
                      {d.date}
                    </span>
                    <span
                      className={`text-[10px] font-bold ${
                        d.dayName === '日'
                          ? 'text-rose-400'
                          : d.dayName === '土'
                          ? 'text-sky-400'
                          : 'text-slate-400'
                      }`}
                    >
                      ({d.dayName})
                    </span>
                  </div>

                  <div className="flex items-center gap-1 min-w-[90px]">
                    <WeatherIcon name={d.weatherInfo.icon} className="w-4 h-4 flex-shrink-0" />
                    <span className="text-[11px] text-slate-300 truncate">{d.weatherInfo.label}</span>
                  </div>

                  <div className="text-slate-300 text-[11px] font-outfit text-right min-w-[65px]">
                    <span className="text-rose-300">{d.tempMax}℃</span>
                    <span className="text-slate-500 mx-0.5">/</span>
                    <span className="text-sky-300">{d.tempMin}℃</span>
                  </div>

                  <div className="text-xs text-cyan-300 font-bold font-outfit text-right min-w-[45px]">
                    {d.snowfallSum > 0 ? `+${d.snowfallSum}cm` : '-'}
                  </div>

                  <div
                    className="px-2 py-0.5 rounded-lg text-xs font-outfit font-black min-w-[38px] text-center"
                    style={{
                      backgroundColor: d.badge.bgLight,
                      color: d.badge.color
                    }}
                  >
                    {d.score}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 3. スコア詳細内訳 */}
          {activeTab === 'factors' && (
            <div className="space-y-2.5">
              <div className="text-[11px] text-slate-400 mb-1">
                現在の重み付け配分に基づく5大指標の個別得点
              </div>
              {factorRows.map((f, i) => (
                <div key={i} className="p-2.5 bg-slate-800/40 border border-slate-800 rounded-xl space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      {f.icon}
                      <span className="font-bold text-white text-xs">{f.label}</span>
                      <span className="text-[10px] text-sky-400">({f.weight}%)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400 font-mono">{f.actual}</span>
                      <span className="font-outfit font-black text-xs text-white">
                        {f.score}点
                      </span>
                    </div>
                  </div>

                  <div className="w-full bg-slate-700/40 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${f.score}%`,
                        backgroundColor:
                          f.score >= 80 ? '#38bdf8' : f.score >= 60 ? '#10b981' : f.score >= 40 ? '#f59e0b' : '#ef4444'
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* フッター */}
        <div className="p-3 sm:p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between flex-shrink-0">
          <span className="text-[10px] text-slate-500">
            Open-Meteo 高度補正気象API (山頂基準)
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};
