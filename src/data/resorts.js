export const REGIONS = [
  { id: 'all', name: '全エリア' },
  { id: 'hokkaido', name: '北海道' },
  { id: 'nagano', name: '長野' },
  { id: 'niigata', name: '新潟' },
  { id: 'gunma', name: '群馬' },
  { id: 'fukushima', name: '福島' },
  { id: 'miyagi', name: '宮城' },
  { id: 'shizuoka', name: '静岡' }
];

export const RESORTS = [
  // 北海道
  {
    id: 'niseko-grand-hirafu',
    name: 'ニセコ東急 グラン・ヒラフ',
    region: 'hokkaido',
    prefecture: '北海道',
    areaName: '倶知安町 / ニセコ',
    lat: 42.8617,
    lng: 140.7011,
    topElevation: 1200,
    baseElevation: 260,
    tag: '極上パウダースノー'
  },
  {
    id: 'rusutsu-resort',
    name: 'ルスツリゾート',
    region: 'hokkaido',
    prefecture: '北海道',
    areaName: '留寿都村',
    lat: 42.7533,
    lng: 140.9067,
    topElevation: 994,
    baseElevation: 400,
    tag: '道内最大級・ツリーラン'
  },
  {
    id: 'furano-ski-resort',
    name: '富良野スキー場',
    region: 'hokkaido',
    prefecture: '北海道',
    areaName: '富良野市',
    lat: 43.3242,
    lng: 142.3556,
    topElevation: 1074,
    baseElevation: 235,
    tag: '内陸ドライパウダー'
  },

  // 長野
  {
    id: 'hakuba-happo-one',
    name: '白馬八方尾根スキー場',
    region: 'nagano',
    prefecture: '長野県',
    areaName: '白馬村',
    lat: 36.7025,
    lng: 137.8436,
    topElevation: 1831,
    baseElevation: 760,
    tag: '国内最高峰のビッグゲレンデ'
  },
  {
    id: 'nozawa-onsen',
    name: '野沢温泉スキー場',
    region: 'nagano',
    prefecture: '長野県',
    areaName: '野沢温泉村',
    lat: 36.9167,
    lng: 138.4500,
    topElevation: 1650,
    baseElevation: 565,
    tag: '豪雪＆天然温泉街'
  },
  {
    id: 'shiga-kogen-yakebitai',
    name: '志賀高原 焼額山スキー場',
    region: 'nagano',
    prefecture: '長野県',
    areaName: '山ノ内町',
    lat: 36.7456,
    lng: 138.5283,
    topElevation: 2009,
    baseElevation: 1550,
    tag: '標高2000m・超高品質スノー'
  },
  {
    id: 'karuizawa-prince',
    name: '軽井沢プリンスホテルスキー場',
    region: 'nagano',
    prefecture: '長野県',
    areaName: '軽井沢町',
    lat: 36.3356,
    lng: 138.6319,
    topElevation: 1155,
    baseElevation: 940,
    tag: '晴天率高・アクセス抜群'
  },

  // 新潟
  {
    id: 'naeba',
    name: '苗場スキー場',
    region: 'niigata',
    prefecture: '新潟県',
    areaName: '湯沢町',
    lat: 36.7917,
    lng: 138.7844,
    topElevation: 1789,
    baseElevation: 900,
    tag: 'ビッグスケール＆ドラゴンドラ'
  },
  {
    id: 'gala-yuzawa',
    name: 'GALA湯沢スキー場',
    region: 'niigata',
    prefecture: '新潟県',
    areaName: '湯沢町',
    lat: 36.9483,
    lng: 138.7981,
    topElevation: 1181,
    baseElevation: 358,
    tag: '新幹線駅直結'
  },
  {
    id: 'myoko-suginohara',
    name: '妙高杉ノ原スキー場',
    region: 'niigata',
    prefecture: '新潟県',
    areaName: '妙高市',
    lat: 36.8778,
    lng: 138.1639,
    topElevation: 1855,
    baseElevation: 731,
    tag: '最長滑走距離8,500m'
  },
  {
    id: 'akakura-kanko',
    name: '赤倉観光リゾートスキー場',
    region: 'niigata',
    prefecture: '新潟県',
    areaName: '妙高市',
    lat: 36.8928,
    lng: 138.1817,
    topElevation: 1500,
    baseElevation: 740,
    tag: '伝統リゾート＆極上雪質'
  },

  // 群馬
  {
    id: 'kawaba',
    name: '川場スキー場',
    region: 'gunma',
    prefecture: '群馬県',
    areaName: '川場村',
    lat: 36.7761,
    lng: 139.1172,
    topElevation: 1870,
    baseElevation: 1290,
    tag: '立体駐車場直結・オフピステ'
  },
  {
    id: 'marunuma-kogen',
    name: '丸沼高原スキー場',
    region: 'gunma',
    prefecture: '群馬県',
    areaName: '片品村',
    lat: 36.8336,
    lng: 139.3364,
    topElevation: 2000,
    baseElevation: 1400,
    tag: '標高2000m・日光白根の絶景'
  },
  {
    id: 'manza-onsen',
    name: '万座温泉スキー場',
    region: 'gunma',
    prefecture: '群馬県',
    areaName: '嬬恋村',
    lat: 36.6347,
    lng: 138.5131,
    topElevation: 1990,
    baseElevation: 1646,
    tag: '国内屈指の粉雪＆名湯'
  },

  // 福島
  {
    id: 'nekoma-mountain',
    name: '星野リゾート ネコマ マウンテン',
    region: 'fukushima',
    prefecture: '福島県',
    areaName: '磐梯町 / 北塩原村',
    lat: 37.6083,
    lng: 140.0525,
    topElevation: 1338,
    baseElevation: 680,
    tag: '南北連結ビッグゲレンデ'
  },
  {
    id: 'grandeco',
    name: 'グランデコスノーリゾート',
    region: 'fukushima',
    prefecture: '福島県',
    areaName: '北塩原村',
    lat: 37.6975,
    lng: 140.1194,
    topElevation: 1590,
    baseElevation: 1010,
    tag: '神雪パウダースノー'
  },

  // 宮城
  {
    id: 'miyagi-zao-eboshi',
    name: 'みやぎ蔵王えぼしリゾート',
    region: 'miyagi',
    prefecture: '宮城県',
    areaName: '蔵王町',
    lat: 38.1389,
    lng: 140.5283,
    topElevation: 1350,
    baseElevation: 600,
    tag: '宮城最大級・蔵王連峰一望'
  },
  {
    id: 'spring-valley-sendai',
    name: 'スプリングバレー仙台泉',
    region: 'miyagi',
    prefecture: '宮城県',
    areaName: '仙台市泉区',
    lat: 38.4172,
    lng: 140.7183,
    topElevation: 950,
    baseElevation: 687,
    tag: '仙台近郊・パーク充実'
  },

  // 静岡
  {
    id: 'snow-park-yeti',
    name: 'スノーパーク イエティ',
    region: 'shizuoka',
    prefecture: '静岡県',
    areaName: '裾野市 (富士山南麓)',
    lat: 35.2978,
    lng: 138.7758,
    topElevation: 1450,
    baseElevation: 1300,
    tag: '日本最速オープン・富士山ビュー'
  }
];
