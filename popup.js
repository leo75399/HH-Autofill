document.addEventListener("DOMContentLoaded", () => {
  loadTemplates();
  // setInitialDateTime(); // Removed default date/time setting

  // --- Flatpickr Initialization ---
  flatpickr(".js-flatpickr-date", {
    dateFormat: "Y/m/d",
    theme: "dark",
    disableMobile: true,
    allowInput: true,
  });

  flatpickr(".js-flatpickr-time", {
    enableTime: true,
    noCalendar: true,
    dateFormat: "H:i:S",
    time_24hr: true,
    enableSeconds: true,
    theme: "dark",
    disableMobile: true,
    allowInput: true,
  });

  // --- Tab Navigation Logic ---
  const tabs = document.querySelectorAll(".tab-btn");
  const contents = document.querySelectorAll(".tab-content");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      // 1. 取消所有分頁的啟用狀態
      tabs.forEach((t) => t.removeAttribute("data-active"));
      // 2. 隱藏所有內容
      contents.forEach((c) => c.classList.remove("active"));

      // 3. Activate clicked tab
      tab.setAttribute("data-active", "true");

      // 4. Show target content
      const targetId = tab.getAttribute("data-tab");
      const targetContent = document.getElementById(targetId);
      if (targetContent) {
        targetContent.classList.add("active");
      }
    });
  });

  // Main Buttons
  const fillBtn = document.getElementById("fillBtn");
  if (fillBtn) fillBtn.addEventListener("click", fillCurrentTab);

  // Template Events - Tab 1
  document.getElementById("btn-save-template").addEventListener("click", () => saveNewTemplate("newTemplateName"));
  document.getElementById("btn-delete-template").addEventListener("click", () => deleteTemplate("templateSelect"));
  document.getElementById("templateSelect").addEventListener("change", () => loadSelectedTemplate("templateSelect"));

  // Template Events - Tab 3 (General)
  document.getElementById("btn-save-template-general").addEventListener("click", () => saveNewTemplate("newTemplateNameGeneral"));
  document.getElementById("btn-delete-template-general").addEventListener("click", () => deleteTemplate("templateSelectGeneral"));
  document.getElementById("templateSelectGeneral").addEventListener("change", () => loadSelectedTemplate("templateSelectGeneral"));

  // Add Row Buttons
  document.getElementById("btn-add-traffic").addEventListener("click", () => addBudgetRow("traffic"));
  document.getElementById("btn-add-other").addEventListener("click", () => addBudgetRow("other"));
  document.getElementById("btn-add-meal").addEventListener("click", () => addBudgetRow("meal"));

  // Initialize with 1 empty row for each
  addBudgetRow("traffic");
  addBudgetRow("other");
  addBudgetRow("meal");

  // General Tab Init
  document.getElementById("btn-add-general-row").addEventListener("click", () => addGeneralRow());
  document.getElementById("fillGeneralBtn").addEventListener("click", fillCurrentTab);
  addGeneralRow(); // Default 1 row

  // === 問題回報功能 ===
  const reportFab = document.getElementById("reportFab");
  const reportOverlay = document.getElementById("reportOverlay");
  const reportClose = document.getElementById("reportClose");
  const reportSubmit = document.getElementById("reportSubmit");

  // 開啟 overlay
  reportFab.addEventListener("click", () => {
    reportOverlay.classList.add("active");
  });

  // 關閉 overlay
  reportClose.addEventListener("click", () => {
    reportOverlay.classList.remove("active");
  });

  // 點擊背景關閉
  reportOverlay.addEventListener("click", (e) => {
    if (e.target === reportOverlay) {
      reportOverlay.classList.remove("active");
    }
  });

  // 送出回報
  reportSubmit.addEventListener("click", submitReport);
});

