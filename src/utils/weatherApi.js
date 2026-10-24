import { calculateFactorScores, calculateTotalScore } from './scoring';

// キャッシュ
const cache = new Map();
const CACHE_TTL = 15 * 60 * 1000; // 15分

export const fetchResortWeather = async (resort, weights) => {
  const cacheKey = `weather_${resort.id}`;
  const cached = cache.get(cacheKey);
  const now = Date.now();

  let data = null;
  if (cached && now - cached.timestamp < CACHE_TTL) {
    data = cached.data;
  } else {
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${resort.lat}&longitude=${resort.lng}&elevation=${resort.topElevation}&hourly=temperature_2m,relative_humidity_2m,precipitation,snowfall,snow_depth,weather_code,wind_speed_10m,wind_gusts_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,snowfall_sum,wind_speed_10m_max&wind_speed_unit=ms&timezone=Asia%2FTokyo&forecast_days=7`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      data = await res.json();
      cache.set(cacheKey, { timestamp: now, data });
    } catch (err) {
      console.warn(`Failed to fetch weather for ${resort.name}, using fallback data:`, err);
      data = generateMockWeather(resort);
    }
  }

  return processWeatherData(resort, data, weights);
};

/**
 * 全スキー場の天気を高速一括バッチ取得 (Open-Meteo Multi-location API)
 * 最大25件ずつチャンク化して同時に取得することで、80箇所以上でも数リクエスト・1秒未満で完了
 */
export const fetchAllResortsWeather = async (resorts, weights) => {
  const now = Date.now();
  const BATCH_SIZE = 25;
  const results = new Array(resorts.length);

  // 1. キャッシュチェック
  const uncachedResorts = [];
  resorts.forEach((resort, idx) => {
    const cacheKey = `weather_${resort.id}`;
    const cached = cache.get(cacheKey);
    if (cached && now - cached.timestamp < CACHE_TTL) {
      results[idx] = processWeatherData(resort, cached.data, weights);
    } else {
      uncachedResorts.push({ resort, originalIndex: idx });
    }
  });

  if (uncachedResorts.length === 0) {
    return results;
  }

  // 2. 未キャッシュ分をバッチ（最大25件ずつ）に分割して一括取得
  const chunks = [];
  for (let i = 0; i < uncachedResorts.length; i += BATCH_SIZE) {
    chunks.push(uncachedResorts.slice(i, i + BATCH_SIZE));
  }

  await Promise.all(
    chunks.map(async (chunk) => {
      const lats = chunk.map((c) => c.resort.lat).join(',');
      const lngs = chunk.map((c) => c.resort.lng).join(',');
      const elevations = chunk.map((c) => c.resort.topElevation).join(',');

      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lngs}&elevation=${elevations}&hourly=temperature_2m,relative_humidity_2m,precipitation,snowfall,snow_depth,weather_code,wind_speed_10m,wind_gusts_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,snowfall_sum,wind_speed_10m_max&wind_speed_unit=ms&timezone=Asia%2FTokyo&forecast_days=7`;

      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const dataArray = Array.isArray(data) ? data : [data];

        chunk.forEach(({ resort, originalIndex }, idx) => {
          const itemData = dataArray[idx] || generateMockWeather(resort);
          cache.set(`weather_${resort.id}`, { timestamp: now, data: itemData });
          results[originalIndex] = processWeatherData(resort, itemData, weights);
        });
      } catch (err) {
        console.warn('Batch weather fetch failed, using fallback:', err);
        chunk.forEach(({ resort, originalIndex }) => {
          const mock = generateMockWeather(resort);
          results[originalIndex] = processWeatherData(resort, mock, weights);
        });
      }
    })
  );

  return results;
};

