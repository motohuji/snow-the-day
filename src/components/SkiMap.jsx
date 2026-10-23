import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Layers } from 'lucide-react';

/**
 * タイルレイヤー定義 (無料・APIキー不要)
 */
const TILE_PROVIDERS = {
  dark: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 18
  },
  terrain: {
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 18
  },
  osm: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    subdomains: 'abc',
    maxZoom: 19
  }
};

/**
 * フリーの地図データ (OpenStreetMap / CartoDB + Leaflet.js) を使ったゲレンデマップ
 * APIキー不要・完全無料で利用可能
 */
export const SkiMap = ({ resortsData = [], onSelectResort }) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const markersLayerRef = useRef(null);
  const [mapType, setMapType] = useState('dark'); // 'dark' | 'terrain' | 'osm'

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
            filter: drop-shadow(0 4px 6px rgba(0,0,0,0.5));
            transform: translate(-50%, -100%);
          ">
            <div style="
              background-color: ${pinColor};
              color: #020617;
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
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 11px; background: #f8fafc; padding: 6px; border-radius: 8px; margin-bottom: 8px;">
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

  // 地図の初期化 (コンポーネントマウント時)
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // 既存インスタンス破棄
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

    // タイルレイヤー適用
    const tileConf = TILE_PROVIDERS[mapType] || TILE_PROVIDERS.dark;
    const tileLayer = L.tileLayer(tileConf.url, {
      attribution: tileConf.attribution,
      subdomains: tileConf.subdomains,
      maxZoom: tileConf.maxZoom
    }).addTo(map);
    tileLayerRef.current = tileLayer;

    // マーカーレイヤー作成
    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;

    // 初回マーカー描画
    renderMarkers(map, markersLayer, resortsData);

    // サイズ再計算 (マウント時とリサイズ時の描画乱れ防止)
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 150);

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
      clearTimeout(timer);
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

  // resortsData 更新時にマーカー再描画
  useEffect(() => {
    if (mapInstanceRef.current && markersLayerRef.current) {
      renderMarkers(mapInstanceRef.current, markersLayerRef.current, resortsData);
    }
  }, [resortsData, renderMarkers]);

  // タイル切り替えハンドラ
  const handleMapTypeChange = (newType) => {
    setMapType(newType);
    if (mapInstanceRef.current && tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
      const tileConf = TILE_PROVIDERS[newType] || TILE_PROVIDERS.dark;
      const newLayer = L.tileLayer(tileConf.url, {
        attribution: tileConf.attribution,
        subdomains: tileConf.subdomains,
        maxZoom: tileConf.maxZoom
      }).addTo(mapInstanceRef.current);
      tileLayerRef.current = newLayer;
    }
  };

  return (
    <div className="relative w-full rounded-3xl overflow-hidden border border-slate-800 bg-slate-900 shadow-2xl isolate">
      {/* マップ上部バー */}
      <div className="p-4 px-6 bg-slate-950/85 backdrop-blur-md border-b border-slate-800 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-sky-400" />
          <h3 className="font-bold text-white text-sm">
            全国ゲレンデマップ ({resortsData.length}箇所)
          </h3>
          <span className="text-xs text-emerald-400 font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            完全フリー・APIキー不要 (OpenStreetMap)
          </span>
        </div>

        {/* マップスタイル切替 */}
        <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <Layers className="w-3.5 h-3.5 text-slate-400 ml-1.5 mr-0.5" />
          <button
            onClick={() => handleMapTypeChange('dark')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              mapType === 'dark' ? 'bg-sky-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            ダーク
          </button>
          <button
            onClick={() => handleMapTypeChange('terrain')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              mapType === 'terrain' ? 'bg-sky-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            地形・山岳
          </button>
          <button
            onClick={() => handleMapTypeChange('osm')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              mapType === 'osm' ? 'bg-sky-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            標準
          </button>
        </div>
      </div>

      {/* 地図コンテナ */}
      <div
        ref={mapContainerRef}
        className="w-full h-[540px] bg-slate-900"
        style={{ minHeight: '540px' }}
      />

      {/* 凡例バッジ */}
      <div className="absolute bottom-4 left-4 z-[400] p-3 bg-slate-950/90 backdrop-blur-md border border-slate-800 rounded-2xl text-[11px] space-y-1.5 shadow-xl pointer-events-none">
        <div className="font-bold text-slate-300 mb-1">ピンのスコア凡例</div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-sky-400 inline-block shadow-sm"></span>
          <span>90〜100点: THE DAY (極上パウダー)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-cyan-400 inline-block"></span>
          <span>78〜89点: EPIC (好コンディション)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block"></span>
          <span>65〜77点: GOOD (滑走良好)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-slate-500 inline-block"></span>
          <span>CLOSED: 積雪ゼロ / シーズン前</span>
        </div>
      </div>
    </div>
  );
};