// ========== 費用類型對照表（完整版，取自真實 TERS 系統） ==========
const FEE_TYPE_MAPPING = {
  差旅費: [
    { text: "膳雜費", value: "A" },
    { text: "膳雜費-防疫", value: "A1" },
    { text: "住宿費", value: "B" },
    { text: "住宿費-防疫", value: "B1" },
    { text: "機票費", value: "C" },
    { text: "交通費-防疫", value: "C1" },
    { text: "交通費-其他", value: "D" },
    { text: "證照費", value: "E" },
    { text: "其他費用", value: "F" },
    { text: "誤餐費", value: "H" },
    { text: "零用金", value: "I" },
    { text: "其他費用-防疫", value: "W1" },
  ],
  L01: [
    { text: "印刷費", value: "L0101" },
    { text: "其他", value: "L0102" },
    { text: "書報雜誌", value: "L0103" },
    { text: "辦公用品", value: "L0104" },
    { text: "辦公室管理及清潔費", value: "L0105" },
    { text: "郵費", value: "L0106" },
    { text: "辦公設備", value: "L0107" },
  ],
  L02: [
    { text: "車資", value: "L0201" },
    { text: "其他", value: "L0202" },
    { text: "路橋及停車費", value: "L0203" },
    { text: "司機費用", value: "L0204" },
    { text: "汽油", value: "L0206" },
    { text: "柴油", value: "L0207" },
    { text: "電話費", value: "L0208" },
    { text: "誤餐費", value: "L0209" },
  ],
  L03: [
    { text: "手機話費", value: "L0301" },
    { text: "其他", value: "L0302" },
    { text: "座機話費", value: "L0303" },
    { text: "傳真費", value: "L0304" },
    { text: "網絡費用", value: "L0305" },
  ],
  L04: [
    { text: "生產設備", value: "L0401" },
    { text: "其他設備", value: "L0402" },
    { text: "運輸設備", value: "L0403" },
    { text: "廠房", value: "L0404" },
    { text: "存貨", value: "L0405" },
    { text: "團保/意外保險", value: "L0406" },
    { text: "運輸保險費", value: "L0407" },
    { text: "醫療保險", value: "L0408" },
    { text: "其他", value: "L0409" },
    { text: "宿舍", value: "L0410" },
    { text: "安全保險", value: "L0411" },
    { text: "商業-意外", value: "L0412" },
    { text: "模具設備", value: "L0413" },
    { text: "業務保險費", value: "L0414" },
    { text: "人員保險費", value: "L0415" },
  ],
  L05: [
    { text: "交通費", value: "L0501" },
    { text: "仲介費", value: "L0502" },
    { text: "住宿", value: "L0503" },
    { text: "其他", value: "L0504" },
    { text: "招募廣告", value: "L0505" },
    { text: "場地活動費", value: "L0506" },
  ],
  L06: [
    { text: "培訓費", value: "L0601" },
    { text: "其他", value: "L0602" },
    { text: "教材及教具", value: "L0603" },
    { text: "場地費", value: "L0604" },
    { text: "講師費", value: "L0605" },
    { text: "人員成本", value: "L0606" },
    { text: "建教合作", value: "L0607" },
  ],
  L07: [
    { text: "水費", value: "L0701" },
    { text: "其他", value: "L0702" },
    { text: "清潔費", value: "L0703" },
    { text: "電費", value: "L0704" },
    { text: "管理費", value: "L0705" },
    { text: "網絡費", value: "L0706" },
    { text: "柴油", value: "L0707" },
    { text: "燃料費", value: "L0708" },
    { text: "宿舍用品", value: "L0709" },
  ],
  L08: [
    { text: "伙食費", value: "L0801" },
    { text: "其他", value: "L0802" },
    { text: "洗衣費", value: "L0803" },
    { text: "食品檢測", value: "L0804" },
    { text: "員工醫療自保", value: "L0805" },
    { text: "消殺費", value: "L0806" },
    { text: "婚喪嫁娶禮金", value: "L0807" },
    { text: "康樂活動", value: "L0808" },
    { text: "清潔費", value: "L0809" },
    { text: "祭祀", value: "L0810" },
    { text: "摸彩活動", value: "L0811" },
    { text: "瓦斯費", value: "L0812" },
    { text: "健康檢查", value: "L0813" },
    { text: "員工聚餐", value: "L0814" },
  ],
  L09: [
    { text: "其他", value: "L0901" },
    { text: "產品", value: "L0902" },
    { text: "模具", value: "L0903" },
    { text: "治具", value: "L0904" },
  ],
  L10: [
    { text: "治工具", value: "L1001" },
    { text: "模具", value: "L1002" },
  ],
  L11: [
    { text: "包裝材料", value: "L1101" },
    { text: "其他", value: "L1102" },
  ],
  L12: [{ text: "消耗用品", value: "L1201" }],
  L13: [{ text: "間接材料", value: "L1301" }],
  L14: [
    { text: "其他", value: "L1401" },
    { text: "產品檢測費", value: "L1402" },
    { text: "設備檢驗費", value: "L1403" },
  ],
  L15: [
    { text: "模具設備", value: "L1501" },
    { text: "宿舍", value: "L1502" },
    { text: "生產設備", value: "L1503" },
    { text: "運輸設備", value: "L1504" },
    { text: "辦公室及廠房", value: "L1505" },
    { text: "其他建築物", value: "L1506" },
    { text: "其他", value: "L1507" },
    { text: "電腦設備", value: "L1508" },
    { text: "工具設備", value: "L1509" },
  ],
  L16: [
    { text: "瓦斯費", value: "L1601" },
    { text: "生產用水", value: "L1602" },
    { text: "生產用電", value: "L1603" },
    { text: "其他", value: "L1604" },
    { text: "食堂用水", value: "L1605" },
    { text: "食堂用電", value: "L1606" },
    { text: "燃油費", value: "L1607" },
    { text: "辦公用水", value: "L1608" },
    { text: "辦公用電", value: "L1609" },
    { text: "採暖費", value: "L1610" },
  ],
  L17: [
    { text: "其他", value: "L1701" },
    { text: "宿舍及福利設施", value: "L1702" },
    { text: "生產設備", value: "L1703" },
    { text: "辦公室及廠房", value: "L1704" },
    { text: "土地", value: "L1705" },
    { text: "倉儲費用", value: "L1706" },
    { text: "運輸設備", value: "L1707" },
    { text: "其他設備", value: "L1708" },
  ],
  L18: [
    { text: "公路運輸", value: "L1801" },
    { text: "快遞費", value: "L1802" },
    { text: "河運費", value: "L1803" },
    { text: "空運費", value: "L1804" },
    { text: "海運費", value: "L1805" },
    { text: "裝卸費", value: "L1806" },
    { text: "其他運費", value: "L1807" },
    { text: "倉儲費用", value: "L1808" },
  ],
  L19: [
    { text: "其他", value: "L1901" },
    { text: "展會費用", value: "L1902" },
    { text: "產品宣傳資料", value: "L1903" },
    { text: "樣品費", value: "L1904" },
    { text: "禮品費", value: "L1905" },
    { text: "公共關係", value: "L1906" },
    { text: "媒體廣告", value: "L1907" },
    { text: "經銷商廣告", value: "L1908" },
  ],
  L20: [{ text: "罰款支出", value: "L2001" }],
  L21: [
    { text: "軟體升級維護", value: "L2101" },
    { text: "軟體購置", value: "L2102" },
  ],
  L22: [
    { text: "硬體購置", value: "L2201" },
    { text: "電腦用品及耗材", value: "L2202" },
    { text: "其他", value: "L2203" },
  ],
  L23: [
    { text: "印花稅", value: "L2301" },
    { text: "其他", value: "L2302" },
    { text: "營業稅稅基", value: "L2303" },
  ],
  L24: [
    { text: "其他賠償損失", value: "L2401" },
    { text: "意外事故賠償", value: "L2402" },
  ],
  L25: [
    { text: "企業證照費", value: "L2501" },
    { text: "會費與政府規費-規費", value: "L2502" },
    { text: "會費", value: "L2503" },
  ],
  L26: [
    { text: "投行券商費用", value: "L2601" },
    { text: "排污費", value: "L2602" },
    { text: "清潔費", value: "L2603" },
    { text: "其他", value: "L2604" },
    { text: "綠化費", value: "L2605" },
    { text: "保安消防費", value: "L2606" },
  ],
  L27: [
    { text: "其他", value: "L2701" },
    { text: "律師費", value: "L2702" },
    { text: "訴訟費", value: "L2703" },
    { text: "會計師審計費", value: "L2704" },
    { text: "資產評估費", value: "L2705" },
    { text: "顧問費", value: "L2706" },
  ],
  L28: [
    { text: "工衣", value: "L2801" },
    { text: "其他", value: "L2802" },
    { text: "防護用品", value: "L2803" },
    { text: "防靜電用品", value: "L2804" },
  ],
  L29: [
    { text: "行政收費", value: "L2901" },
    { text: "快遞費", value: "L2902" },
    { text: "其他", value: "L2903" },
    { text: "報關費", value: "L2904" },
    { text: "進口報關雜費", value: "L2905" },
    { text: "保險費", value: "L2906" },
    { text: "關稅", value: "L2907" },
    { text: "推廣貿易服務費", value: "L2908" },
    { text: "手續費", value: "L2909" },
    { text: "營業稅稅基", value: "L2910" },
    { text: "進項稅", value: "L2911" },
  ],
  L30: [
    { text: "行政收費", value: "L3001" },
    { text: "快遞費", value: "L3002" },
    { text: "其他", value: "L3003" },
    { text: "報關費", value: "L3004" },
    { text: "出口報關雜費", value: "L3005" },
    { text: "保險費", value: "L3006" },
  ],
  L31: [
    { text: "利息支出", value: "L3101" },
    { text: "銀行手續費", value: "L3102" },
  ],
  L32: [
    { text: "房產稅", value: "L3201" },
    { text: "其他", value: "L3202" },
  ],
  L33: [
    { text: "祭祀", value: "L3301" },
    { text: "汽車檢驗&洗車費", value: "L3302" },
    { text: "禮金&慰問", value: "L3303" },
    { text: "核酸檢測", value: "L3304" },
    { text: "公共關係", value: "L3305" },
  ],
  L34: [{ text: "雜項購置", value: "L3401" }],
  L35: [
    { text: "安全培訓", value: "L3501" },
    { text: "特種設備檢測", value: "L3502" },
    { text: "安全生產會費", value: "L3503" },
  ],
  L36: [
    { text: "員工教育", value: "L3601" },
    { text: "體育活動", value: "L3602" },
    { text: "文娛活動", value: "L3603" },
    { text: "其他文體活動", value: "L3604" },
    { text: "宣傳推廣", value: "L3605" },
    { text: "勞模/先進職工療休養", value: "L3606" },
    { text: "春節關愛活動", value: "L3607" },
    { text: "端午關愛活動", value: "L3608" },
    { text: "中秋關愛活動", value: "L3609" },
    { text: "工會慰問-其他慰問", value: "L3610" },
    { text: "工會慰問-住院慰問", value: "L3611" },
    { text: "工會慰問-喪葬慰問", value: "L3612" },
    { text: "工會慰問-新婚祝福", value: "L3613" },
    { text: "工會小組(相親相愛)活動", value: "L3614" },
    { text: "其他會員活動", value: "L3615" },
    { text: "其他活動支出", value: "L3616" },
    { text: "技能比武", value: "L3617" },
    { text: "建家活動", value: "L3618" },
    { text: "創新活動支出", value: "L3619" },
    { text: "圖書購置以及書屋維護", value: "L3620" },
    { text: "其他服務支出", value: "L3621" },
    { text: "勞動關係協調", value: "L3622" },
    { text: "勞動保護監督", value: "L3623" },
    { text: "法律援助", value: "L3624" },
    { text: "員工困難救助-困難員工救助", value: "L3625" },
    { text: "員工困難救助-直系親屬救助", value: "L3626" },
    { text: "員工困難救助-家庭災害救助", value: "L3627" },
    { text: "送溫暖", value: "L3628" },
    { text: "專項防控資金", value: "L3629" },
    { text: "醫療補助", value: "L3630" },
    { text: "其他維權支出", value: "L3631" },
    { text: "工會培訓", value: "L3632" },
    { text: "工會會議", value: "L3633" },
    { text: "工會組建", value: "L3634" },
    { text: "專項業務管理", value: "L3635" },
    { text: "評優評先", value: "L3636" },
    { text: "辦公用品", value: "L3637" },
    { text: "招待費", value: "L3638" },
    { text: "差旅費", value: "L3639" },
    { text: "部門專用車輛", value: "L3640" },
    { text: "維修(護)費", value: "L3641" },
    { text: "其他業務支出", value: "L3642" },
    { text: "其他支出", value: "L3643" },
  ],
};

