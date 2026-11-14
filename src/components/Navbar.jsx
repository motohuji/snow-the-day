import React from 'react';
import { Sliders, RefreshCw, Snowflake } from 'lucide-react';
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
  const presetName = currentPreset ? currentPreset.name : 'カスタム';

  return (
    <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-xl border-b border-slate-800/80 transition-all pt-safe">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-2.5 sm:py-3.5 flex items-center justify-between gap-2 sm:gap-4">
        {/* ロゴ・タイトル */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-sky-600 to-cyan-400 p-0.5 shadow-md shadow-sky-500/20 flex-shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[10px] sm:rounded-[14px] flex items-center justify-center">
              <Snowflake className="w-4 h-4 sm:w-5 sm:h-5 text-sky-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="font-outfit font-black text-base sm:text-xl tracking-tight text-white flex items-center gap-1.5 leading-tight">
                SNOW <span className="text-sky-400">THE DAY</span>
              </h1>
              <span className="hidden xs:inline-block px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-sky-500/10 text-sky-400 border border-sky-400/20">
                LIVE
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-400 hidden sm:block">
              気象AIが算出する本日の全国ゲレンデコンディション評価
            </p>
          </div>
        </div>

        {/* コントロール群 */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* 現在の重視モード */}
          <button
            onClick={onOpenWeights}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 hover:border-sky-400/50 text-slate-200 text-xs font-semibold shadow-sm transition-all active:scale-95"
            title="スコアの評価配分を変更"
          >
            <Sliders className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline text-slate-400 text-[11px]">重視:</span>
            <span className="text-sky-300 font-bold max-w-[85px] sm:max-w-none truncate">{presetName}</span>
          </button>

          {/* 更新ボタン */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-semibold transition-all active:scale-95 disabled:opacity-50 shadow-sm flex items-center gap-1"
            title="最新の気象予報を取得"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-sky-400' : ''}`} />
            <span className="hidden sm:inline">{isRefreshing ? '更新中' : '更新'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
