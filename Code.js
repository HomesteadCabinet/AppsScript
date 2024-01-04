// import 'google-apps-script';
const _ = LodashGS.load();

function myFunction() {
  console.log("a");
  console.log("b");
  console.log("c");
  console.log("v");
  console.log("e");
  console.log("f");
  console.log("t");
}


function getFromBidDataSheet() {
  var bids = {};

  var externalSpreadsheetId = "1O85YYHYJivPOeAFWnIumpxYeH35qqhyvkN7_o0xbYfw";
  var externalSheetName = "Jobs";

  var externalSpreadsheet = SpreadsheetApp.openById(externalSpreadsheetId);
  var externalSheet = externalSpreadsheet.getSheetByName(externalSheetName);

  var currentSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var currentSheet = currentSpreadsheet.getActiveSheet();

  // Now you can work with the external sheet and retrieve data
  var data = externalSheet.getDataRange().getValues();

  let headers = data.shift();
  headers.push("WorkOrder");

  wo_data = getFromMicrovellumDataSheet();

  for (let row of data) {
    let d = _.zipObject(headers, row);
    if (d["id"] in wo_data) {
      d["WorkOrder"] = wo_data[d["id"]]["Name"] || null;
    }
    bids[d["id"]] = d;
  }

  // Write bids to the sheet
  currentSheet.clearContents(); // Clear existing contents

  var outputData = Object.values(bids);
  var outputRange = currentSheet.getRange(1, 1, outputData.length+1, headers.length);

  let ddata = [];
  ddata.push(headers);

  for (let row of outputData) {
    let d = _.values(row);
    ddata.push(d);
  }
  outputRange.setValues(ddata);
}


function getFromMicrovellumDataSheet() {
  let work_orders = {}
  var externalSpreadsheetId = "166LXg0Bmm2ea7t91FoE0mAEp_AFDBuPcbsM3oTfm9hQ";
  var externalSheetName = "WorkOrders";

  var externalSpreadsheet = SpreadsheetApp.openById(externalSpreadsheetId);
  var externalSheet = externalSpreadsheet.getSheetByName(externalSheetName);

  // Now you can work with the external sheet and retrieve data
  var data = externalSheet.getDataRange().getValues();

  let headers = data.shift();

  for (let row of data) {
    let d = _.zipObject(headers, row);
    work_orders[d["BidID"]] = d;
  }

  return work_orders;
}