// ========== 一般費用明細列 ==========

function addGeneralRow(data = null) {
  const container = document.getElementById("general-rows-container");
  const template = document.getElementById("general-row-template");

  const clone = template.content.cloneNode(true);
  const rowDiv = clone.querySelector(".general-row-item");

  // 刪除按鈕
  clone.querySelector(".btn-remove-row").addEventListener("click", () => {
    rowDiv.remove();
    updateGeneralRowLabels();
  });

  // L1 → L2 連動
  const l1Select = clone.querySelector(".input-fee-type-1");
  const l2Select = clone.querySelector(".input-fee-type-2");

  l1Select.addEventListener("change", (e) => {
    updateL2Options(l2Select, e.target.value);
  });

  // 填入資料
  if (data) {
    rowDiv.querySelector(".input-start-date").value = data.startDate || "";
    rowDiv.querySelector(".input-end-date").value = data.endDate || "";
    l1Select.value = data.feeType1 || "";
    updateL2Options(l2Select, data.feeType1);
    l2Select.value = data.feeType2 || "";
    rowDiv.querySelector(".input-currency").value = data.currency || "NTD";
    rowDiv.querySelector(".input-amount").value = data.amount || "";
    rowDiv.querySelector(".input-remark").value = data.remark || "";
  }

  // 為新列初始化 Flatpickr
  const dateInputs = rowDiv.querySelectorAll(".js-flatpickr-date");
  flatpickr(dateInputs, {
    dateFormat: "Y/m/d",
    theme: "dark",
    disableMobile: true,
    allowInput: true,
  });

  container.appendChild(clone);
  updateGeneralRowLabels();
}

