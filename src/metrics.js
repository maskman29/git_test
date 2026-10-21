export const metricDefinitions = [
  { key: "revenue", label: "営業収入", type: "amount" },
  { key: "operatingProfit", label: "営業利益", type: "amount" },
  { key: "ordinaryProfit", label: "経常利益", type: "amount" },
  { key: "netIncome", label: "当期純利益", type: "amount" },
  { key: "assets", label: "総資産", type: "amount" },
  { key: "liabilities", label: "負債合計", type: "amount" },
  { key: "equity", label: "純資産合計", type: "amount" },
  { key: "operatingMargin", label: "営業利益率", type: "ratio" },
  { key: "netMargin", label: "純利益率", type: "ratio" },
  { key: "roa", label: "ROA（総資産利益率）", type: "ratio" },
  { key: "equityRatio", label: "自己資本比率", type: "ratio" },
  { key: "currentRatio", label: "流動比率", type: "ratio" },
  { key: "currentAssetRatio", label: "流動資産比率", type: "ratio" },
  { key: "debtToEquityRatio", label: "負債比率", type: "ratio" },
  { key: "cashRatio", label: "現金比率", type: "ratio" },
  { key: "fixedRatio", label: "固定比率", type: "ratio" },
  { key: "revenueGrowth", label: "営業収入成長率", type: "ratio" },
  { key: "operatingProfitGrowth", label: "営業利益成長率", type: "ratio" },
  { key: "ordinaryProfitGrowth", label: "経常利益成長率", type: "ratio" },
  { key: "netIncomeGrowth", label: "純利益成長率", type: "ratio" },
  { key: "assetsGrowth", label: "総資産増減率", type: "ratio" },
  { key: "equityGrowth", label: "純資産増減率", type: "ratio" },
  { key: "safetyMarginRatio", label: "安全余裕率", type: "ratio" }
];

export function safeRatio(numerator, denominator) {
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator === 0) return null;
  return (numerator / denominator) * 100;
}

export function growthRate(current, previous) {
  if (!Number.isFinite(current) || !Number.isFinite(previous) || previous === 0) return null;
  return ((current - previous) / Math.abs(previous)) * 100;
}

export function enrichCompany(company) {
  const fixedAssets = Number.isFinite(company.assets) && Number.isFinite(company.currentAssets)
    ? company.assets - company.currentAssets
    : null;
  const previousFixedAssets = Number.isFinite(company.previousAssets) && Number.isFinite(company.previousCurrentAssets)
    ? company.previousAssets - company.previousCurrentAssets
    : null;
  const equityRatio = safeRatio(company.equity, company.assets);
  const currentRatio = safeRatio(company.currentAssets, company.currentLiabilities);
  const previousEquityRatio = safeRatio(company.previousEquity, company.previousAssets);
  const previousCurrentRatio = safeRatio(company.previousCurrentAssets, company.previousCurrentLiabilities);
  return {
    ...company,
    operatingMargin: safeRatio(company.operatingProfit, company.revenue),
    netMargin: safeRatio(company.netIncome, company.revenue),
    roa: safeRatio(company.netIncome, company.assets),
    equityRatio,
    currentRatio,
    currentAssetRatio: safeRatio(company.currentAssets, company.assets),
    debtToEquityRatio: safeRatio(company.liabilities, company.equity),
    cashRatio: safeRatio(company.cash, company.currentLiabilities),
    fixedRatio: safeRatio(fixedAssets, company.equity),
    previousEquityRatio,
    previousCurrentRatio,
    previousCurrentAssetRatio: safeRatio(company.previousCurrentAssets, company.previousAssets),
    previousDebtToEquityRatio: safeRatio(company.previousLiabilities, company.previousEquity),
    previousCashRatio: safeRatio(company.previousCash, company.previousCurrentLiabilities),
    previousFixedRatio: safeRatio(previousFixedAssets, company.previousEquity),
    equityRatioChange: pointChange(equityRatio, previousEquityRatio),
    currentRatioChange: pointChange(currentRatio, previousCurrentRatio),
    revenueGrowth: growthRate(company.revenue, company.previousRevenue),
    operatingProfitGrowth: growthRate(company.operatingProfit, company.previousOperatingProfit),
    ordinaryProfitGrowth: growthRate(company.ordinaryProfit, company.previousOrdinaryProfit),
    netIncomeGrowth: growthRate(company.netIncome, company.previousNetIncome),
    assetsGrowth: growthRate(company.assets, company.previousAssets),
    liabilitiesGrowth: growthRate(company.liabilities, company.previousLiabilities),
    equityGrowth: growthRate(company.equity, company.previousEquity),
    cashGrowth: growthRate(company.cash, company.previousCash),
    safetyMarginRatio: Number.isFinite(company.breakEvenRevenue)
      ? safeRatio(company.revenue - company.breakEvenRevenue, company.revenue)
      : null
  };
}

export function pointChange(current, previous) {
  if (!Number.isFinite(current) || !Number.isFinite(previous)) return null;
  return current - previous;
}

export function formatAmount(value) {
  if (!Number.isFinite(value)) return "—";
  return new Intl.NumberFormat("ja-JP").format(value);
}

export function formatRatio(value) {
  if (!Number.isFinite(value)) return "—";
  return `${value.toFixed(1)}%`;
}

export function formatMetric(value, type) {
  return type === "ratio" ? formatRatio(value) : formatAmount(value);
}

export function maxAbsolute(values) {
  const finite = values.filter(Number.isFinite).map(Math.abs);
  return finite.length ? Math.max(...finite, 1) : 1;
}

export function validateBalance(company, tolerance = 1) {
  if (![company.assets, company.liabilities, company.equity].every(Number.isFinite)) return false;
  return Math.abs(company.assets - company.liabilities - company.equity) <= tolerance;
}
