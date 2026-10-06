/* Standalone, synthetic UI examples. No production data, AI or backend integration. */
(function () {
  "use strict";
  const industries = [
    { id: "vip", label: "VIP 會員", products: ["示範會員體驗卡", "示範生活禮遇卡", "示範年度服務卡"] },
    { id: "commerce", label: "多品項電商", products: ["示範生活收納組", "示範旅行配件組", "示範居家清潔組"] },
    { id: "insurance", label: "保險", products: ["示範保障諮詢", "示範家庭需求諮詢", "示範保障盤點服務"] },
    { id: "property", label: "房產", products: ["示範住宅看屋服務", "示範空間需求諮詢", "示範社區導覽"] },
    { id: "wellness", label: "藥品／保健品服務", products: ["示範日常保養諮詢", "示範商品資訊服務", "示範使用須知諮詢"] },
    { id: "interior", label: "室內裝修＆系統家具", products: ["示範收納規劃", "示範系統櫃諮詢", "示範空間設計諮詢"] },
    { id: "mixed", label: "多產業需求分流", products: ["示範需求整理", "示範服務媒合", "示範後續諮詢"] }
  ];
  const categoryLabels = { channels: "銷售與服務", customer: "客戶經營", training: "訓練與管理" };
  const features = [
    { title: "Start · 需求接觸", category: "channels", text: "會員申請、需求問卷與 AI 對話，接續推薦及銷售服務。" },
    { title: "電話與 LINE", category: "channels", text: "來電、外撥與訊息服務，支援真人 AI 輔助與 AI 自動服務。" },
    { title: "Email 與現場銷售", category: "channels", text: "來信詢價、客服回覆，以及現場逐字稿與即時話術建議。" },
    { title: "客戶畫像", category: "customer", text: "整理客戶需求、互動摘要、來源證據與待確認事項。" },
    { title: "銷售底冊", category: "customer", text: "依客戶意願、互動及事件排序，協助安排下一次服務。" },
    { title: "訂單、付款與配送", category: "channels", text: "選擇付款方式、核對商品金額與收貨資訊，追蹤訂單進度。" },
    { title: "客戶模擬與新人訓練", category: "training", text: "模擬客戶對答、專員練習與即時建議，和正式客戶資料分開。" },
    { title: "視覺化話術管理", category: "training", text: "以主狀態、子狀態及話術節點整理銷售內容與版本。" },
    { title: "話術與畫像分析", category: "training", text: "回顧狀態、情緒、互動趨勢與待確認資訊，改善後續服務。" }
  ];
  function productsFor(industryId) {
    const industry = industries.find(item => item.id === industryId) || industries[0];
    return industry.products.map((title, index) => ({ id: `${industry.id}-${index + 1}`, title, description: "虛構展示項目 · 不提供報價或交易" }));
  }
  function filterFeatures(query, category) {
    const needle = String(query || "").trim().normalize("NFKC").toLocaleLowerCase();
    return features.filter(item => (category === "all" || item.category === category) && `${item.title} ${item.text}`.normalize("NFKC").toLocaleLowerCase().includes(needle));
  }
  function selectionSummary(industryId, selected) {
    const products = productsFor(industryId).filter(item => selected.has(item.id));
    return products.length ? `已選 ${products.length} 項：${products.map(item => item.title).join("、")}。僅為展示，不會送出。` : "尚未選取商品，請勾選上方卡片。";
  }
  // Expose only pure showcase helpers to Node's built-in test runner.
  if (typeof module !== "undefined" && module.exports) module.exports = { industries, features, productsFor, filterFeatures, selectionSummary };
  if (typeof document === "undefined") return;

  const industrySelect = document.getElementById("industry");
  const productContainer = document.getElementById("products");
  const clearButton = document.getElementById("clear-selection");
  const summary = document.getElementById("selection-summary");
  const search = document.getElementById("feature-search");
  const categorySelect = document.getElementById("feature-category");
  const featureContainer = document.getElementById("feature-cards");
  const selected = new Set();
  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }
  function updateSummary() {
    summary.textContent = selectionSummary(industrySelect.value, selected);
    clearButton.disabled = selected.size === 0;
  }
  function renderProducts() {
    selected.clear();
    productContainer.replaceChildren();
    for (const product of productsFor(industrySelect.value)) {
      const label = element("label", "product-card");
      const checkbox = element("input");
      checkbox.type = "checkbox";
      checkbox.value = product.id;
      checkbox.name = "demo-products";
      const copy = element("span");
      copy.append(element("strong", "", product.title), element("small", "", product.description));
      label.append(checkbox, copy);
      checkbox.addEventListener("change", () => {
        if (checkbox.checked) selected.add(product.id);
        else selected.delete(product.id);
        updateSummary();
      });
      productContainer.append(label);
    }
    updateSummary();
  }
  function renderFeatures() {
    const results = filterFeatures(search.value, categorySelect.value);
    featureContainer.replaceChildren();
    for (const feature of results) {
      const card = element("article", "feature-card");
      card.append(element("span", "feature-number", categoryLabels[feature.category]), element("h3", "", feature.title), element("p", "", feature.text));
      featureContainer.append(card);
    }
    document.getElementById("feature-count").textContent = `顯示 ${results.length} / ${features.length} 項公開功能介紹`;
    document.getElementById("empty-results").hidden = results.length > 0;
  }
  industrySelect.replaceChildren();
  for (const industry of industries) {
    const option = element("option", "", industry.label);
    option.value = industry.id;
    industrySelect.append(option);
  }
  industrySelect.disabled = false;
  search.disabled = false;
  categorySelect.disabled = false;
  industrySelect.addEventListener("change", renderProducts);
  clearButton.addEventListener("click", () => {
    selected.clear();
    for (const checkbox of productContainer.querySelectorAll("input")) checkbox.checked = false;
    updateSummary();
  });
  search.addEventListener("input", renderFeatures);
  categorySelect.addEventListener("change", renderFeatures);
  renderProducts();
  renderFeatures();
})();
