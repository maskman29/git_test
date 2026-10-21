import { palette, seedCompanies } from "./data.js";
import {
  enrichCompany,
  formatAmount,
  formatMetric,
  formatRatio,
  maxAbsolute,
  metricDefinitions,
  validateBalance
} from "./metrics.js";

const STORAGE_KEY = "ir-scope-companies-v1";
const MAX_SELECTED = 4;
const state = {
  companies: loadCompanies(),
  selectedIds: new Set(["dynam-2026"]),
  chartMetric: "revenue"
};

const els = {
  companyList: document.querySelector("#company-list"),
  kpiGrid: document.querySelector("#kpi-grid"),
  periodNote: document.querySelector("#period-note"),
  chart: document.querySelector("#comparison-chart"),
  chartMetric: document.querySelector("#chart-metric"),
  insightList: document.querySelector("#insight-list"),
  tableHead: document.querySelector("#comparison-head"),
  tableBody: document.querySelector("#comparison-body"),
  sourceList: document.querySelector("#source-list"),
  dialog: document.querySelector("#company-dialog"),
  form: document.querySelector("#company-form"),
  formError: document.querySelector("#form-error"),
  toast: document.querySelector("#toast")
};

function loadCompanies() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    if (!Array.isArray(saved)) return seedCompanies.map(enrichCompany);
    return [...seedCompanies, ...saved].map(enrichCompany);
  } catch {
    return seedCompanies.map(enrichCompany);
  }
}

function selectedCompanies() {
  return state.companies.filter((company) => state.selectedIds.has(company.id));
}

function renderCompanyPicker() {
  els.companyList.innerHTML = "";
  state.companies.forEach((company, index) => {
    const label = document.createElement("label");
    label.className = `company-chip ${state.selectedIds.has(company.id) ? "selected" : ""}`;
    label.style.setProperty("--company-color", palette[index % palette.length]);

    const input = document.createElement("input");
    input.type = "checkbox";
    input.checked = state.selectedIds.has(company.id);
    input.value = company.id;
    input.addEventListener("change", () => toggleCompany(company.id, input));

    const dot = document.createElement("span");
    dot.className = "company-dot";
    dot.setAttribute("aria-hidden", "true");

    const text = document.createElement("span");
    text.innerHTML = `<strong>${escapeHtml(company.shortName || company.name)}</strong><small>${escapeHtml(company.period)}</small>`;
    label.append(input, dot, text);
    els.companyList.append(label);
  });

  const add = document.createElement("button");
  add.type = "button";
  add.className = "company-chip company-add";
  add.innerHTML = `<span aria-hidden="true">＋</span><span><strong>比較企業を追加</strong><small>決算数値を入力</small></span>`;
  add.addEventListener("click", openDialog);
  els.companyList.append(add);
}

function toggleCompany(id, input) {
  if (input.checked && state.selectedIds.size >= MAX_SELECTED) {
    input.checked = false;
    showToast("比較できるのは最大4社です");
    return;
  }
  if (!input.checked && state.selectedIds.size === 1) {
    input.checked = true;
    showToast("少なくとも1社を選択してください");
    return;
  }
  input.checked ? state.selectedIds.add(id) : state.selectedIds.delete(id);
  render();
}

function renderKpis(companies) {
  const primary = companies[0];
  const kpis = [
    { key: "revenue", label: "営業収入", helper: "事業から得た収入", type: "amount" },
    { key: "operatingProfit", label: "営業利益", helper: `利益率 ${formatRatio(primary.operatingMargin)}`, type: "amount" },
    { key: "netIncome", label: "当期純利益", helper: `純利益率 ${formatRatio(primary.netMargin)}`, type: "amount" },
    { key: "assets", label: "総資産", helper: `純資産 ${formatAmount(primary.equity)}`, type: "amount" },
    { key: "equityRatio", label: "自己資本比率", helper: "財務の安定性", type: "ratio" }
  ];

  els.periodNote.textContent = `${primary.name}・${primary.period}を先頭に表示`;
  els.kpiGrid.innerHTML = kpis.map((kpi, index) => `
    <article class="kpi-card ${index === 0 ? "featured" : ""}">
      <span class="kpi-index">0${index + 1}</span>
      <p>${kpi.label}</p>
      <strong>${formatMetric(primary[kpi.key], kpi.type)}${kpi.type === "amount" ? `<small>百万円</small>` : ""}</strong>
      <span class="kpi-helper">${kpi.helper}</span>
    </article>
  `).join("");
}

function renderChart(companies) {
  const definition = metricDefinitions.find((item) => item.key === state.chartMetric);
  const max = maxAbsolute(companies.map((company) => company[state.chartMetric]));
  const hint = companies.length === 1
    ? `<p class="chart-hint">比較企業を追加すると、ここに横並びで表示されます。</p>` : "";

  els.chart.innerHTML = `${hint}<div class="bar-area">
    ${companies.map((company, index) => {
      const value = company[state.chartMetric];
      const height = Math.max(5, (Math.abs(value || 0) / max) * 100);
      return `<div class="bar-column">
        <div class="bar-value">${formatMetric(value, definition.type)}${definition.type === "amount" ? `<small>百万円</small>` : ""}</div>
        <div class="bar-track"><div class="bar-fill" style="height:${height}%;--bar-color:${palette[index % palette.length]}"></div></div>
        <strong>${escapeHtml(company.shortName || company.name)}</strong><small>${escapeHtml(company.period)}</small>
      </div>`;
    }).join("")}
  </div>`;
}

