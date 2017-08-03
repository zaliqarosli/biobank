function formatColumn(column, cell, rowData, rowHeaders) {
	
	if(column == 'DoB') {
        return React.createElement(
            "td",
            null,
            formatDate(rowData[2])
        );	
	} 
	
	if(column == 'Collected On') {
        return React.createElement(
            "td",
            null,
            formatDate(rowData[5])
        );
	} 
	
    return React.createElement(
        "td",
        null,
        cell
    );
}

function formatDate(date) {
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
	              'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
	var dateParts = date.split('-');
		
    return dateParts[2] + '-' + months[dateParts[1]-1] + '-' + dateParts[0];
}
