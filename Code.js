// import 'google-apps-script';
const _ = LodashGS.load();
const mv_data_sheet = "166LXg0Bmm2ea7t91FoE0mAEp_AFDBuPcbsM3oTfm9hQ";
const bid_data_sheet = "1O85YYHYJivPOeAFWnIumpxYeH35qqhyvkN7_o0xbYfw";
const currentSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
var currentSheet = currentSpreadsheet.getActiveSheet();


function writeDataToTab(tab_name, data, header_row=true) {
  let ss = SpreadsheetApp.openById(sheet_id);
  let sheet = ss.getSheetByName(tab_name);
  sheet.clearContents();

  if (!header_row) {
    let headers = Object.keys(data[0]);
    let ddata = [];
    ddata.push(headers);

    for (let row of data) {
      let d = _.values(row);
      ddata.push(d);
    }
    data = ddata;
  }

  let outputRange = sheet.getRange(1, 1, data.length, headers.length);
  outputRange.setValues(data);
}


function getDataFromSheet(sheet_id, tab_name, id_key="BidID") {
  let rtn = {}
  let ss = SpreadsheetApp.openById(sheet_id);
  let sheet = ss.getSheetByName(tab_name);
  let data = sheet.getDataRange().getValues();

  // Extract the header row, this assumes there will always be a header row. If not, this will need to be modified
  let headers = data.shift();

  for (let row of data) {
    let d = _.zipObject(headers, row);
    try {
      rtn[d[id_key]] = d;
    } catch {
      console.error("Error in row: ", d);
      console.info("Check that the id_key is correct");
    }
  }
  return rtn;
}




function getBidData() {
  var bids = {};

  wo_data = getDataFromSheet(mv_data_sheet, "WorkOrders", "LinkID");
  room_data = getDataFromSheet(bid_data_sheet, "Room Data", "id");
  bid_data = getDataFromSheet(bid_data_sheet, "Jobs", "id");

  console.log("bid_data:", formatByteSize(roughSizeOfObject(bid_data)))
  console.log("wo_data:", formatByteSize(roughSizeOfObject(wo_data)))
  console.log("room_data:", formatByteSize(roughSizeOfObject(room_data)), room_data)

  for (let row of bid_data) {
    let d = _.zipObject(headers, row);
    if (d["id"] in wo_data) {
      d["WorkOrder"] = wo_data[d["id"]]["Name"] || null;
      d['status'] = wo_data[d["id"]]["Status"] || null;
    }
    bids[d["id"]] = d;
  }

  // Write bids to the sheet
  writeDataToTab("Jobs", bids);
}