function updateL2Options(select, l1Value) {
  select.innerHTML = '<option value="">-- 子類型 --</option>';
  const options = FEE_TYPE_MAPPING[l1Value];
  if (options) {
    select.disabled = false;
    options.forEach((opt) => {
      const el = document.createElement("option");
      el.value = opt.value;
      el.innerText = opt.text;
      select.appendChild(el);
    });
  } else {
    select.disabled = true;
  }
}

function updateGeneralRowLabels() {
  const rows = document.querySelectorAll("#general-rows-container .general-row-item");
  rows.forEach((row, index) => {
    row.querySelector(".row-label").innerText = `項目 ${index + 1}`;
  });
}

function getGeneralRows() {
  const rows = document.querySelectorAll("#general-rows-container .general-row-item");
  const data = [];
  rows.forEach((row) => {
    data.push({
      startDate: row.querySelector(".input-start-date").value,
      endDate: row.querySelector(".input-end-date").value,
      feeType1: row.querySelector(".input-fee-type-1").value,
      feeType2: row.querySelector(".input-fee-type-2").value,
      currency: row.querySelector(".input-currency").value,
      amount: row.querySelector(".input-amount").value,
      remark: row.querySelector(".input-remark").value,
    });
  });
  return data;
}

// ========== 預算列（Tab 1 用） ==========

