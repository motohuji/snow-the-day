import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Layers } from 'lucide-react';

/**
 * 完全無料・APIキー不要・世界中どこからでも高速・確実に表示されるタイルレイヤー定義
 * - 地形・山岳 (デフォルト): Esri World Topo Map (日本の山岳起伏・等高線・主要地名・海岸線が鮮明)
 * - 航空写真: Esri World Imagery (世界最高精度の実写衛星・航空写真)
 * - 標準: OpenStreetMap 標準マップ
 * - ダーク: OpenStreetMap + CSSダークフィルター
 */
const TILE_PROVIDERS = {
  terrain: {
    name: '地形・山岳',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Esri, USGS, NOAA',
    maxZoom: 18
  },
  photo: {
    name: '航空写真',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics',
    maxZoom: 18
  },
  osm: {
    name: '標準',
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 18
  },
  dark: {
    name: 'ダーク',
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 18
  }
};

/**
 * ゲレンデマップコンポーネント (明るいモダンデザイン)
 */
export const SkiMap = ({ resortsData = [], onSelectResort }) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const markersLayerRef = useRef(null);
  const [mapType, setMapType] = useState('terrain'); // 明るい山岳地形をデフォルトに設定

  // タイル切り替え関数
  const switchTileLayer = useCallback((map, type) => {
    if (!map) return;
    if (tileLayerRef.current) {
      try {
        map.removeLayer(tileLayerRef.current);
      } catch (e) {
        // ignore
      }
      tileLayerRef.current = null;
    }

    const tileConf = TILE_PROVIDERS[type] || TILE_PROVIDERS.terrain;
    const newLayer = L.tileLayer(tileConf.url, {
      attribution: tileConf.attribution,
      maxZoom: 18,
      minZoom: 4
    }).addTo(map);

    tileLayerRef.current = newLayer;
  }, []);

  // マーカー描画関数
  const renderMarkers = useCallback((map, layerGroup, data) => {
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    data.forEach((item) => {
      const { resort, scoreResult, current } = item;
      const { score, badge } = scoreResult;
      const isClosed = badge.level === 'CLOSED';

      // Golf the Day 風のカスタムHTMLアイコン (L.divIcon)
      const pinColor = isClosed ? '#64748b' : badge.color;
      const pinText = isClosed ? 'CLOSED' : `${score}`;
      const pinIcon = isClosed ? '⏸️' : '❄️';

      const customIcon = L.divIcon({
        className: 'custom-ski-pin',
        html: `
          <div style="
            display: inline-flex;
            flex-direction: column;
            align-items: center;
            cursor: pointer;
            filter: drop-shadow(0 4px 6px rgba(15,23,42,0.3));
            transform: translate(-50%, -100%);
          ">
            <div style="
              background-color: ${pinColor};
              color: #ffffff;
              padding: 3px 8px;
              border-radius: 9999px;
              font-family: 'Outfit', sans-serif;
              font-weight: 900;
              font-size: 11px;
              line-height: 1;
              display: flex;
              align-items: center;
              gap: 3px;
              white-space: nowrap;
              border: 2px solid rgba(255, 255, 255, 0.95);
              box-shadow: 0 2px 4px rgba(0,0,0,0.15);
            ">
              <span style="font-size: 10px;">${pinIcon}</span>
              <span>${pinText}</span>
            </div>
            <div style="
              width: 8px;
              height: 8px;
              background-color: ${pinColor};
              transform: rotate(45deg);
              margin-top: -4px;
              border-right: 2px solid rgba(255, 255, 255, 0.85);
              border-bottom: 2px solid rgba(255, 255, 255, 0.85);
            "></div>
          </div>
        `,
        iconSize: [0, 0]
      });

      const marker = L.marker([resort.lat, resort.lng], { icon: customIcon });

      // ポップアップ HTML
      const popupHtml = `
        <div style="font-family: 'Noto Sans JP', sans-serif; color: #0f172a; min-width: 220px; padding: 2px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
            <span style="font-size: 10px; font-weight: bold; background: #e0f2fe; color: #0284c7; padding: 2px 6px; border-radius: 4px;">
              ${resort.prefecture}
            </span>
            <span style="font-size: 10px; font-weight: 900; color: ${pinColor};">
              ${badge.level}
            </span>
          </div>
          <h4 style="margin: 2px 0 4px 0; font-size: 14px; font-weight: 800; color: #0f172a; line-height: 1.2;">
            ${resort.name}
          </h4>
          <p style="font-size: 11px; color: #64748b; margin: 0 0 6px 0;">
            標高: ${resort.baseElevation}m - ${resort.topElevation}m
          </p>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 11px; background: #f8fafc; padding: 6px; border-radius: 8px; margin-bottom: 8px; border: 1px solid #e2e8f0;">
            <div>スコア: <strong>${score}点</strong></div>
            <div>天気: <strong>${current.weatherInfo ? current.weatherInfo.label : '-'}</strong></div>
            <div>積雪深: <strong>${current.snowDepthCm}cm</strong></div>
            <div>12h新雪: <strong>+${current.freshSnow12h}cm</strong></div>
            <div>山頂気温: <strong>${current.temp}℃</strong></div>
            <div>風速: <strong>${current.windSpeed}m/s</strong></div>
          </div>
          <button id="leaflet-btn-${resort.id}" style="
            width: 100%;
            background: #0284c7;
            color: #ffffff;
            border: none;
            padding: 7px 10px;
            border-radius: 8px;
            font-size: 11px;
            font-weight: bold;
            cursor: pointer;
            transition: background 0.2s;
          " onmouseover="this.style.background='#0369a1'" onmouseout="this.style.background='#0284c7'">
            詳細レポートを開く →
          </button>
        </div>
      `;

      marker.bindPopup(popupHtml, {
        maxWidth: 280,
        className: 'custom-leaflet-popup'
      });

      marker.on('popupopen', () => {
        const btn = document.getElementById(`leaflet-btn-${resort.id}`);
        if (btn) {
          btn.onclick = () => {
            if (onSelectResort) {
              onSelectResort(item);
            }
            marker.closePopup();
          };
        }
      });

      layerGroup.addLayer(marker);
    });
  }, [onSelectResort]);

  // 地図の初期化 (初回マウント時のみ実行)
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: [37.2, 138.8],
      zoom: 6.4,
      minZoom: 5,
      maxZoom: 16,
      zoomControl: true
    });

    mapInstanceRef.current = map;

    // 初回タイルレイヤーを確実に追加
    switchTileLayer(map, mapType);

    // マーカーレイヤー作成
    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;

    // 初回マーカー描画
    renderMarkers(map, markersLayer, resortsData);

    // サイズ再計算 (複数回スケジュールしてレンダリング完了を待つ)
    map.invalidateSize();
    const timer1 = setTimeout(() => {
      map.invalidateSize();
    }, 150);
    const timer2 = setTimeout(() => {
      map.invalidateSize();
    }, 450);

    let resizeObserver = null;
    if (window.ResizeObserver && mapContainerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      });
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersLayerRef.current = null;
        tileLayerRef.current = null;
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // タイル切り替えの宣言的同期 (mapType変更時に自動更新)
  useEffect(() => {
    if (mapInstanceRef.current) {
      switchTileLayer(mapInstanceRef.current, mapType);
      mapInstanceRef.current.invalidateSize();
    }
  }, [mapType, switchTileLayer]);

  // resortsData 更新時にマーカー再描画
  useEffect(() => {
    if (mapInstanceRef.current && markersLayerRef.current) {
      renderMarkers(mapInstanceRef.current, markersLayerRef.current, resortsData);
    }
  }, [resortsData, renderMarkers]);

  return (
    <div className="relative w-full rounded-3xl overflow-hidden border border-slate-200/90 bg-white shadow-xl isolate">
      {/* マップ上部バー */}
      <div className="p-4 px-6 bg-white/95 backdrop-blur-md border-b border-slate-200 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-sky-600" />
          <h3 className="font-bold text-slate-800 text-sm">
            全国ゲレンデマップ ({resortsData.length}箇所)
          </h3>
          <span className="text-xs text-sky-700 font-medium px-2 py-0.5 rounded-full bg-sky-50 border border-sky-200">
            完全フリー・APIキー不要
          </span>
        </div>

        {/* マップスタイル切替 */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <Layers className="w-3.5 h-3.5 text-slate-500 ml-1.5 mr-0.5" />
          <button
            onClick={() => setMapType('terrain')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              mapType === 'terrain' ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            地形・山岳
          </button>
          <button
            onClick={() => setMapType('photo')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              mapType === 'photo' ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            航空写真
          </button>
          <button
            onClick={() => setMapType('osm')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              mapType === 'osm' ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            標準
          </button>
          <button
            onClick={() => setMapType('dark')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              mapType === 'dark' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ダーク
          </button>
        </div>
      </div>

      {/* 地図コンテナ */}
      <div
        ref={mapContainerRef}
        className={`w-full h-[540px] bg-slate-100 ${mapType === 'dark' ? 'dark-map-tiles' : ''}`}
        style={{ minHeight: '540px', height: '540px', width: '100%' }}
      />

      {/* 凡例バッジ */}
      <div className="absolute bottom-4 left-4 z-[400] p-3 bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl text-[11px] space-y-1.5 shadow-lg pointer-events-none text-slate-700">
        <div className="font-bold text-slate-800 mb-1">ピンのスコア凡例</div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-sky-500 inline-block shadow-sm"></span>
          <span>90〜100点: THE DAY (極上パウダー)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-cyan-500 inline-block"></span>
          <span>78〜89点: EPIC (好コンディション)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
          <span>65〜77点: GOOD (滑走良好)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-slate-400 inline-block"></span>
          <span>CLOSED: 積雪ゼロ / シーズン前</span>
        </div>
      </div>
    </div>
  );
};
