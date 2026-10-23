import React, { useState, useEffect, useMemo } from 'react';
import { REGIONS, RESORTS } from './data/resorts';
import { PRESETS } from './utils/scoring';
import { fetchResortWeather } from './utils/weatherApi';
import { Navbar } from './components/Navbar';
import { ResortCard } from './components/ResortCard';
import { DetailModal } from './components/DetailModal';
import { WeightSettingsModal } from './components/WeightSettingsModal';
import { ScoreGauge } from './components/ScoreGauge';
import { WeatherIcon } from './components/WeatherIcon';
import { SkiMap } from './components/SkiMap';
import {
  Search,
  ArrowUpDown,
  Sparkles,
  Snowflake,
  Wind,
  Mountain,
  ChevronRight,
  Sliders,
  Filter,
  MapPin,
  LayoutGrid
} from 'lucide-react';

const STORAGE_KEY = 'ski_the_day_weights_v1';

export default function App() {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'map'
  // 重み設定
  const [weights, setWeights] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return PRESETS[0].weights;
  });

  const [resortDataList, setResortDataList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [sortBy, setSortBy] = useState('score'); // 'score' | 'freshSnow' | 'snowDepth' | 'wind' | 'temp'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedResortData, setSelectedResortData] = useState(null);
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('');

  // 天気データフェッチ
  const loadAllResortData = async (currentWeights, isSilent = false) => {
    if (!isSilent) setLoading(true);
    setRefreshing(true);

    try {
      // 全スキー場の天気を並列取得（Open-Meteoは無料・レート制限余裕あり）
      const promises = RESORTS.map((resort) => fetchResortWeather(resort, currentWeights));
      const results = await Promise.all(promises);
      setResortDataList(results);
      setLastUpdated(new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }));
    } catch (err) {
      console.error('Error fetching resort data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // 初回マウント時
  useEffect(() => {
    loadAllResortData(weights);
  }, []);

  // 重み変更時、即時再計算
  const handleSaveWeights = (newWeights) => {
    setWeights(newWeights);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newWeights));
    } catch (e) {}
    // 既存のデータを新重みで再計算
    loadAllResortData(newWeights, true);
  };

  // フィルタリング & ソート
  const filteredAndSortedResorts = useMemo(() => {
    let list = [...resortDataList];

    // 地域フィルター
    if (selectedRegion !== 'all') {
      list = list.filter((item) => item.resort.region === selectedRegion);
    }

    // 検索クエリ
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (item) =>
          item.resort.name.toLowerCase().includes(q) ||
          item.resort.prefecture.toLowerCase().includes(q) ||
          item.resort.areaName.toLowerCase().includes(q) ||
          item.resort.tag.toLowerCase().includes(q)
      );
    }

    // ソート
    list.sort((a, b) => {
      if (sortBy === 'score') {
        return b.scoreResult.score - a.scoreResult.score;
      }
      if (sortBy === 'freshSnow') {
        return b.current.freshSnow12h - a.current.freshSnow12h;
      }
      if (sortBy === 'snowDepth') {
        return b.current.snowDepthCm - a.current.snowDepthCm;
      }
      if (sortBy === 'wind') {
        return a.current.windSpeed - b.current.windSpeed; // 風が弱い順
      }
      if (sortBy === 'temp') {
        return a.current.temp - b.current.temp; // 気温が低い順（冷え込み順）
      }
      return 0;
    });

    return list;
  }, [resortDataList, selectedRegion, sortBy, searchQuery]);

  // 今日のトップスキー場
  const topResort = useMemo(() => {
    if (!resortDataList.length) return null;
    return [...resortDataList].sort((a, b) => b.scoreResult.score - a.scoreResult.score)[0];
  }, [resortDataList]);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 pb-20 selection:bg-sky-500 selection:text-white">
      {/* ナビゲーションバー */}
      <Navbar
        weights={weights}
        onOpenWeights={() => setShowWeightModal(true)}
        onRefresh={() => loadAllResortData(weights)}
        isRefreshing={refreshing}
        lastUpdated={lastUpdated}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-8">
        {/* ヒーローセクション: 明るいスノーホワイト＆スカイブルー */}
        {topResort && (
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-white via-sky-50/70 to-white border border-sky-200/90 p-6 sm:p-8 shadow-xl backdrop-blur-xl">
            {/* 背景装飾 */}
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-sky-400/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className="space-y-3 max-w-xl text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100 border border-sky-300 text-sky-700 text-xs font-black tracking-wider uppercase">
                  <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                  本日の全国最高スコア
                </div>

                <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                  {topResort.resort.name}
                </h2>

                <div className="flex items-center justify-center lg:justify-start gap-2 text-xs text-slate-600 font-medium">
                  <span className="font-semibold text-sky-700">{topResort.resort.prefecture}</span>
                  <span>•</span>
                  <span>{topResort.resort.areaName}</span>
                  <span>•</span>
                  <span>標高 {topResort.resort.baseElevation}m〜{topResort.resort.topElevation}m</span>
                </div>

                <p className="text-sm text-slate-700 leading-relaxed pt-1">
                  {topResort.scoreResult.badge.comment}
                </p>

                {/* 主要データ */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2 text-xs">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200/90 shadow-sm">
                    <Snowflake className="w-4 h-4 text-sky-600" />
                    <span className="text-slate-600">12h新雪: </span>
                    <strong className="text-sky-700 font-bold font-outfit">+{topResort.current.freshSnow12h}cm</strong>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200/90 shadow-sm">
                    <Mountain className="w-4 h-4 text-indigo-600" />
                    <span className="text-slate-600">積雪: </span>
                    <strong className="text-slate-900 font-bold font-outfit">{topResort.current.snowDepthCm}cm</strong>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200/90 shadow-sm">
                    <Wind className="w-4 h-4 text-sky-600" />
                    <span className="text-slate-600">風速: </span>
                    <strong className="text-slate-900 font-bold font-outfit">{topResort.current.windSpeed}m/s</strong>
                  </div>
                </div>
              </div>

              {/* 巨大スコアサークル */}
              <div className="flex items-center gap-6 bg-white/95 p-6 rounded-3xl border border-sky-200 shadow-lg">
                <ScoreGauge
                  score={topResort.scoreResult.score}
                  size={140}
                  strokeWidth={12}
                  badge={topResort.scoreResult.badge}
                />
                <div className="space-y-2 text-center sm:text-left">
                  <div
                    className="px-3 py-1 rounded-lg text-xs font-black uppercase tracking-widest border inline-block"
                    style={{
                      backgroundColor: topResort.scoreResult.badge.bgLight,
                      color: topResort.scoreResult.badge.color,
                      borderColor: topResort.scoreResult.badge.color + '40'
                    }}
                  >
                    {topResort.scoreResult.badge.level}
                  </div>
                  <div className="text-lg font-bold text-slate-900">
                    {topResort.scoreResult.badge.title}
                  </div>
                  <button
                    onClick={() => setSelectedResortData(topResort)}
                    className="flex items-center gap-1 text-xs font-bold text-sky-600 hover:text-sky-800 transition-colors pt-1"
                  >
                    詳細レポートを見る
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* コントロールバー: エリア選択 / ソート / 検索 */}
        <div className="space-y-4">
          {/* 地域セレクタータブ */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
            {REGIONS.map((reg) => {
              const active = selectedRegion === reg.id;
              return (
                <button
                  key={reg.id}
                  onClick={() => setSelectedRegion(reg.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    active
                      ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20 scale-102'
                      : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200 shadow-sm'
                  }`}
                >
                  {reg.name}
                </button>
              );
            })}
          </div>

          {/* 検索・ソート */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm backdrop-blur-md">
            {/* 検索入力 */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="スキー場名・県名・地域名で絞り込み..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white transition-colors"
              />
            </div>

            {/* 表示モード切替 & ソートセレクター */}
            <div className="flex items-center gap-2">
              {/* ビュー切替ボタン */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    viewMode === 'grid'
                      ? 'bg-sky-500 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  カード
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    viewMode === 'map'
                      ? 'bg-sky-500 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5" />
                  マップ
                </button>
              </div>

              <span className="text-xs text-slate-500 hidden md:flex items-center gap-1 whitespace-nowrap pl-1 font-medium">
                <ArrowUpDown className="w-3.5 h-3.5 text-sky-600" />
                並び順:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 py-2 px-3 rounded-xl focus:outline-none focus:border-sky-500 cursor-pointer shadow-sm"
              >
                <option value="score">🏆 総合スコア順 (おすすめ)</option>
                <option value="freshSnow">❄️ 12h新雪量順</option>
                <option value="snowDepth">🏔️ 積雪深順</option>
                <option value="temp">🌡️ 気温が低い順 (冷え込み)</option>
                <option value="wind">💨 風が穏やかな順</option>
              </select>
            </div>
          </div>
        </div>

        {/* メインビュー: マップ または カードグリッド */}
        {viewMode === 'map' ? (
          <div className="space-y-4">
            <SkiMap
              resortsData={filteredAndSortedResorts}
              onSelectResort={(d) => setSelectedResortData(d)}
            />
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-4 px-1">
              <span>
                該当スキー場: <strong className="text-slate-800 font-bold">{filteredAndSortedResorts.length}</strong> 件
              </span>
              <span className="text-[11px] text-slate-400">
                ※カードをクリックすると時間別グラフと7日間予測を表示
              </span>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="h-72 rounded-2xl bg-white border border-slate-200 animate-pulse p-6 flex flex-col justify-between shadow-sm"
                  >
                    <div className="space-y-3">
                      <div className="h-4 bg-slate-100 rounded w-1/3" />
                      <div className="h-6 bg-slate-200 rounded w-2/3" />
                    </div>
                    <div className="h-20 bg-slate-100 rounded-xl" />
                    <div className="h-8 bg-slate-100 rounded-xl" />
                  </div>
                ))}
              </div>
            ) : filteredAndSortedResorts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredAndSortedResorts.map((item) => (
                  <ResortCard
                    key={item.resort.id}
                    data={item}
                    onSelect={(d) => setSelectedResortData(d)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white border border-slate-200 rounded-3xl shadow-sm">
                <Snowflake className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-bold text-slate-700">該当するスキー場が見つかりませんでした</p>
                <p className="text-xs text-slate-400 mt-1">検索キーワードまたは地域条件を変更してください</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* 詳細モーダル */}
      {selectedResortData && (
        <DetailModal
          data={selectedResortData}
          weights={weights}
          onClose={() => setSelectedResortData(null)}
        />
      )}

      {/* 重み調整モーダル */}
      {showWeightModal && (
        <WeightSettingsModal
          weights={weights}
          onSave={handleSaveWeights}
          onClose={() => setShowWeightModal(false)}
        />
      )}
    </div>
  );
}