function addBudgetRow(type, data = null) {
  const container = document.getElementById(`${type}-container`);
  const template = document.getElementById("budget-row-template");

  const clone = template.content.cloneNode(true);
  const rowDiv = clone.querySelector(".budget-row-item");

  clone.querySelector(".btn-remove-row").addEventListener("click", () => {
    rowDiv.remove();
    updateRowLabels(type);
  });

  if (data) {
    rowDiv.querySelector(".input-desc").value = data.desc || "";
    rowDiv.querySelector(".input-amount").value = data.amount || "";
    rowDiv.querySelector(".input-currency").value = data.currency || "NTD";
  }

  container.appendChild(clone);
  updateRowLabels(type);
}

function updateRowLabels(type) {
  const container = document.getElementById(`${type}-container`);
  const rows = container.querySelectorAll(".budget-row-item");
  rows.forEach((row, index) => {
    row.querySelector(".row-label").innerText = `項目 ${index + 1}`;
  });
}

function getBudgetRows(type) {
  const container = document.getElementById(`${type}-container`);
  const rows = container.querySelectorAll(".budget-row-item");
  const data = [];
  rows.forEach((row) => {
    const desc = row.querySelector(".input-desc").value;
    const amount = row.querySelector(".input-amount").value;
    const currency = row.querySelector(".input-currency").value;
    if (desc || amount) {
      data.push({ desc, amount, currency });
    }
  });
  return data;
}

