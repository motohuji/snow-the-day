// プリセット定義
export const PRESETS = [
  {
    id: 'balance',
    name: 'スタンダード (推奨)',
    desc: '新雪・雪質・天候・風速をバランスよく総合判定',
    weights: { freshSnow: 25, snowDepth: 20, temperature: 20, wind: 20, weather: 15 }
  },
  {
    id: 'powder',
    name: 'パウダーハント',
    desc: '夜間の降雪量と氷点下の極上ドライパウダーを最重要視',
    weights: { freshSnow: 45, snowDepth: 15, temperature: 25, wind: 10, weather: 5 }
  },
  {
    id: 'comfort',
    name: '快適・ファミリー',
    desc: '穏やかな風・晴天率・適温を重視（初心者・ファミリー向き）',
    weights: { freshSnow: 5, snowDepth: 15, temperature: 25, wind: 30, weather: 25 }
  },
  {
    id: 'cruising',
    name: 'グルーミング・爽快',
    desc: '十分なベース積雪と視界良好な圧雪バーンでの滑走重視',
    weights: { freshSnow: 10, snowDepth: 30, temperature: 15, wind: 25, weather: 20 }
  }
];

// 数値範囲の線形補間
export const clamp = (val, min, max) => Math.min(Math.max(val, min), max);
export const lerp = (x, x0, x1, y0, y1) => {
  if (x0 === x1) return y0;
  const t = clamp((x - x0) / (x1 - x0), 0, 1);
  return y0 + t * (y1 - y0);
};

// 天気コードの解説
export const getWeatherInfo = (code) => {
  switch (code) {
    case 0:
      return { label: '快晴', type: 'clear', icon: 'Sun', baseScore: 100 };
    case 1:
      return { label: 'ほぼ晴れ', type: 'clear', icon: 'Sun', baseScore: 90 };
    case 2:
      return { label: '晴れ時々曇り', type: 'partly-cloudy', icon: 'CloudSun', baseScore: 80 };
    case 3:
      return { label: '曇り', type: 'cloudy', icon: 'Cloud', baseScore: 65 };
    case 45:
    case 48:
      return { label: '濃霧・視界不良', type: 'fog', icon: 'CloudFog', baseScore: 40 };
    case 51:
    case 53:
    case 55:
      return { label: '霧雨', type: 'rain', icon: 'CloudDrizzle', baseScore: 25 };
    case 61:
    case 63:
    case 65:
      return { label: '雨', type: 'rain', icon: 'CloudRain', baseScore: 10 };
    case 66:
    case 67:
      return { label: '雨氷・みぞれ', type: 'rain', icon: 'CloudHail', baseScore: 15 };
    case 71:
      return { label: '小雪', type: 'snow', icon: 'CloudSnow', baseScore: 85 };
    case 73:
      return { label: '雪 (適度)', type: 'snow', icon: 'Snowflake', baseScore: 90 };
    case 75:
      return { label: '大雪・吹雪', type: 'snow', icon: 'Snowflake', baseScore: 75 };
    case 77:
      return { label: '細氷', type: 'snow', icon: 'Snowflake', baseScore: 85 };
    case 80:
    case 81:
    case 82:
      return { label: 'にわか雨', type: 'rain', icon: 'CloudRain', baseScore: 20 };
    case 85:
    case 86:
      return { label: 'にわか雪', type: 'snow', icon: 'CloudSnow', baseScore: 85 };
    case 95:
    case 96:
    case 99:
      return { label: '雷雨・荒天', type: 'storm', icon: 'CloudLightning', baseScore: 5 };
    default:
      return { label: '曇り', type: 'cloudy', icon: 'Cloud', baseScore: 60 };
  }
};

/**
 * 個別項目のスコアリング計算 (各項目 0〜100点)
 */
