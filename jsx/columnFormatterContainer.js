/**
 * Modify behaviour of specified column cells in the Data Table component
 * @param {string} column - column name
 * @param {string} cell - cell content
 * @param {arrray} rowData - array of cell contents for a specific row
 * @param {arrray} rowHeaders - array of table headers (column names)
 * @return {*} a formated table cell for a given column
 */
function formatColumn(column, cell, rowData, rowHeaders) {
  // If a column if set as hidden, don't display it
  //if (loris.hiddenHeaders.indexOf(column) > -1) {
  //  return null;
  //}

  // Create the mapping between rowHeaders and rowData in a row object.
  var row = {};
  rowHeaders.forEach(function(header, index) {
    row[header] = rowData[index];
  }, this);

  // create array of classes to be added to td tag
  var classes = [];

  // convert array to string, with blank space separator
  classes = classes.join(" ");

  //const hasWritePermission = loris.userHasPermission('media_read');
  if (column === 'Barcode') {
    var containerURL = loris.BaseURL + "/biobank/container/?barcode=" + row['Barcode'];
    return <td className= {classes}><a href={containerURL}>{cell}</a></td>;
  }

  if (column === 'Parent Barcode') {
    var specimenURL = loris.BaseURL + "/biobank/container/?barcode=" + row['Parent Barcode'];
    return <td className= {classes}><a href={containerURL}>{cell}</a></td>; 
}

 // if (column === 'Visit Label') {
 //   if (row["Cand ID"] !== null && row["Session ID"]) {
 //     var sessionURL = loris.BaseURL + "/instrument_list/?candID=" +
 //       row["Cand ID"] + "&sessionID=" + row["Session ID"];
 //     return <td className={classes}><a href={sessionURL}>{cell}</a></td>;
 //   }
 // }

 // if (column === 'Edit Metadata') {
 //   var editURL = loris.BaseURL + "/biobank/edit/?id=" + row['Edit Metadata'];
 //   return <td className={classes}><a href={editURL}>Edit</a></td>;
 // }

  return <td className={classes}>{cell}</td>;
}

export default formatColumn;
