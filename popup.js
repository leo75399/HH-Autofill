document.addEventListener("DOMContentLoaded", () => {
  loadTemplates();
  // setInitialDateTime(); // Removed default date/time setting

  // --- Tab Navigation Logic ---
  const tabs = document.querySelectorAll(".tab-btn");
  const contents = document.querySelectorAll(".tab-content");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      // 1. Deactivate all tabs
      tabs.forEach((t) => t.removeAttribute("data-active"));
      // 2. Hide all contents
      contents.forEach((c) => c.classList.add("hidden"));
      contents.forEach((c) => c.classList.remove("block"));

      // 3. Activate clicked tab
      tab.setAttribute("data-active", "true");

      // 4. Show target content
      const targetId = tab.getAttribute("data-tab");
      const targetContent = document.getElementById(targetId);
      if (targetContent) {
        targetContent.classList.remove("hidden");
        targetContent.classList.add("block");
      }
    });
  });

  // Main Buttons
  const fillBtn = document.getElementById("fillBtn");
  if (fillBtn) fillBtn.addEventListener("click", fillCurrentTab);

  document.getElementById("btn-save-template").addEventListener("click", saveNewTemplate);
  document.getElementById("btn-delete-template").addEventListener("click", deleteTemplate);
  document.getElementById("templateSelect").addEventListener("change", loadSelectedTemplate);

  // Add Row Buttons
  document.getElementById("btn-add-traffic").addEventListener("click", () => addBudgetRow("traffic"));
  document.getElementById("btn-add-other").addEventListener("click", () => addBudgetRow("other"));
  document.getElementById("btn-add-meal").addEventListener("click", () => addBudgetRow("meal"));

  // Initialize with 1 empty row for each
  addBudgetRow("traffic");
  addBudgetRow("other");
  addBudgetRow("meal");
});

function addBudgetRow(type, data = null) {
  const container = document.getElementById(`${type}-container`);
  const template = document.getElementById("budget-row-template");

  // Clone template
  const clone = template.content.cloneNode(true);
  const rowDiv = clone.querySelector(".budget-row-item");

  // Set Remove Handler
  clone.querySelector(".btn-remove-row").addEventListener("click", (e) => {
    rowDiv.remove();
    updateRowLabels(type);
  });

  // Populate data if provided
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

    // Only add if at least description or amount is present
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

function formatInputDate(date) {
  return date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0") + "-" + String(date.getDate()).padStart(2, "0");
}
function formatPayloadDate(dateStr) {
  if (!dateStr) return "";
  return dateStr.replace(/-/g, "/");
}
function formatInputTime(date) {
  return String(date.getHours()).padStart(2, "0") + ":" + String(date.getMinutes()).padStart(2, "0") + ":" + String(date.getSeconds()).padStart(2, "0");
}

// ... Template Functions ...
function loadTemplates() {
  chrome.storage.sync.get(["ters_templates"], (result) => {
    const templates = result.ters_templates || {};
    const select = document.getElementById("templateSelect");
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
}

function saveNewTemplate() {
  const name = document.getElementById("newTemplateName").value.trim();
  if (!name) {
    showStatus("⚠️ 請輸入範本名稱", "#d76f00");
    return;
  }

  const data = getFormData();

  chrome.storage.sync.get(["ters_templates"], (result) => {
    const templates = result.ters_templates || {};
    templates[name] = data;
    chrome.storage.sync.set({ ters_templates: templates }, () => {
      showStatus(`✅ 範本 "${name}" 已儲存`, "#007a33");
      document.getElementById("newTemplateName").value = "";
      loadTemplates();
      setTimeout(() => {
        document.getElementById("templateSelect").value = name;
      }, 100);
    });
  });
}

function deleteTemplate() {
  const name = document.getElementById("templateSelect").value;
  if (!name) return;
  if (confirm(`確定要刪除範本 "${name}" 嗎？`)) {
    chrome.storage.sync.get(["ters_templates"], (result) => {
      const templates = result.ters_templates || {};
      delete templates[name];
      chrome.storage.sync.set({ ters_templates: templates }, () => {
        showStatus(`🗑️ 範本 "${name}" 已刪除`, "#cc0000");
        loadTemplates();
        clearForm();
      });
    });
  }
}

function loadSelectedTemplate() {
  const name = document.getElementById("templateSelect").value;
  if (!name) return;

  chrome.storage.sync.get(["ters_templates"], (result) => {
    const templates = result.ters_templates || {};
    const data = templates[name];
    if (data) {
      setFieldValue("location", data.location);
      setFieldValue("reason", data.reason);
      setFieldValue("trafficType", data.trafficType);
      if (data.noReturn !== undefined) document.getElementById("noReturn").checked = data.noReturn;

      setFieldValue("projectCode", data.projectCode);
      setFieldValue("keyResult", data.keyResult);
      setFieldValue("contactPerson", data.contactPerson);
      setFieldValue("contactPhone", data.contactPhone);

      // Clear and Load Budget Rows
      clearBudgetRows();

      // Handle Legacy Data (Single Objects) vs New Data (Arrays)
      if (Array.isArray(data.trafficRows)) {
        data.trafficRows.forEach((r) => addBudgetRow("traffic", r));
      } else if (data.trafficDesc) {
        // Legacy fallback
        addBudgetRow("traffic", { desc: data.trafficDesc, amount: data.trafficAmount, currency: data.trafficCurrency });
      } else {
        addBudgetRow("traffic"); // Add empty default
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
  });
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
}

function getFormData() {
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

    // New Array Structure
    trafficRows: getBudgetRows("traffic"),
    otherRows: getBudgetRows("other"),
    mealRows: getBudgetRows("meal"),
  };
}

function fillCurrentTab() {
  const data = getFormData();

  // Send to Content Script
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length === 0) return;
    const tabId = tabs[0].id;

    chrome.tabs.sendMessage(tabId, { action: "fill_form", data: data }, (response) => {
      if (chrome.runtime.lastError) {
        showStatus("❌ 無法連線，請重新整理網頁", "#cc0000");
      } else {
        showStatus("🚀 填寫指令已發送！", "#0056b3");
      }
    });
  });
}

function showStatus(msg, color) {
  const el = document.getElementById("status");
  el.innerText = msg;

  // Use the passed color as background, white text
  el.style.backgroundColor = color;
  el.style.color = "white";

  // Show it
  el.classList.remove("opacity-0");

  setTimeout(() => {
    // Hide it
    el.classList.add("opacity-0");
  }, 3000);
}