// Open-Meteo の時間別データから直近12時間の降雪量やスコアを算出
export const processWeatherData = (resort, data, weights) => {
  const hourly = data.hourly;
  const currentIso = new Date().toISOString();
  
  // 現在時刻に一番近い hourly インデックスを見つける
  let currentIndex = 0;
  if (hourly?.time?.length) {
    const nowTime = new Date().getTime();
    let minDiff = Infinity;
    hourly.time.forEach((t, i) => {
      const diff = Math.abs(new Date(t).getTime() - nowTime);
      if (diff < minDiff) {
        minDiff = diff;
        currentIndex = i;
      }
    });
  }

  // 朝〜昼のスキー活動時間（例: 9:00〜14:00）を特定
  // 現在から過去12時間の降雪量 (snowfallはcm単位で返ってくる)
  const past12hStartIndex = Math.max(0, currentIndex - 11);
  let freshSnow12h = 0;
  if (hourly?.snowfall) {
    for (let i = past12hStartIndex; i <= currentIndex; i++) {
      freshSnow12h += hourly.snowfall[i] || 0;
    }
  }

  // snow_depth はメートル単位なので cm に変換 (0cm の時は確実に 0)
  const snowDepthM = hourly?.snow_depth ? (hourly.snow_depth[currentIndex] ?? 0) : 0;
  const snowDepthCm = Math.round(snowDepthM * 100);

  const temp = Math.round((hourly?.temperature_2m?.[currentIndex] ?? -4) * 10) / 10;
  const windSpeed = Math.round((hourly?.wind_speed_10m?.[currentIndex] ?? 3) * 10) / 10;
  const windGust = Math.round((hourly?.wind_gusts_10m?.[currentIndex] ?? 5) * 10) / 10;
  const weatherCode = hourly?.weather_code?.[currentIndex] ?? 71;

  // 直近24時間の時間別予報 (08:00〜翌日)
  const next24Hours = [];
  const hoursToShow = 24;
  for (let i = 0; i < hoursToShow && currentIndex + i < (hourly?.time?.length || 0); i++) {
    const idx = currentIndex + i;
    const timeStr = hourly.time[idx];
    const hourDate = new Date(timeStr);
    
    // その時点の過去12h降雪
    let snowWindow = 0;
    for (let k = Math.max(0, idx - 11); k <= idx; k++) {
      snowWindow += hourly.snowfall?.[k] || 0;
    }

    const hFactors = calculateFactorScores({
      freshSnow12h: Math.round(snowWindow * 10) / 10,
      snowDepthCm: Math.round((hourly.snow_depth?.[idx] || 0) * 100),
      temp: hourly.temperature_2m?.[idx] ?? 0,
      windSpeed: hourly.wind_speed_10m?.[idx] ?? 0,
      windGust: hourly.wind_gusts_10m?.[idx] ?? 0,
      weatherCode: hourly.weather_code?.[idx] ?? 0
    });
    const hResult = calculateTotalScore(hFactors, weights);

    next24Hours.push({
      time: hourDate.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }),
      hour: hourDate.getHours(),
      dateStr: `${hourDate.getMonth() + 1}/${hourDate.getDate()}`,
      temp: Math.round(hourly.temperature_2m?.[idx] || 0),
      snowfall: Math.round((hourly.snowfall?.[idx] || 0) * 10) / 10,
      windSpeed: Math.round(hourly.wind_speed_10m?.[idx] || 0),
      weatherCode: hourly.weather_code?.[idx] || 0,
      weatherInfo: hFactors.weatherInfo,
      score: hResult.score,
      badge: hResult.badge
    });
  }

  // 7日間のデイリー予報
  const dailyForecast = [];
  const daily = data.daily;
  if (daily?.time?.length) {
    daily.time.forEach((dStr, idx) => {
      const dDate = new Date(dStr);
      const dayName = ['日', '月', '火', '水', '木', '金', '土'][dDate.getDay()];
      const dSnowSum = daily.snowfall_sum?.[idx] || 0;
      const dTempMax = Math.round(daily.temperature_2m_max?.[idx] || 0);
      const dTempMin = Math.round(daily.temperature_2m_min?.[idx] || 0);
      const dWindMax = Math.round(daily.wind_speed_10m_max?.[idx] || 0);
      const dWeatherCode = daily.weather_code?.[idx] || 0;

      // 日ごとの概算スコア
      const dFactors = calculateFactorScores({
        freshSnow12h: dSnowSum,
        snowDepthCm: snowDepthCm,
        temp: (dTempMax + dTempMin) / 2,
        windSpeed: dWindMax * 0.7,
        windGust: dWindMax,
        weatherCode: dWeatherCode
      });
      const dResult = calculateTotalScore(dFactors, weights);

      dailyForecast.push({
        date: `${dDate.getMonth() + 1}/${dDate.getDate()}`,
        dayName,
        isToday: idx === 0,
        weatherCode: dWeatherCode,
        weatherInfo: dFactors.weatherInfo,
        tempMax: dTempMax,
        tempMin: dTempMin,
        snowfallSum: Math.round(dSnowSum * 10) / 10,
        windMax: dWindMax,
        score: dResult.score,
        badge: dResult.badge
      });
    });
  }

  // 現時点の総合スコア
  const factors = calculateFactorScores({
    freshSnow12h: Math.round(freshSnow12h * 10) / 10,
    snowDepthCm,
    temp,
    windSpeed,
    windGust,
    weatherCode
  });
  const scoreResult = calculateTotalScore(factors, weights);

  return {
    resort,
    current: {
      freshSnow12h: Math.round(freshSnow12h * 10) / 10,
      snowDepthCm,
      temp,
      windSpeed,
      windGust,
      weatherCode,
      weatherInfo: factors.weatherInfo,
      time: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
    },
    factors,
    scoreResult,
    next24Hours,
    dailyForecast
  };
};