function renderInsights(companies) {
  const primary = companies[0];
  const insights = [
    { value: formatRatio(primary.operatingMargin), title: "営業利益率", copy: `${formatAmount(primary.revenue)}百万円の営業収入から、${formatAmount(primary.operatingProfit)}百万円の営業利益を確保。` },
    { value: formatRatio(primary.equityRatio), title: "自己資本比率", copy: "総資産に占める純資産の割合。財務の安定性を見る代表的な指標です。" },
    { value: formatRatio(primary.currentRatio), title: "流動比率", copy: "短期の支払義務に対して、換金しやすい資産をどの程度持つかを示します。" }
  ];
  els.insightList.innerHTML = insights.map((item, index) => `
    <article class="insight-item"><span>0${index + 1}</span><div>
      <strong>${item.title}<em>${item.value}</em></strong><p>${item.copy}</p>
    </div></article>
  `).join("");
}

function renderTable(companies) {
  els.tableHead.innerHTML = `<tr><th>指標</th>${companies.map((company, index) => `
    <th><span class="table-company-dot" style="background:${palette[index % palette.length]}"></span>${escapeHtml(company.shortName || company.name)}<small>${escapeHtml(company.period)}</small></th>
  `).join("")}</tr>`;
  els.tableBody.innerHTML = metricDefinitions.map((metric) => `<tr><th>${metric.label}</th>
    ${companies.map((company) => `<td>${formatMetric(company[metric.key], metric.type)}</td>`).join("")}</tr>`).join("");
}

function renderSources(companies) {
  els.sourceList.innerHTML = companies.map((company, index) => `
    <article class="source-card">
      <div class="source-number">0${index + 1}</div><div>
        <span class="source-badge">${escapeHtml(company.importedFrom || "手入力")}</span>
        <h3>${escapeHtml(company.name)}</h3>
        <p>${escapeHtml(company.source)}${company.sourceFile ? ` ／ ${escapeHtml(company.sourceFile)}` : ""}</p>
        ${(company.notes || []).map((note) => `<small>${escapeHtml(note)}</small>`).join("")}
      </div>${company.locked ? "" : `<button class="text-button" data-remove-id="${company.id}" type="button">削除</button>`}
    </article>
  `).join("");
  els.sourceList.querySelectorAll("[data-remove-id]").forEach((button) => {
    button.addEventListener("click", () => removeCompany(button.dataset.removeId));
  });
}

function render() {
  const companies = selectedCompanies();
  renderCompanyPicker();
  renderKpis(companies);
  renderChart(companies);
  renderInsights(companies);
  renderTable(companies);
  renderSources(companies);
}

function openDialog() {
  els.form.reset();
  els.formError.textContent = "";
  els.dialog.showModal();
  requestAnimationFrame(() => els.form.elements.name.focus());
}

function closeDialog() { els.dialog.close(); }

function handleSubmit(event) {
  event.preventDefault();
  const formData = new FormData(els.form);
  const numericKeys = ["revenue", "operatingProfit", "ordinaryProfit", "netIncome", "assets", "liabilities", "equity", "currentAssets", "currentLiabilities"];
  const company = {
    id: `custom-${Date.now()}`,
    name: formData.get("name").trim(),
    shortName: formData.get("name").trim().replace(/株式会社|合同会社|有限会社/g, "").trim(),
    period: formData.get("period").trim(),
    source: formData.get("source").trim(),
    importedFrom: "手入力",
    unit: "百万円",
    notes: ["入力値は利用者が登録したデータです。原資料と照合してご利用ください。"],
    locked: false
  };
  numericKeys.forEach((key) => { company[key] = Number(formData.get(key)); });

  if (!validateBalance(company)) {
    els.formError.textContent = "総資産と「負債合計＋純資産合計」が一致していません（許容差1百万円）。";
    return;
  }
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  saved.push(company);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  state.companies.push(enrichCompany(company));
  if (state.selectedIds.size < MAX_SELECTED) state.selectedIds.add(company.id);
  closeDialog();
  render();
  showToast(`${company.shortName || company.name}を比較に追加しました`);
}

function removeCompany(id) {
  const company = state.companies.find((item) => item.id === id);
  if (!company || company.locked) return;
  state.companies = state.companies.filter((item) => item.id !== id);
  state.selectedIds.delete(id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.companies.filter((item) => !item.locked)));
  if (state.selectedIds.size === 0) state.selectedIds.add("dynam-2026");
  render();
  showToast("企業データを削除しました");
}

let toastTimer;
function showToast(message) {
  clearTimeout(toastTimer);
  els.toast.textContent = message;
  els.toast.classList.add("visible");
  toastTimer = setTimeout(() => els.toast.classList.remove("visible"), 2600);
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
  })[character]);
}

document.querySelector("#open-company-dialog").addEventListener("click", openDialog);
document.querySelector("#close-company-dialog").addEventListener("click", closeDialog);
document.querySelector("#cancel-company").addEventListener("click", closeDialog);
els.form.addEventListener("submit", handleSubmit);
els.chartMetric.addEventListener("change", (event) => {
  state.chartMetric = event.target.value;
  renderChart(selectedCompanies());
});
els.dialog.addEventListener("click", (event) => { if (event.target === els.dialog) closeDialog(); });
render();
