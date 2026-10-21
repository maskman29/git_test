import test from "node:test";
import assert from "node:assert/strict";
import { seedCompanies } from "../src/data.js";
import {
  enrichCompany,
  formatAmount,
  formatRatio,
  growthRate,
  maxAbsolute,
  safeRatio,
  validateBalance
} from "../src/metrics.js";

const dynam = {
  revenue: 108289,
  operatingProfit: 4233,
  netIncome: 3008,
  assets: 133607,
  liabilities: 52153,
  equity: 81453,
  currentAssets: 40628,
  currentLiabilities: 29996
};

test("ダイナムの主要比率を計算できる", () => {
  const result = enrichCompany(dynam);
  assert.equal(result.operatingMargin.toFixed(1), "3.9");
  assert.equal(result.netMargin.toFixed(1), "2.8");
  assert.equal(result.equityRatio.toFixed(1), "61.0");
  assert.equal(result.currentRatio.toFixed(1), "135.4");
  assert.equal(result.currentAssetRatio.toFixed(1), "30.4");
  assert.equal(result.debtToEquityRatio.toFixed(1), "64.0");
  assert.equal(result.roa.toFixed(1), "2.3");
});

test("ゼロ除算と不正値を安全に扱う", () => {
  assert.equal(safeRatio(1, 0), null);
  assert.equal(safeRatio(Number.NaN, 100), null);
  assert.equal(formatRatio(null), "—");
});

test("成長率と安全余裕率を任意データから計算できる", () => {
  assert.equal(growthRate(120, 100), 20);
  assert.equal(growthRate(100, 0), null);
  const result = enrichCompany({ ...dynam, previousRevenue: 100000, previousOperatingProfit: 4000, breakEvenRevenue: 90000 });
  assert.equal(result.revenueGrowth.toFixed(1), "8.3");
  assert.equal(result.operatingProfitGrowth.toFixed(1), "5.8");
  assert.equal(result.safetyMarginRatio.toFixed(1), "16.9");
});

test("現金情報がない場合は現金比率を推測しない", () => {
  assert.equal(enrichCompany(dynam).cashRatio, null);
  assert.equal(enrichCompany({ ...dynam, cash: 25018 }).cashRatio.toFixed(1), "83.4");
});

test("数値を日本語形式で表示する", () => {
  assert.equal(formatAmount(108289), "108,289");
  assert.equal(formatRatio(60.965), "61.0%");
});

test("絶対値ベースでチャート最大値を返す", () => {
  assert.equal(maxAbsolute([-8, 2, 5]), 8);
  assert.equal(maxAbsolute([]), 1);
});

test("貸借対照表の整合性を許容差内で検証する", () => {
  assert.equal(validateBalance(dynam), true);
  assert.equal(validateBalance({ ...dynam, assets: 140000 }), false);
});

test("PDFから登録した全企業の貸借が一致する", () => {
  seedCompanies.forEach((company) => assert.equal(validateBalance(company), true, company.name));
});
