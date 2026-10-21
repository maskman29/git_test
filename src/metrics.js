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
  { key: "equityRatio", label: "自己資本比率", type: "ratio" },
  { key: "currentRatio", label: "流動比率", type: "ratio" }
];

export function safeRatio(numerator, denominator) {
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator === 0) return null;
  return (numerator / denominator) * 100;
}

export function enrichCompany(company) {
  return {
    ...company,
    operatingMargin: safeRatio(company.operatingProfit, company.revenue),
    netMargin: safeRatio(company.netIncome, company.revenue),
    equityRatio: safeRatio(company.equity, company.assets),
    currentRatio: safeRatio(company.currentAssets, company.currentLiabilities)
  };
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
