function formatColumn(column, cell, rowData) {
	var widths = {
		'No.'             : '8%',
		'Biospecimen ID'  : '8%',
		'Type'            : '8%',
		'Zepsom ID'       : '8%',
		'Qty.'            : '8%',
		'Collected On'    : '8%',
		'Extracted On'    : '8%',
		'Freezer'         : '8%',
		'Box'             : '8%',
		'Coordinates'     : '8%',
		'Extraction notes': '20%'
	};
	
	//if(column == 'Biospecimen ID') {
        //return React.createElement(
            //"td",
            //null,
            ////    { style: {width: widths[column]} },
            //React.createElement("input",{ size: 10 },null)
        //);
	//}
	
	//if(column == 'Freezer') {
		//var options = [];
		//for(var i=0; i<freezers.length; i++) {
			//console.log('Here it is ' + freezers.length);
			//options.push(
			    //React.createElement("option", { value: freezers[i] }, freezers[i])
			//);
		//}
		
        //return React.createElement(
            //"td",
            //null,
            ////{ style: {width: '80px'} },
            //React.createElement(
                //"select", 
                //{ name: 'freez' },
                //options
            //)
        //);
	//}
	
	//if(column == 'Box') {
        //return React.createElement(
            //"td",
            ////{ style: {width: widths[column]} },
            //null,
            //React.createElement("input",{ size: 10 },null)
        //);
	//}
	
	//if(column == 'Coordinates') {
        //return React.createElement(
            //"td",
            ////{ style: {width: widths[column]} },
            //null,
            //React.createElement("input",{ size: 10 },null)
        //);
	//}
	
	//if(column == 'Extraction Notes') {
        //return React.createElement(
            //"td",
            ////{ style: {width: widths[column]} },
            //null,
            //React.createElement("input",{ size: 80 },null)
        //);
	//}
    return React.createElement(
        "td",
        //{ style: {width: widths[column]} },
        null,
        cell
    );
}


