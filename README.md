# SNOW THE DAY (スキー場コンディション評価アプリ)

「Golf the Day」にインスパイアされた、スキー場ごとの気象・雪質コンディションを0〜100点でスコア評価するWebアプリケーションです。

---

## 📌 プロジェクト概要
- **プロジェクト場所**: `C:\Users\mssik\python\snow-the-day`
- **主要目的**: 12時間新雪量、積雪深、気温、風速、天候データを統合し、本日の「THE DAY（神回）」スキー場を瞬時に可視化
- **対象エリア**: 北海道、長野、新潟、群馬、福島、宮城、静岡の主要スキー場

---

## 🛠️ 技術スタック & データソース
1. **フロントエンド**:
   - React 18 / 19
   - Tailwind CSS
   - Lucide Icons
   - Vite (モダンモジュール開発)
   - `standalone.html` (インストール不要でブラウザで即座に動く単一ファイル版)
2. **気象データ (完全無料・APIキー不要)**:
   - [Open-Meteo API](https://open-meteo.com/)
   - スキー場の山頂標高（elevation）に合わせた高度補正済み気象データ
   - パラメータ: `snowfall` (12h合計), `snow_depth`, `temperature_2m`, `wind_speed_10m`, `wind_gusts_10m`, `weather_code`
3. **地図機能 (完全無料・APIキー不要)**:
   - **Leaflet.js + OpenStreetMap / CartoDB**
   - 3種類のスタイル切り替え:
     - ダーク (デフォルト・UIに調和)
     - 山岳・地形 (等高線・標高が分かりやすいアウトドア向け)
     - 標準OSM (道路・地名が明瞭)
   - カスタムHTMLピン: スコアバッジ（例: `❄️ 92` や `⏸️ CLOSED`）付きのマーカー

---

## 📊 スコアリングアルゴリズム仕様
1. **総合スコア (0〜100点)**:
   - `90〜100点`: **THE DAY** (奇跡の神回！極上ドライパウダー)
   - `78〜89点`: **EPIC** (文句なしの最高コンディション)
   - `65〜77点`: **GOOD** (快適・滑走良好)
   - `50〜64点`: **AVERAGE** (標準的コンディション)
   - `〜49点`: **TOUGH** (荒天・湿雪・注意)
   - `積雪ゼロ/10cm以下`: **CLOSED** (シーズン前・オープン待ち)
2. **重み付けプリセット**:
   - **スタンダード (推奨)**: 新雪25% / 積雪20% / 気温20% / 風速20% / 天気15%
   - **パウダーハント**: 新雪45% / 気温25% / 積雪15% (深雪ラン特化)
   - **快適・ファミリー**: 天気25% / 風速30% / 気温25% (穏やか＆晴天重視)
   - **グルーミング爽快**: 積雪30% / 風速25% / 天気20% (圧雪バーン重視)
   - **カスタムスライダー**: ユーザーが各比率を自由に調整可能
3. **ペナルティ・安全ガード**:
   - 雨天: スコアを最大35点にキャップ
   - 強風 (風速14m/s以上 / 突風18m/s以上): リフト運休リスクで大幅減点
   - 積雪10cm未満: 滑走不可のため最大5点・CLOSED判定

---

## 📂 ディレクトリ構成
```text
snow-the-day/
├── standalone.html          ★ダブルクリックでブラウザですぐ動く単一ファイル版
├── index.html               (React+ViteエントリーHTML)
├── package.json             (依存関係・npmスクリプト)
├── vite.config.js           (Vite設定)
├── tailwind.config.js       (Tailwind設定)
├── postcss.config.js
├── README.md                (本ドキュメント)
└── src/
    ├── App.jsx              (メイン画面・カード/マップ切替・ソート)
    ├── index.css            (スタイル定義)
    ├── main.jsx             (エントリーJS)
    ├── components/
    │   ├── SkiMap.jsx       (Leaflet+OpenStreetMapフリー地図)
    │   ├── ScoreGauge.jsx   (Golf the Day風サークルスコア)
    │   ├── ResortCard.jsx   (スキー場カード)
    │   ├── DetailModal.jsx  (24h推移・週間予報モーダル)
    │   ├── WeatherIcon.jsx  (天気アイコン描画)
    │   └── WeightSettingsModal.jsx (評価基準カスタマイズ)
    ├── data/
    │   └── resorts.js       (北海道〜静岡のスキー場データ)
    └── utils/
        ├── scoring.js       (スコア計算ロジック)
        └── weatherApi.js    (Open-Meteo連携・データ整形)
```

---

## 🚀 起動方法
1. **ブラウザで直接動かす場合 (単一ファイル版)**:
   - `standalone.html` をダブルクリックして開く。
2. **Vite開発サーバーで動かす場合 (ローカル)**:
   ```bash
   npm install
   npm run dev
   ```
3. **本番ビルド**:
   ```bash
   npm run build
   # 生成された dist/ ディレクトリを静的ホスティング可能
   ```

---

## 🌐 Render (無料) へのデプロイ手順

本アプリは Vite による SPA (Single Page Application) であり、バックエンドサーバー不要のため **Render の「Static Site（無料・常時稼働・高速CDN）」** で最適にホストできます。

### 方法A: GitHub 連携（推奨）
1. GitHub にリポジトリを作成し、コードをプッシュします：
   ```bash
   git init
   git add .
   git commit -m "feat: initial commit with Leaflet map and Render config"
   git remote add origin https://github.com/<あなたのユーザー名>/<リポジトリ名>.git
   git branch -M main
   git push -u origin main
   ```
2. [Render ダッシュボード](https://dashboard.render.com/) にログインし、**「New +」→「Static Site」** を選択します。
3. 作成した GitHub リポジトリを選択します。
4. 設定項目に以下を入力します（リポジトリ内の `render.yaml` を読み込ませる場合は自動設定されます）：
   - **Name**: `snow-the-day`
   - **Branch**: `main`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
5. **「Create Static Site」** をクリックするとビルドが開始され、数分で `https://snow-the-day-xxxx.onrender.com` が公開されます。

### SPAリダイレクト設定 (Render Dashboard)
- リポジトリの `render.yaml` に定義済みですが、手動設定する場合は:
  - Settings → **Redirects/Rewrites** に追加
  - Source: `/*`
  - Destination: `/index.html`
  - Action: `Rewrite`

