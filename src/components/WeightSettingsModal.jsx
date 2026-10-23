import React, { useState } from 'react';
import { PRESETS } from '../utils/scoring';
import { X, Sliders, RotateCcw, Check, Sparkles, Snowflake, Mountain, Thermometer, Wind, Cloud } from 'lucide-react';

export const WeightSettingsModal = ({ weights, onSave, onClose }) => {
  const [currentWeights, setCurrentWeights] = useState({ ...weights });
  const [selectedPresetId, setSelectedPresetId] = useState(() => {
    const found = PRESETS.find(
      (p) =>
        p.weights.freshSnow === weights.freshSnow &&
        p.weights.snowDepth === weights.snowDepth &&
        p.weights.temperature === weights.temperature &&
        p.weights.wind === weights.wind &&
        p.weights.weather === weights.weather
    );
    return found ? found.id : 'custom';
  });

  const handlePresetSelect = (preset) => {
    setSelectedPresetId(preset.id);
    setCurrentWeights({ ...preset.weights });
  };

  const handleSliderChange = (key, val) => {
    setSelectedPresetId('custom');
    setCurrentWeights((prev) => ({
      ...prev,
      [key]: parseInt(val, 10)
    }));
  };

  const total =
    currentWeights.freshSnow +
    currentWeights.snowDepth +
    currentWeights.temperature +
    currentWeights.wind +
    currentWeights.weather;

  const handleApply = () => {
    // 100%に正規化して保存
    if (total === 0) return;
    const factor = 100 / total;
    const normalized = {
      freshSnow: Math.round(currentWeights.freshSnow * factor),
      snowDepth: Math.round(currentWeights.snowDepth * factor),
      temperature: Math.round(currentWeights.temperature * factor),
      wind: Math.round(currentWeights.wind * factor),
      weather: 100 - (
        Math.round(currentWeights.freshSnow * factor) +
        Math.round(currentWeights.snowDepth * factor) +
        Math.round(currentWeights.temperature * factor) +
        Math.round(currentWeights.wind * factor)
      )
    };
    onSave(normalized);
    onClose();
  };

  const handleReset = () => {
    const defaultPreset = PRESETS[0];
    setSelectedPresetId(defaultPreset.id);
    setCurrentWeights({ ...defaultPreset.weights });
  };

  const sliders = [
    {
      key: 'freshSnow',
      label: '12時間新雪量',
      icon: <Snowflake className="w-4 h-4 text-cyan-400" />,
      desc: 'パウダーや深雪ランを最優先'
    },
    {
      key: 'snowDepth',
      label: '積雪深 (ベース雪)',
      icon: <Mountain className="w-4 h-4 text-indigo-400" />,
      desc: 'ブッシュ無しの安心コースコンディション'
    },
    {
      key: 'temperature',
      label: '気温・雪質 (氷点下)',
      icon: <Thermometer className="w-4 h-4 text-rose-400" />,
      desc: '軽やかな雪質やシャバ雪の回避'
    },
    {
      key: 'wind',
      label: '風速・突風 (リフト運行)',
      icon: <Wind className="w-4 h-4 text-sky-400" />,
      desc: 'リフトの安全運行・体感温度の維持'
    },
    {
      key: 'weather',
      label: '天候・視界 (晴天/降雪)',
      icon: <Cloud className="w-4 h-4 text-slate-300" />,
      desc: '視界の良さ・雨天の絶対回避'
    }
  ];

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div
        className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-sky-50 border border-sky-200 rounded-xl text-sky-600">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">スコア評価の重み設定</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                あなたの滑走スタイルに合わせてスコア配分をカスタマイズ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* プリセット選択 */}
        <div className="p-6 border-b border-slate-100 space-y-3 bg-slate-50/50">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-sky-600" />
            おすすめプリセット
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {PRESETS.map((p) => {
              const active = selectedPresetId === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => handlePresetSelect(p)}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    active
                      ? 'bg-sky-50 border-sky-400 text-slate-900 shadow-sm ring-1 ring-sky-400/30'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-slate-900">{p.name}</span>
                    {active && <Check className="w-3.5 h-3.5 text-sky-600 font-bold" />}
                  </div>
                  <div className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">
                    {p.desc}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* スライダー調整 */}
        <div className="p-6 space-y-4 max-h-[300px] overflow-y-auto">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>各指標の重要度 (0〜100)</span>
            <span className="font-mono text-sky-700 font-bold">
              合計比率: {total}%
            </span>
          </div>

          {sliders.map((s) => {
            const val = currentWeights[s.key];
            const percent = total > 0 ? Math.round((val / total) * 100) : 0;
            return (
              <div key={s.key} className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 font-bold text-slate-800">
                    {s.icon}
                    {s.label}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-[11px]">影響度:</span>
                    <span className="font-outfit font-black text-sky-700 text-sm">
                      {percent}%
                    </span>
                  </div>
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={val}
                  onChange={(e) => handleSliderChange(s.key, e.target.value)}
                  className="w-full accent-sky-500 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                />

                <div className="text-[10px] text-slate-500">{s.desc}</div>
              </div>
            );
          })}
        </div>

        {/* アクションボタン */}
        <div className="p-4 px-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            初期値に戻す
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
            >
              キャンセル
            </button>
            <button
              onClick={handleApply}
              className="px-5 py-2 rounded-xl text-xs font-black bg-sky-500 hover:bg-sky-600 text-white shadow-md shadow-sky-500/20 transition-all hover:scale-105"
            >
              スコアを再計算
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
