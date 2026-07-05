// 基金 / ETF 领域模型
export interface FundCode {
  code: string;
  name: string;
  type?: string;
  category?: string;
}

export interface Quote {
  symbol: string;
  name?: string;
  current?: number;
  change?: number;
  changePercent?: number;
  open?: number;
  high?: number;
  low?: number;
  volume?: number;
  turnover?: number;
  timestamp?: number;
  assetType?: string;
}

export interface NavPoint {
  date: string;
  timestamp?: number;
  nav: number;
  accumulatedNav?: number;
  changePercent?: number;
}

export interface Holding {
  marketId: string;
  code: string;
  name?: string;
  shares?: number;
  marketValue?: number;
  ratio?: number;
}

export interface AssetAllocation {
  date: string;
  timestamp?: number;
  stockRatio?: number;
  bondRatio?: number;
  cashRatio?: number;
  otherRatio?: number;
  netAsset?: number;
}

export interface Position {
  date: string;
  timestamp?: number;
  position: number;
}

export interface Manager {
  id: string;
  name: string;
  avatarUrl?: string;
  star?: number;
  workTime?: string;
  fundSize?: string;
  power?: {
    overall?: number;
    categories: string[];
    scores: (number | null)[];
    descriptions: string[];
  };
}

export interface Performance {
  overall?: number;
  categories: string[];
  scores: (number | null)[];
  descriptions: string[];
}

export interface StageReturns {
  oneMonth?: number | null;
  threeMonth?: number | null;
  sixMonth?: number | null;
  oneYear?: number | null;
}

export interface FundProfile {
  code: string;
  name?: string;
  type?: string;
  sourceRate?: number;
  rate?: number;
  minSubscription?: number;
  holdings?: Holding[];
  assetAllocation?: AssetAllocation[];
  positions?: Position[];
  managers?: Manager[];
  performance?: Performance;
  stageReturns?: StageReturns;
}

export interface FundDetail {
  code: string;
  name?: string;
  type?: string;
  profile?: FundProfile;
  quote?: Quote;
  latestNav?: NavPoint;
  navSeries?: NavPoint[];
  dividends?: any[];
  rank?: any[];
}

export type FundWithQuote = FundCode & { quote?: Quote };