function clearBudgetRows() {
  document.getElementById("traffic-container").innerHTML = "";
  document.getElementById("other-container").innerHTML = "";
  document.getElementById("meal-container").innerHTML = "";
}

// ========== 日期/時間格式化 ==========

function formatPayloadDate(dateStr) {
  if (!dateStr) return "";
  return dateStr.replace(/-/g, "/");
}

function formatInputDate(date) {
  return date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0") + "-" + String(date.getDate()).padStart(2, "0");
}

function formatInputTime(date) {
  return String(date.getHours()).padStart(2, "0") + ":" + String(date.getMinutes()).padStart(2, "0") + ":" + String(date.getSeconds()).padStart(2, "0");
}

// ========== 範本相關常數 ==========
// 每個頁籤使用獨立的 storage key
const TEMPLATE_CONFIG = {
  // Tab 1: 員工因公外出申請單
  templateSelect: {
    storageKey: "ters_templates",
    inputId: "newTemplateName",
    selectId: "templateSelect",
  },
  // Tab 3: 一般費用申請單
  templateSelectGeneral: {
    storageKey: "ters_templates_general",
    inputId: "newTemplateNameGeneral",
    selectId: "templateSelectGeneral",
  },
};

// 根據元素 ID 取得所屬的範本設定
function getTemplateConfig(elementId) {
  if (elementId.includes("General") || elementId.includes("general")) {
    return TEMPLATE_CONFIG.templateSelectGeneral;
  }
  return TEMPLATE_CONFIG.templateSelect;
}

// ========== 範本函式 ==========

// 載入所有範本（兩個頁籤各自讀取自己的 key）
function loadTemplates() {
  Object.values(TEMPLATE_CONFIG).forEach((cfg) => {
    chrome.storage.sync.get([cfg.storageKey], (result) => {
      const templates = result[cfg.storageKey] || {};
      const select = document.getElementById(cfg.selectId);
      if (!select) return;

      // 保留第一個 "-- 請選擇 --"
      while (select.options.length > 1) {
        select.remove(1);
      }

      Object.keys(templates)
        .sort()
        .forEach((name) => {
          const option = document.createElement("option");
          option.value = name;
          option.innerText = name;
          select.appendChild(option);
        });
    });
  });
}

// 儲存範本（根據 inputId 判斷屬於哪個頁籤）
function saveNewTemplate(inputId) {
  const cfg = getTemplateConfig(inputId);
  const name = document.getElementById(inputId).value.trim();
  if (!name) {
    showStatus("⚠️ 請輸入範本名稱", "#d76f00");
    return;
  }

  // 根據頁籤收集對應的資料
  const isGeneral = cfg.storageKey === "ters_templates_general";
  const data = isGeneral ? getGeneralFormData() : getTab1FormData();

  chrome.storage.sync.get([cfg.storageKey], (result) => {
    const templates = result[cfg.storageKey] || {};
    templates[name] = data;
    chrome.storage.sync.set({ [cfg.storageKey]: templates }, () => {
      showStatus(`✅ 範本 "${name}" 已儲存`, "#007a33");
      document.getElementById(inputId).value = "";
      loadTemplates();
      setTimeout(() => {
        const s = document.getElementById(cfg.selectId);
        if (s) s.value = name;
      }, 100);
    });
  });
}

// 刪除範本
function deleteTemplate(selectId) {
  const cfg = getTemplateConfig(selectId);
  const name = document.getElementById(selectId).value;
  if (!name) return;
  if (confirm(`確定要刪除範本 "${name}" 嗎？`)) {
    chrome.storage.sync.get([cfg.storageKey], (result) => {
      const templates = result[cfg.storageKey] || {};
      delete templates[name];
      chrome.storage.sync.set({ [cfg.storageKey]: templates }, () => {
        showStatus(`🗑️ 範本 "${name}" 已刪除`, "#ff0055");
        loadTemplates();
      });
    });
  }
}

