function formatColumn(column, cell, rowData, rowHeaders) {
    // If a column if set as hidden, don't display it
    if (loris.hiddenHeaders.indexOf(column) > -1) {
        return null;
    }

	var textColor = rowData[13] == 'true' ? 'red' : 'black';

    if (column === 'Id') {
        var url = loris.BaseURL + "/biobanking/?submenu=biospecimen_collection&biospecimen_id=" + rowData[0];
        return React.createElement(
            "td",
            null,
            React.createElement(
                "a",
                { href: url },
                cell
            )
        );
    }

    if (column === 'Visit') {
        var visit = rowData[5];
        if(visit === 'dna_methylation') {
            visit = 'T1';
        } else if(visit === 'dna_methylation_T2') {
            visit = 'T2';
        } else if(visit === 'dna_methylation_T3') {
            visit = 'T3';
        } else if(visit === 'dna_methylation_T4') {
            visit = 'T4';
        } else if(visit === 'MRI10years') {
            visit = 'MRI';
        } else {
			visit = '?';
		}

        var visitPscid = rowData[6];
        
        if(visitPscid != null) {
            visit = visit + " (" + visitPscid + ")";
        }
        
        return React.createElement(
            "td",
            { style: {color: textColor} },
            visit
        );
    }
    
    //if (column === 'Location') {
		//if(rowData[7] == 'Buccal Swabs') {
			//var location = '?';
			//if(rowData[12] != null || rowData[13] != null || rowData[14] != null) { 
			    //location = rowData[12] == null ? '?' : rowData[12];
			    //if(rowData[13] != null || rowData[14] != null) {
			        //location += ' - ' + (rowData[13] == null ? '?' : rowData[14]);
				    //if(rowData[14] != null) {
						//location += ' - ' + rowData[14];
					//}
					
                    //return React.createElement(
                        //"td",
                        //{ style: {color: textColor} },
                        //location
                    //);
		        //}
           //}
	   //} else if(rowData[7] == 'Buccal DNA Stock' || rowData[7] == 'Buccal DNA Stock') { 
			//var location = '?';
			//if(rowData[12] != null || rowData[16] != null || rowData[18] != null) { 
			    //location = rowData[12] == null ? '?' : rowData[12];
			    //if(rowData[16] != null || rowData[18] != null) {
			        //location += ' - ' + (rowData[16] == null ? '?' : rowData[14]);
				    //if(rowData[18] != null) {
						//location += ' - ' + rowData[18];
					//}
					
                    //return React.createElement(
                        //"td",
                        //{ style: {color: textColor} },
                        //location
                    //);
		        //}
           //}
		   
	   //}
   //}

    return React.createElement(
        "td",
        { style: {color: textColor} },
        cell
    );
}
