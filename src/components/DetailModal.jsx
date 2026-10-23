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
  Layers,
  Info,
  ExternalLink,
  ChevronDown
} from 'lucide-react';

export const DetailModal = ({ data, weights, onClose }) => {
  const [activeTab, setActiveTab] = useState('hourly'); // 'hourly' | 'daily' | 'factors'
  if (!data) return null;

  const { resort, current, scoreResult, next24Hours, dailyForecast } = data;
  const { score, badge, factors } = scoreResult;

  // 各指標の割合計算
  const factorRows = [
    {
      label: '12h新雪量',
      icon: <Snowflake className="w-4 h-4 text-cyan-400" />,
      actual: `${current.freshSnow12h} cm`,
      score: factors.freshSnow,
      weight: weights.freshSnow,
      desc: '夜間〜早朝のまとまった降雪があるほど高得点'
    },
    {
      label: 'ゲレンデ積雪深',
      icon: <Mountain className="w-4 h-4 text-indigo-400" />,
      actual: `${current.snowDepthCm} cm`,
      score: factors.snowDepth,
      weight: weights.snowDepth,
      desc: 'ブッシュや小石の露出がなく下地が十分安定しているか'
    },
    {
      label: '山頂気温・雪質',
      icon: <Thermometer className="w-4 h-4 text-rose-400" />,
      actual: `${current.temp} ℃`,
      score: factors.temperature,
      weight: weights.temperature,
      desc: '-10℃〜-3℃のドライパウダー帯が最高得点'
    },
    {
      label: '風速・突風 (リフト安全度)',
      icon: <Wind className="w-4 h-4 text-sky-400" />,
      actual: `${current.windSpeed} m/s (最大 ${current.windGust}m/s)`,
      score: factors.wind,
      weight: weights.wind,
      desc: '風が穏やかなほど高得点。突風15m/s以上は運休リスク大減点'
    },
    {
      label: '天候・視界',
      icon: <Cloud className="w-4 h-4 text-slate-300" />,
      actual: `${current.weatherInfo.label}`,
      score: factors.weather,
      weight: weights.weather,
      desc: '雨や濃霧は減点、晴れ・穏やかな降雪は好評価'
    }
  ];

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 背景アクセント */}
        <div
          className="absolute top-0 right-0 w-72 h-72 rounded-full blur-3xl pointer-events-none opacity-20"
          style={{ backgroundColor: badge.color }}
        />

        {/* ヘッダー */}
        <div className="relative p-6 pb-4 border-b border-slate-800 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-sky-400 border border-sky-400/20">
                {resort.prefecture}
              </span>
              <span className="text-xs text-slate-400">{resort.areaName}</span>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs text-sky-400 font-medium">#{resort.tag}</span>
            </div>
            <h2 className="text-2xl font-black text-white">{resort.name}</h2>
            <p className="text-xs text-slate-400 mt-1">
              山頂 {resort.topElevation}m / 山麓 {resort.baseElevation}m (標高差 {resort.topElevation - resort.baseElevation}m)
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* スコアハイライトエリア */}
        <div className="p-6 bg-gradient-to-b from-slate-850/60 to-slate-900/60 border-b border-slate-800/80">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <ScoreGauge score={score} size={130} strokeWidth={11} badge={badge} />
              <div>
                <span
                  className="px-3 py-1 rounded-md text-xs font-black uppercase tracking-wider border shadow-sm inline-block mb-1.5"
                  style={{
                    backgroundColor: badge.bgLight,
                    color: badge.color,
                    borderColor: badge.color + '50'
                  }}
                >
                  {badge.level} • RANK {badge.rank}
                </span>
                <div className="text-xl font-black text-white">{badge.title}</div>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed max-w-sm">
                  {badge.comment}
                </p>
              </div>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 text-center min-w-[140px]">
              <div className="text-xs font-semibold text-slate-400 mb-1">現在の天気</div>
              <WeatherIcon name={current.weatherInfo.icon} className="w-10 h-10 mx-auto my-1" />
              <div className="text-sm font-bold text-white">{current.weatherInfo.label}</div>
              <div className="text-xs text-sky-300 mt-0.5">{current.temp}℃</div>
            </div>
          </div>
        </div>

        {/* タブセレクター */}
        <div className="flex border-b border-slate-800 bg-slate-900/90 px-6">
          <button
            onClick={() => setActiveTab('hourly')}
            className={`py-3 px-4 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 border-b-2 transition-colors ${
              activeTab === 'hourly'
                ? 'border-sky-400 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            24時間推移
          </button>
          <button
            onClick={() => setActiveTab('daily')}
            className={`py-3 px-4 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 border-b-2 transition-colors ${
              activeTab === 'daily'
                ? 'border-sky-400 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="w-4 h-4" />
            週間7日予報
          </button>
          <button
            onClick={() => setActiveTab('factors')}
            className={`py-3 px-4 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 border-b-2 transition-colors ${
              activeTab === 'factors'
                ? 'border-sky-400 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            スコア詳細内訳
          </button>
        </div>

        {/* タブコンテンツ */}
        <div className="p-6 max-h-[380px] overflow-y-auto">
          {/* 1. 24時間推移 */}
          {activeTab === 'hourly' && (
            <div>
              <div className="text-xs text-slate-400 mb-3 flex items-center justify-between">
                <span>直近24時間の時間帯別コンディション＆スコア予測</span>
                <span className="text-[11px] text-sky-400">横スクロール可能 →</span>
              </div>
              <div className="overflow-x-auto pb-2">
                <div className="flex gap-2 min-w-max">
                  {next24Hours.map((h, i) => (
                    <div
                      key={i}
                      className={`flex flex-col items-center justify-between p-3 rounded-2xl border min-w-[76px] text-center transition-all ${
                        i === 0
                          ? 'bg-sky-950/40 border-sky-400/60 shadow-md'
                          : 'bg-slate-800/40 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="text-xs font-semibold text-slate-400">
                        {h.time}
                      </div>
                      <WeatherIcon name={h.weatherInfo.icon} className="w-6 h-6 my-2" />
                      <div className="text-sm font-bold text-white mb-0.5">
                        {h.temp}℃
                      </div>
                      <div className="text-[10px] text-cyan-300 font-medium mb-2">
                        {h.snowfall > 0 ? `+${h.snowfall}cm` : '-'}
                      </div>
                      <div className="text-[10px] text-slate-400 mb-2">
                        {h.windSpeed}m/s
                      </div>
                      {/* ミニスコアバッジ */}
                      <div
                        className="w-full py-1 rounded-lg text-xs font-outfit font-black"
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
            <div className="space-y-2">
              <div className="text-xs text-slate-400 mb-3">
                今後7日間の日別スノースコア予測（積雪量と天候変化）
              </div>
              {dailyForecast.map((d, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${
                    d.isToday
                      ? 'bg-sky-950/30 border-sky-500/40'
                      : 'bg-slate-800/30 border-slate-800/80 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-[90px]">
                    <span className="font-outfit font-bold text-sm text-white">
                      {d.date}
                    </span>
                    <span
                      className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                        d.dayName === '日'
                          ? 'text-rose-400 bg-rose-950/40'
                          : d.dayName === '土'
                          ? 'text-sky-400 bg-sky-950/40'
                          : 'text-slate-400'
                      }`}
                    >
                      ({d.dayName})
                    </span>
                  </div>

                  <div className="flex items-center gap-2 min-w-[120px]">
                    <WeatherIcon name={d.weatherInfo.icon} className="w-5 h-5" />
                    <span className="text-xs text-slate-300">{d.weatherInfo.label}</span>
                  </div>

                  <div className="text-xs text-right min-w-[70px]">
                    <span className="text-rose-400 font-semibold">{d.tempMax}℃</span>
                    <span className="text-slate-500 mx-1">/</span>
                    <span className="text-sky-400 font-semibold">{d.tempMin}℃</span>
                  </div>

                  <div className="text-xs text-cyan-300 font-bold min-w-[60px] text-right">
                    {d.snowfallSum > 0 ? `降雪 ${d.snowfallSum}cm` : '降雪なし'}
                  </div>

                  <div
                    className="px-2.5 py-1 rounded-lg text-xs font-outfit font-black min-w-[48px] text-center"
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
            <div className="space-y-4">
              <div className="text-xs text-slate-400">
                現在の重み付け配分に基づく5大指標の個別得点と評価理由
              </div>
              {factorRows.map((f, i) => (
                <div key={i} className="p-3.5 bg-slate-800/40 border border-slate-800 rounded-xl">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      {f.icon}
                      <span className="text-sm font-bold text-white">{f.label}</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-sky-400 font-semibold">
                        重み: {f.weight}%
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-400 font-mono">{f.actual}</span>
                      <span className="font-outfit font-black text-sm text-white">
                        {f.score} <span className="text-[10px] text-slate-400 font-normal">/ 100</span>
                      </span>
                    </div>
                  </div>

                  {/* プログレスバー */}
                  <div className="w-full bg-slate-700/40 h-2 rounded-full overflow-hidden mb-1.5">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${f.score}%`,
                        backgroundColor:
                          f.score >= 80 ? '#38bdf8' : f.score >= 60 ? '#10b981' : f.score >= 40 ? '#f59e0b' : '#ef4444'
                      }}
                    />
                  </div>
                  <div className="text-[11px] text-slate-400">{f.desc}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* フッター */}
        <div className="p-4 px-6 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            データ元: Open-Meteo 高度補正気象API (山頂標高基準)
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};