// 載入選中的範本
function loadSelectedTemplate(selectId) {
  const cfg = getTemplateConfig(selectId);
  const name = document.getElementById(selectId).value;
  if (!name) return;

  const isGeneral = cfg.storageKey === "ters_templates_general";

  chrome.storage.sync.get([cfg.storageKey], (result) => {
    const templates = result[cfg.storageKey] || {};
    const data = templates[name];
    if (!data) return;

    if (isGeneral) {
      loadGeneralTemplate(data);
    } else {
      loadTab1Template(data);
    }
  });
}

// ===== Tab 1 專用 =====

function getTab1FormData() {
  const rawDate = document.getElementById("date").value;
  const rawReturnDate = document.getElementById("returnDate").value;
  return {
    date: formatPayloadDate(rawDate),
    time: document.getElementById("time").value,
    returnDate: formatPayloadDate(rawReturnDate),
    returnTime: document.getElementById("returnTime").value,
    location: document.getElementById("location").value,
    reason: document.getElementById("reason").value,
    trafficType: document.getElementById("trafficType").value,
    noReturn: document.getElementById("noReturn").checked,
    projectCode: document.getElementById("projectCode").value,
    keyResult: document.getElementById("keyResult").value,
    contactPerson: document.getElementById("contactPerson").value,
    contactPhone: document.getElementById("contactPhone").value,
    trafficRows: getBudgetRows("traffic"),
    otherRows: getBudgetRows("other"),
    mealRows: getBudgetRows("meal"),
  };
}

function loadTab1Template(data) {
  setFieldValue("location", data.location);
  setFieldValue("reason", data.reason);
  setFieldValue("trafficType", data.trafficType);
  if (data.noReturn !== undefined) document.getElementById("noReturn").checked = data.noReturn;

  setFieldValue("projectCode", data.projectCode);
  setFieldValue("keyResult", data.keyResult);
  setFieldValue("contactPerson", data.contactPerson);
  setFieldValue("contactPhone", data.contactPhone);

  // 清空並載入預算列
  clearBudgetRows();

  if (Array.isArray(data.trafficRows)) {
    data.trafficRows.forEach((r) => addBudgetRow("traffic", r));
  } else if (data.trafficDesc) {
    addBudgetRow("traffic", { desc: data.trafficDesc, amount: data.trafficAmount, currency: data.trafficCurrency });
  } else {
    addBudgetRow("traffic");
  }

  if (Array.isArray(data.otherRows)) {
    data.otherRows.forEach((r) => addBudgetRow("other", r));
  } else if (data.otherDesc) {
    addBudgetRow("other", { desc: data.otherDesc, amount: data.otherAmount, currency: data.otherCurrency });
  } else {
    addBudgetRow("other");
  }

  if (Array.isArray(data.mealRows)) {
    data.mealRows.forEach((r) => addBudgetRow("meal", r));
  } else if (data.mealDesc) {
    addBudgetRow("meal", { desc: data.mealDesc, amount: data.mealAmount, currency: data.mealCurrency });
  } else {
    addBudgetRow("meal");
  }
}

// ===== Tab 3（一般費用）專用 =====

function getGeneralFormData() {
  return {
    projectCode: document.getElementById("txtProjCode").value,
    remark: document.getElementById("txtRemark").value,
    attachmentType: document.getElementById("attachmentType").value,
    rows: getGeneralRows(),
  };
}

function loadGeneralTemplate(data) {
  setFieldValue("txtProjCode", data.projectCode);
  setFieldValue("txtRemark", data.remark);
  setFieldValue("attachmentType", data.attachmentType);

  document.getElementById("general-rows-container").innerHTML = "";
  if (Array.isArray(data.rows) && data.rows.length > 0) {
    data.rows.forEach((r) => addGeneralRow(r));
  } else {
    addGeneralRow();
  }
}

function setFieldValue(id, value) {
  const el = document.getElementById(id);
  if (el && value !== undefined) el.value = value;
}

