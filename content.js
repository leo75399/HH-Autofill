// TERS Auto-Fill Content Script - Simplified Version

const log = (msg) => console.log(`[TERS Auto-Fill] ${msg}`);

// Listen for messages from Popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "fill_form") {
    log("Received fill_form request (Simplified Mode)");

    try {
      fillAll(request.data);
      sendResponse({ status: "success" });
    } catch (e) {
      console.error(e);
      sendResponse({ status: "error", message: e.message });
    }
  }
});

function fillAll(data) {
  // 1. Fill Basic Fields
  fillBasicFields(data);

  // 2. Fill Budget Fields
  const report = fillBudgetFields(data);

  // 3. Feedback - Removed alerts as per user request
  // User will verify missing fields visually on the page
  log(`Fill complete. Missing rows: ${report.missingRows}`);
}

// ------------ DOM HELPERS ----------------

function fillBasicFields(data) {
  log("Filling Basic Fields...");
  const map = {
    TFTS_Evection_BeOut_txtOutDate: data.date,
    TFTS_Evection_BeOut_txtOutTime: data.time,
    TFTS_Evection_BeOut_txtBackDate: data.returnDate,
    TFTS_Evection_BeOut_txtBackTime: data.returnTime,
    TFTS_Evection_BeOut_txtReason: data.reason,
    TFTS_Evection_BeOut_txtArrivalPlace: data.location,
    TFTS_Evection_BeOut_trafficType: data.trafficType,
    TFTS_Evection_BeOut_ckbBackFlag: data.noReturn,
    TFTS_EvectionHead_txtProjectNo: data.projectCode,
    TFTS_Evection_BeOut_txtKeyResult: data.keyResult,
    TFTS_Evection_BeOut_txtContact: data.contactPerson,
    TFTS_Evection_BeOut_txtContactPhone: data.contactPhone,
  };
  applyFieldValues(map);
}

function fillBudgetFields(data) {
  log("Filling Budget Fields...");
  let missingRows = 0;

  // Fill Traffic
  missingRows += fillCategory(0, data.trafficRows || []);

  // Fill Other
  missingRows += fillCategory(1, data.otherRows || []);

  // Fill Meal
  missingRows += fillCategory(2, data.mealRows || []);

  return { missingRows };
}

function fillCategory(catIndex, rowsData) {
  let missingCount = 0;

  rowsData.forEach((rowData, index) => {
    // Try to fill row 'index' for category 'catIndex'
    // If the element doesn't exist, we count it as missing
    const success = fillRow(catIndex, index, rowData);
    if (!success) {
      missingCount++;
    }
  });

  return missingCount;
}

function fillRow(catIndex, rowIndex, rowData) {
  if (!rowData) return true; // Skip empty data, consider success

  const catStr = "ctl" + String(catIndex).padStart(2, "0");
  const rowStr = "ctl" + String(rowIndex).padStart(2, "0");
  const prefix = `detailCostService_detailCostRepeater1_Repeater1_${catStr}_detailCostRepeaterType1_Repeater1_${rowStr}_`;

  // Check if the description field exists strictly
  const testId = prefix + "TextBox_feeDesc";
  if (!findEl(testId)) {
    log(`Row not found: Cat ${catIndex}, Row ${rowIndex}`);
    return false;
  }

  const map = {};
  map[prefix + "TextBox_feeDesc"] = rowData.desc;
  map[prefix + "TextBox_estimateAmount"] = rowData.amount;
  map[prefix + "DropDownList_currencyTypeCode"] = rowData.currency;

  applyFieldValues(map);
  return true;
}

function applyFieldValues(map) {
  for (const [id, value] of Object.entries(map)) {
    if (value === undefined || value === null) continue;

    const element = findEl(id);
    if (element) {
      if (element.type === "checkbox") {
        element.checked = value;
      } else {
        element.value = value;
      }

      element.dispatchEvent(new Event("change", { bubbles: true }));
      element.dispatchEvent(new Event("blur", { bubbles: true }));

      // Visual feedback
      element.style.backgroundColor = "#e6ffe6";
    }
  }
}

function findEl(id) {
  let el = document.getElementById(id);
  if (el) return el;

  const iframes = document.querySelectorAll("iframe");
  for (let frame of iframes) {
    try {
      const doc = frame.contentDocument || frame.contentWindow.document;
      el = doc.getElementById(id);
      if (el) return el;
    } catch (e) {}
  }
  return null;
}
