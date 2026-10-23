import React from 'react';
import { Sliders, RefreshCw, Snowflake, Compass } from 'lucide-react';
import { PRESETS } from '../utils/scoring';

export const Navbar = ({ weights, onOpenWeights, onRefresh, isRefreshing, lastUpdated }) => {
  // 現在のプリセット名を取得
  const currentPreset = PRESETS.find(
    (p) =>
      p.weights.freshSnow === weights.freshSnow &&
      p.weights.snowDepth === weights.snowDepth &&
      p.weights.temperature === weights.temperature &&
      p.weights.wind === weights.wind &&
      p.weights.weather === weights.weather
  );
  const presetName = currentPreset ? currentPreset.name : 'カスタム設定';

  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 py-3 flex items-center justify-between gap-4">
        {/* ロゴ・タイトル */}
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-600 to-cyan-400 p-0.5 shadow-lg shadow-sky-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Snowflake className="w-5 h-5 text-sky-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-outfit font-black text-xl tracking-tight text-white flex items-center gap-1.5">
                SKI <span className="text-sky-400">THE DAY</span>
              </h1>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-sky-500/10 text-sky-400 border border-sky-400/20">
                PRO SCORE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden xs:block">
              気象AIが算出する本日の全国ゲレンデコンディション評価
            </p>
          </div>
        </div>

        {/* コントロール群 */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* 現在の重視モード */}
          <button
            onClick={onOpenWeights}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 hover:border-sky-400/50 text-slate-200 text-xs font-semibold shadow-sm transition-all hover:bg-slate-850"
            title="スコアの評価配分を変更"
          >
            <Sliders className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline text-slate-400 text-[11px]">評価モード:</span>
            <span className="text-sky-300 font-bold">{presetName}</span>
          </button>

          {/* 更新ボタン */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-semibold transition-all disabled:opacity-50"
            title="最新の気象予報を取得"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-sky-400' : ''}`} />
            <span className="hidden md:inline">更新</span>
          </button>
        </div>
      </div>
    </header>
  );
};