export const calculateFactorScores = ({ freshSnow12h, snowDepthCm, temp, windSpeed, windGust, weatherCode }) => {
  // 1. 12時間降雪量 (cm): 0cm=20点, 5cm=60点, 15cm=90点, 25cm以上=100点
  let freshScore = 0;
  if (freshSnow12h <= 0) {
    freshScore = 20; // 新雪ゼロ
  } else if (freshSnow12h < 5) {
    freshScore = lerp(freshSnow12h, 0, 5, 20, 60);
  } else if (freshSnow12h < 15) {
    freshScore = lerp(freshSnow12h, 5, 15, 60, 90);
  } else if (freshSnow12h < 25) {
    freshScore = lerp(freshSnow12h, 15, 25, 90, 100);
  } else {
    freshScore = 100;
  }

  // 2. 積雪深 (cm):
  // 0cm = 0点 (滑走不可), 15cm未満 = 5点, 30cm = 25点, 80cm = 70点, 150cm以上 = 100点
  let depthScore = 0;
  if (snowDepthCm <= 0) {
    depthScore = 0;
  } else if (snowDepthCm < 15) {
    depthScore = lerp(snowDepthCm, 0, 15, 0, 10);
  } else if (snowDepthCm < 30) {
    depthScore = lerp(snowDepthCm, 15, 30, 10, 30);
  } else if (snowDepthCm < 80) {
    depthScore = lerp(snowDepthCm, 30, 80, 30, 70);
  } else if (snowDepthCm < 150) {
    depthScore = lerp(snowDepthCm, 80, 150, 70, 95);
  } else {
    depthScore = 100;
  }

  // 3. 気温 (℃):
  // -10℃ 〜 -3℃ が最高品質の雪 (100点)
  // -3℃ 〜 2℃ は重い雪・湿雪へ (100 -> 30点)
  // 2℃以上はシャバ雪 (30 -> 10点)
  // -10℃ 〜 -20℃ は極寒 (100 -> 50点)
  let tempScore = 0;
  if (temp >= -10 && temp <= -3) {
    tempScore = 100;
  } else if (temp > -3 && temp <= 2) {
    tempScore = lerp(temp, -3, 2, 100, 35);
  } else if (temp > 2) {
    tempScore = lerp(temp, 2, 8, 35, 10);
  } else if (temp < -10) {
    tempScore = lerp(temp, -20, -10, 45, 100);
  }

  // 4. 風速 (m/s) & 突風:
  // 0〜3m/s 満点
  // 3〜8m/s 快適 (100 -> 70点)
  // 8〜14m/s 厳しい・リフト減速 (70 -> 25点)
  // 14m/s以上 リフト運休危機 (0〜20点)
  let windScore = lerp(windSpeed, 2, 14, 100, 15);
  if (windGust > 18) {
    windScore = Math.min(windScore, 15); // 突風でリフト運休リスク
  } else if (windGust > 14) {
    windScore = Math.min(windScore, 35);
  }

  // 5. 天気
  const weatherInfo = getWeatherInfo(weatherCode);
  const weatherScore = weatherInfo.baseScore;

  return {
    freshSnow: Math.round(freshScore),
    snowDepth: Math.round(depthScore),
    temperature: Math.round(tempScore),
    wind: Math.round(windScore),
    weather: Math.round(weatherScore),
    weatherInfo
  };
};

/**
 * 総合スコアとランクの判定
 */
export const calculateTotalScore = (factors, weights) => {
  const totalWeight = weights.freshSnow + weights.snowDepth + weights.temperature + weights.wind + weights.weather;
  const normWeight = (w) => (w / (totalWeight || 100));

  let rawScore =
    factors.freshSnow * normWeight(weights.freshSnow) +
    factors.snowDepth * normWeight(weights.snowDepth) +
    factors.temperature * normWeight(weights.temperature) +
    factors.wind * normWeight(weights.wind) +
    factors.weather * normWeight(weights.weather);

  // 積雪不足・積雪ゼロ時のハードキャップ
  // 積雪深が15cm未満の場合は滑走不可（オフシーズン／雪待ち）
  let isClosed = false;
  if (factors.snowDepth <= 10) {
    isClosed = true;
    rawScore = Math.min(rawScore, 10);
  } else if (factors.weatherInfo.type === 'rain') {
    rawScore = Math.min(rawScore, 35);
  } else if (factors.wind <= 20) {
    rawScore = Math.min(rawScore, 40); // 強風・運休リスク
  }

  const finalScore = Math.round(clamp(rawScore, 0, 100));

  // ランク付けと Golf the Day スタイルのバッジ
  let badge = {
    rank: 'C',
    level: 'TOUGH',
    title: '厳しい条件',
    color: '#ef4444', // red
    bgLight: 'rgba(239, 68, 68, 0.15)',
    border: 'border-rose-500/30',
    comment: '風雪またはコンディション悪化に注意。無理せずレストハウス待機も検討。'
  };

  if (isClosed || finalScore <= 15) {
    badge = {
      rank: '-',
      level: 'CLOSED',
      title: 'シーズン前 / 積雪なし',
      color: '#94a3b8', // slate-400
      bgLight: 'rgba(148, 163, 184, 0.15)',
      border: 'border-slate-500/30',
      comment: '現在ゲレンデに積雪がありません（積雪0cm）。本格的な降雪・シーズンインをお待ちください。'
    };
  } else if (finalScore >= 90) {
    badge = {
      rank: 'SSS',
      level: 'THE DAY',
      title: '神回確定！奇跡のTHE DAY',
      color: '#38bdf8', // sky/cyan
      bgLight: 'rgba(56, 189, 248, 0.2)',
      border: 'border-sky-400/40',
      comment: '極上ドライパウダー＆好コンディション！今すぐ滑りに行くべき最高の一日。'
    };
  } else if (finalScore >= 78) {
    badge = {
      rank: 'S',
      level: 'EPIC',
      title: '極上の仕上がり',
      color: '#06b6d4', // cyan
      bgLight: 'rgba(6, 182, 212, 0.2)',
      border: 'border-cyan-400/30',
      comment: '雪質・天候ともに文句なしの高水準。気持ちいいターンが約束されます。'
    };
  } else if (finalScore >= 65) {
    badge = {
      rank: 'A',
      level: 'GOOD',
      title: '良好コンディション',
      color: '#10b981', // emerald
      bgLight: 'rgba(16, 185, 129, 0.15)',
      border: 'border-emerald-500/30',
      comment: 'ゲレンデを存分に楽しめるナイスデイ。防寒対策を整えて出発しよう。'
    };
  } else if (finalScore >= 50) {
    badge = {
      rank: 'B',
      level: 'AVERAGE',
      title: '平均的コンディション',
      color: '#f59e0b', // amber
      bgLight: 'rgba(245, 158, 11, 0.15)',
      border: 'border-amber-500/30',
      comment: '滑走可能ですが、雪質の変化や天候の急変に備えてゴーグル・ワックスを選定。'
    };
  }

  return {
    score: finalScore,
    badge,
    factors
  };
};
