// import 'google-apps-script';

// Fetch and pull data
// clasp push
// clasp pull


const mv_data_sheet = "166LXg0Bmm2ea7t91FoE0mAEp_AFDBuPcbsM3oTfm9hQ";
const bid_data_sheet = "1O85YYHYJivPOeAFWnIumpxYeH35qqhyvkN7_o0xbYfw";
const currentSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
var currentSheet = currentSpreadsheet.getActiveSheet();
var settings = {};

const departmentDataTemplate = {
  status: '',
  date_changed: '',
  workload: 0,
}

function writeDataToTab(tab_name, data, header_row=false) {
  let sheet = currentSpreadsheet.getSheetByName(tab_name);

  // Check if sheet exists, create it if it doesn't
  if (!sheet) {
    sheet = currentSpreadsheet.insertSheet(tab_name);
  }

  let headers = Object.keys(Object.values(data)[0]);
  let ddata = [];
  sheet.clearContents();

  if (!header_row) {
    ddata.push(headers);
  }
  for (let row of data) {
    let d = _.values(row);
    ddata.push(d);
  }

  let outputRange = sheet.getRange(1, 1, ddata.length, headers.length);
  outputRange.setValues(ddata);
}


function getItem(item_id, items, id_key='id') {
  return items.find(item => item[id_key] == item_id);
}


function arrayToObject(data, id_key="id") {
  let rtn = {};
  let headers = data.shift();
  for (let row of data) {
    let d = _.zipObject(headers, row);
    rtn[d[id_key]] = d;
  }
  return rtn;
}

function updateRecords(existing_items, new_items, id_key="id") {
  let rtn = [];
  for (let item of existing_items) {
    let new_item = getItem(item[id_key], new_items, id_key);
    if (new_item) {
      rtn.push(new_item);
    }
  }
  return rtn;
}


function getDataFromExternalSheet(sheet_id, tab_name, additional_headers=[], sort_key=null) {
  let rtn = [];
  let ss = SpreadsheetApp.openById(sheet_id);
  let sheet = ss.getSheetByName(tab_name);
  let data = sheet.getDataRange().getValues();

  // Extract the header row, this assumes there will always be a header row. If not, this will need to be modified
  let headers = data.shift();
  if (isSomething(additional_headers)) {
    headers = headers.concat(additional_headers);
  }
  rtn = initData(data, headers, {
    months: settings.previous_months,
    date_key: sort_key
  });
  if (sort_key) {
    rtn = sortBy(rtn, sort_key);
  }

  return rtn;
}


function getSettings() {
  let sheet = currentSpreadsheet.getSheetByName("Settings");
  let data = sheet.getRange("B5:C25").getValues();
  console.log(data)

  for (let row of data) {
    if (isSomething(row[0])) {
      let key = row[0];
      let val = row[1];
      settings[key] = val;
    }
  }
}



function getBidData() {
  var bids = {};
  const additional_bid_headers = [
    "WorkOrder", "purchasing", "cutout", "edgebanding", "drawer boxes", "specialty", "miter cell",
    "box sorting", "maverick", "shipping (staging)", "shipping (loading)", "parts prep",
    "paint bay", "assembly",
  ];
  getSettings();

  // Get existing data from the sheet
  let sheet = currentSpreadsheet.getSheetByName("Jobs");
  let existing_bids = sheet.getDataRange().getValues();

  var bid_data = getDataFromExternalSheet(bid_data_sheet, "Jobs", additional_bid_headers, "-mtime");
  if (isSomething(existing_bids)) {
    bid_data = updateRecords(existing_bids, bid_data);
  }


  var wo_data = getDataFromExternalSheet(mv_data_sheet, "WorkOrders");
  var room_data = getDataFromExternalSheet(bid_data_sheet, "Room Data");

  console.log("bid_data:", formatByteSize(roughSizeOfObject(bid_data)))
  console.log("wo_data:", formatByteSize(roughSizeOfObject(wo_data)))
  console.log("room_data:", formatByteSize(roughSizeOfObject(room_data)))

  bid_data.forEach(b => {
    bid_work_orders = wo_data.filter(wo => wo["BidID"] == b["id"]);
    if (bid_work_orders.length >= 1) {
      b["WorkOrder"] = bid_work_orders[0]["Name"];
    }
  });

  room_data.forEach(r => {
    bid_work_orders = wo_data.filter(wo => wo["BidID"] == r["bid_id"]);
    if (bid_work_orders.length >= 1) {
      r["WorkOrder"] = bid_work_orders[0]["Name"];
    }
  });

  // Write bids to the sheet
  writeDataToTab("Jobs", bid_data);



  submitted_bids = bid_data.filter(b => {
    const submittedDate = new Date(b["submitted_date"]);
    return submittedDate > oneYearAgo;
  });

  submitted_bids.sort((a, b) => new Date(b.submitted_date) - new Date(a.submitted_date));
  writeDataToTab("SubmittedJobs", submitted_bids);
}