function clearForm() {
  const ids = ["location", "reason", "trafficType", "projectCode", "keyResult", "contactPerson", "contactPhone"];
  ids.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
  document.getElementById("noReturn").checked = false;
  document.getElementById("newTemplateName").value = "";
  document.getElementById("templateSelect").value = "";

  // Clear dynamic rows and reset to default 1 empty row
  clearBudgetRows();
  addBudgetRow("traffic");
  addBudgetRow("other");
  addBudgetRow("meal");

  // Clear dates too as requested
  document.getElementById("date").value = "";
  document.getElementById("time").value = "";
  document.getElementById("returnDate").value = "";
  document.getElementById("returnTime").value = "";

  // Clear General Tab
  document.getElementById("txtProjCode").value = "";
  document.getElementById("txtRemark").value = "";
  document.getElementById("attachmentType").value = "GENERICFEE";
  document.getElementById("general-rows-container").innerHTML = "";
  addGeneralRow();
}

// 偵測目前啟用的頁籤
function getActiveTabId() {
  const activeBtn = document.querySelector(".tab-btn[data-active='true']");
  return activeBtn ? activeBtn.getAttribute("data-tab") : "tab-apply";
}

function fillCurrentTab() {
  const activeTab = getActiveTabId();

  let action, data;

  if (activeTab === "tab-general") {
    // Tab 3: 一般費用申請
    action = "fill_general";
    data = { general: getGeneralFormData() };
  } else {
    // Tab 1: 因公外出申請
    action = "fill_form";
    data = getTab1FormData();
  }

  // 發送到 Content Script
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length === 0) return;
    const tabId = tabs[0].id;

    chrome.tabs.sendMessage(tabId, { action, data }, (response) => {
      if (chrome.runtime.lastError) {
        showStatus("❌ 無法連線，請重新整理網頁", "#ff0055");
      } else {
        showStatus("🚀 內容已填入！", "#00ff88");
      }
    });
  });
}

function showStatus(msg, borderColor) {
  const el = document.getElementById("status");
  el.innerText = msg;

  // Cyberpunk 風格：深色背景 + 霓虹邊框
  el.style.borderColor = borderColor || "#00ff88";
  el.style.color = borderColor || "#00ff88";
  el.style.boxShadow = `0 0 5px ${borderColor || "#00ff88"}, 0 0 10px ${borderColor || "#00ff88"}40`;

  // 顯示
  el.style.opacity = "1";

  setTimeout(() => {
    // 隱藏
    el.style.opacity = "0";
  }, 3000);
}

// ========== 問題回報 ==========

function submitReport() {
  const fromName = document.getElementById("reportFrom").value.trim();
  const subject = document.getElementById("reportSubject").value.trim();
  const body = document.getElementById("reportBody").value.trim();

  // 欄位驗證（回報者為非必填）
  if (!subject) {
    showStatus("⚠️ 請填寫主旨", "#d76f00");
    return;
  }
  if (!body) {
    showStatus("⚠️ 請填寫問題描述", "#d76f00");
    return;
  }

  // 停用送出按鈕避免重複送出
  const submitBtn = document.getElementById("reportSubmit");
  submitBtn.disabled = true;
  submitBtn.innerText = "⏳ 寄送中...";

  // 使用 EmailJS REST API 直接寄信
  const payload = {
    service_id: "service_oe75k3k",
    template_id: "template_dpqfnyd",
    user_id: "poHXsmqZ7MLMBHyOi",
    template_params: {
      name: fromName || "匿名用戶",
      title: subject,
      message: body,
    },
  };

  fetch("https://api.emailjs.com/api/v1.0/email/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
    .then((res) => {
      if (res.ok) {
        // 清空表單並關閉 overlay
        document.getElementById("reportFrom").value = "";
        document.getElementById("reportSubject").value = "";
        document.getElementById("reportBody").value = "";
        document.getElementById("reportOverlay").classList.remove("active");
        showStatus("✅ 回報已成功送出，感謝您的回饋！", "#00ff88");
      } else {
        showStatus("❌ 寄送失敗，請稍後再試", "#ff0055");
      }
    })
    .catch(() => {
      showStatus("❌ 網路錯誤，請確認網路連線", "#ff0055");
    })
    .finally(() => {
      submitBtn.disabled = false;
      submitBtn.innerText = "📨 送出回報";
    });
}
