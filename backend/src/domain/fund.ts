// 领域模型：基金 / ETF

// 基金代码（codes-fund 列表项）
export type FundCode = {
  code: string;             // 基金代码
  name: string;             // 基金名称
  type?: string;            // 类型：股票型 / 混合型 / 债券型 / ETF / LOF 等
  category?: string;        // 子分类
};

// 实时行情（quote-fund）
export type Quote = {
  symbol: string;           // 基金代码
  name?: string;            // 基金名称
  current?: number;         // 当前价 / 最新净值
  change?: number;          // 涨跌额
  changePercent?: number;   // 涨跌幅 %
  open?: number;            // 开盘
  high?: number;            // 最高
  low?: number;             // 最低
  volume?: number;          // 成交量
  turnover?: number;        // 成交额
  timestamp?: number;       // 时间戳
  assetType?: string;
};

// 估值（fund-estimate）
export type Estimate = {
  symbol: string;
  estimatedNav?: number;    // 估算净值
  estimatedChange?: number; // 估算涨跌
  estimatedChangePercent?: number;
  updateTime?: number;
};

// 净值点（fund-nav）
export type NavPoint = {
  date: string;             // YYYY-MM-DD
  timestamp?: number;
  nav: number;              // 单位净值
  accumulatedNav?: number;  // 累计净值
  changePercent?: number;   // 当日涨跌幅
};

// 持仓（fund-profile.holdings）
export type Holding = {
  marketId: string;         // 0=深市 1=沪市
  code: string;             // 股票代码
  name?: string;            // 股票名称
  shares?: number;
  marketValue?: number;     // 市值
  ratio?: number;           // 占净值比 %
};

// 资产配置（fund-profile.assetAllocation）
export type AssetAllocation = {
  date: string;
  timestamp?: number;
  stockRatio?: number;      // 股票 %
  bondRatio?: number;       // 债券 %
  cashRatio?: number;       // 现金 %
  otherRatio?: number;      // 其他 %
  netAsset?: number;        // 净资产（亿元）
};

// 仓位（fund-profile.positions）
export type Position = {
  date: string;
  timestamp?: number;
  position: number;         // 股票仓位 %
};

// 经理（fund-profile.managers）
export type Manager = {
  id: string;
  name: string;
  avatarUrl?: string;
  star?: number;            // 评分
  workTime?: string;        // 从业年限
  fundSize?: string;        // 在管规模
  power?: {
    overall?: number;
    categories: string[];
    scores: (number | null)[];
    descriptions: string[];
  };
};

// 业绩评分（fund-profile.performance）
export type Performance = {
  overall?: number;
  categories: string[];
  scores: (number | null)[];
  descriptions: string[];
};

// 阶段收益（fund-profile.stageReturns）
export type StageReturns = {
  oneMonth?: number | null;
  threeMonth?: number | null;
  sixMonth?: number | null;
  oneYear?: number | null;
  threeYear?: number | null;
  fiveYear?: number | null;
  sinceInception?: number | null;
};

// 同类基金（fund-profile.sameType.groups）
export type SameTypeEntry = {
  code: string;
  name: string;
  value: number;
};

export type SameType = {
  groups: SameTypeEntry[][];  // 多组维度
};

// 规模变动（fund-profile.scaleChanges）
export type ScaleChange = {
  date: string;
  scale: number;
  mom?: string;
};

// 申赎（fund-profile.buySedemption）
export type BuySedemption = {
  date: string;
  timestamp?: number;
  buy?: number;
  sell?: number;
  total?: number;
};

// 分红（fund-dividend）
export type Dividend = {
  date: string;
  perShare?: number;         // 每份分红
  totalAmount?: number;      // 分红总额
  type?: string;             // 现金 / 红利再投
};

// 排名点（fund-rank）
export type RankPoint = {
  date: string;
  rank?: number;
  totalCount?: number;       // 同类总数
  percentile?: number;       // 百分位
  similarAvg?: number;       // 同类平均
};

// 基金完整画像
export type FundProfile = {
  code: string;
  name: string;
  type?: string;             // 基金类型（从 profile 推断或额外字段）
  sourceRate?: number;       // 原费率 %
  rate?: number;             // 当前费率 %
  minSubscription?: number;  // 起购金额
  holdings?: Holding[];      // 季度前十大持仓
  bondHoldings?: Holding[];
  assetAllocation?: AssetAllocation[];
  positions?: Position[];
  managers?: Manager[];
  performance?: Performance;
  holderStructure?: any[];
  scaleChanges?: ScaleChange[];
  buySedemption?: BuySedemption[];
  stageReturns?: StageReturns;
  sameType?: SameType;
};

// 完整基金详情（组合多个 API）
export type FundDetail = {
  code: string;
  name?: string;
  type?: string;
  profile?: FundProfile;
  quote?: Quote;
  estimate?: Estimate;
  latestNav?: NavPoint;
  navSeries?: NavPoint[];
  dividends?: Dividend[];
  rank?: RankPoint[];
};
