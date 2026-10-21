export const seedCompanies = [
  {
    id: "dynam-2026",
    name: "株式会社ダイナム",
    shortName: "ダイナム",
    period: "2026年3月期",
    unit: "百万円",
    source: "第59期 2026年3月期 決算公告",
    sourceFile: "dynam_k_59.pdf",
    importedFrom: "PDFから登録",
    revenue: 108289,
    operatingProfit: 4233,
    ordinaryProfit: 5379,
    netIncome: 3008,
    assets: 133607,
    liabilities: 52153,
    equity: 81453,
    currentAssets: 40628,
    currentLiabilities: 29996,
    cash: 25018,
    interestBearingDebt: 26176,
    notes: [
      "営業収入は、貸玉収入から景品出庫額を控除した遊技業収入と自販機手数料等収入の合計です。",
      "単体決算の数値です。企業間比較では、連結・単体および会計基準の違いに注意してください。"
    ],
    locked: true
  },
  {
    id: "unnamed-45-2025",
    name: "企業名未記載（第45期）",
    shortName: "名称未記載・第45期",
    period: "2025年12月期",
    unit: "百万円",
    source: "第45期 2025年12月期 貸借対照表・損益計算書",
    sourceFile: "45_finance.pdf",
    importedFrom: "PDFから登録",
    revenue: 103540,
    operatingProfit: 695,
    ordinaryProfit: 687,
    netIncome: 505,
    assets: 32082,
    liabilities: 15990,
    equity: 16092,
    currentAssets: 15662,
    currentLiabilities: 8477,
    cash: 9239,
    interestBearingDebt: 8033,
    notes: [
      "原資料の単位は円です。アプリでは各数値を百万円単位に四捨五入しています。",
      "PDF内に企業名の記載がないため、発行企業名は未確定です。名称確認後に更新してください。"
    ],
    locked: true
  },
  {
    id: "shoei-project-2025",
    name: "株式会社 正栄プロジェクト",
    shortName: "正栄プロジェクト",
    period: "2025年12月期",
    unit: "百万円",
    source: "第35期 2025年12月期 決算報告書",
    sourceFile: "financial_report_35.pdf",
    importedFrom: "PDFから登録",
    revenue: 41140,
    operatingProfit: 748,
    ordinaryProfit: 1126,
    netIncome: 1970,
    assets: 18236,
    liabilities: 10767,
    equity: 7469,
    currentAssets: 2145,
    currentLiabilities: 3739,
    cash: 1243,
    interestBearingDebt: 7624,
    notes: [
      "原資料の単位は円です。アプリでは各数値を百万円単位に四捨五入しています。",
      "当期純利益には、有価証券売却益などの特別利益1,916百万円が含まれています。企業比較では一時要因に注意してください。"
    ],
    locked: true
  }
];

export const palette = ["#eeff54", "#20c997", "#7c83ff", "#ff8d6b"];