// 万が一のオフライン用フォールバック
function generateMockWeather(resort) {
  const times = [];
  const temps = [];
  const snowfalls = [];
  const snowDepths = [];
  const weatherCodes = [];
  const windSpeeds = [];
  const windGusts = [];

  const nowMonth = new Date().getMonth() + 1;
  const isWinter = nowMonth >= 12 || nowMonth <= 3;
  const isLateFall = nowMonth === 11;
  const baseSnowDepth = isWinter ? (resort.region === 'hokkaido' ? 1.6 : 1.1) : (isLateFall ? 0.05 : 0);
  const baseTemp = isWinter ? -6 : nowMonth === 10 ? 4 : nowMonth === 11 ? -1 : 12;

  for (let i = 0; i < 48; i++) {
    const d = new Date();
    d.setHours(d.getHours() + i);
    times.push(d.toISOString());
    temps.push(baseTemp + Math.sin(i / 4) * 3);
    snowfalls.push(isWinter ? (i % 4 === 0 ? 1.2 : 0) : 0);
    snowDepths.push(baseSnowDepth);
    weatherCodes.push(isWinter ? 71 : 2);
    windSpeeds.push(3.5 + Math.cos(i / 3) * 1.5);
    windGusts.push(6.0);
  }

  return {
    hourly: {
      time: times,
      temperature_2m: temps,
      snowfall: snowfalls,
      snow_depth: snowDepths,
      weather_code: weatherCodes,
      wind_speed_10m: windSpeeds,
      wind_gusts_10m: windGusts
    },
    daily: {
      time: [0, 1, 2, 3, 4, 5, 6].map(offset => {
        const d = new Date();
        d.setDate(d.getDate() + offset);
        return d.toISOString().split('T')[0];
      }),
      weather_code: [73, 71, 1, 75, 2, 0, 71],
      temperature_2m_max: [-2, -1, 1, -3, 0, 2, -1],
      temperature_2m_min: [-8, -7, -5, -10, -6, -4, -7],
      snowfall_sum: [12, 6, 0, 20, 2, 0, 5],
      wind_speed_10m_max: [5, 4, 3, 9, 4, 3, 5]
    }
  };
}
