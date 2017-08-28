function formatColumn(column, cell, rowData) {
    var properties = null;

    if (column === 'PSCID') {
       var url = loris.BaseURL + "/biobanking/?submenu=biospecimen_search&pscId_id=" + rowData[0];
        return React.createElement(
            "td",
            { style: {width: '10%'} },
            React.createElement(
                "a",
                {href: url},
                cell
            )
        );
    }

    if (column === 'Zepsom ID') {
        return React.createElement(
            "td",
            { style: {width: '10%'} },
            React.createElement(
                "a",
                {href: url},
                cell
            )
        );
    }

    if (column === 'Biospecimen ID') {
        var url = loris.BaseURL+'/biobanking/viewBiospecimen/?bid='+rowData[3];
        return React.createElement(
            "td",
            { style: {width: '10%'} },
            React.createElement(
                "a",
                {href: url},
                cell
            )
        );
    }

    if (column === 'Biospecimen Type') {
        return React.createElement(
            "td",
            { style: {width: '10%'} },
            cell
        );
    }

    if (column === 'Collection Notes') {
        return React.createElement(
            "td",
            { style: {width: '50%'} },
            cell
        );
    }

//    if (column === 'Dob') {
//        dobText = '';
//        if(rowData[2] != '') {
//            dateParts = new Date(rowData[2]).toDateString().split(' ');
//            dobText = dateParts[2] + '-' + dateParts[1] + '-' + dateParts[3];
//        }
//
//        return React.createElement(
//           "td",
//           { style: {width: '110px'}},
//           dobText
//        );
//    }

    // if (column === 'Buccal') {
    //     return getBuccalCell(rowData);
    // }
    //
    // if (column === 'Oragene') {
    //     return getOrageneCell(rowData);
    // }
    //
    // if (column === 'Blood DNA') {
    //     return getBloodDnaCell(rowData);
    // }
    //
    // if (column === 'Blood RNA') {
    //     return getBloodRnaCell(rowData);
    // }
    //
    // if (column === 'Saliva') {
    //     return getSalivaCell(rowData);
    // }
    //
    // if (column === '5MC') {
    //     if(rowData[50] > 0) {
    //         return React.createElement(
    //             "td",
    //             null,
    //             React.createElement(
    //                 "img",
    //                 { src: loris.BaseURL + '/images/check_blue.gif' },
    //                 null
    //             )
    //         );
    //     }
    //     return React.createElement("td", null, null);
    // }
    //
    // if (column === 'Genotype') {
    //     if(rowData[51] > 0) {
    //         return React.createElement(
    //             "td",
    //             null,
    //             React.createElement(
    //                 "img",
    //                 { src: loris.BaseURL + '/images/check_blue.gif' },
    //                 null
    //             )
    //         );
    //     }
    //
    //     return React.createElement("td", null, null);
    // }

    var properties;
    if (column === 'M/C') {
        properties = { style: {width: '50px'}};
    } else if(column === 'DoB') {
        var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        var date = rowData[2].split('-');

        return React.createElement(
            "td",
            { style: {width: '10%'}},
            date[2] + '-' + months[date[1]-1] + '-' + date[0]
        );
    } else {
        properties = null;
    }

    return React.createElement(
        "td",
        properties,
        cell
    );
}

function pluralIf(number, string) {
    return number == 1 ? number + string : (number+string+'s');
}

// function getBuccalCell(rowData) {
//     var available = [];
//
//     if(rowData[4] > 0 ) { available.push('SW' ); }
//     if(rowData[6] > 0 ) { available.push('DNA'); }
//     if(rowData[10] > 0) { available.push('DIL'); }
//     var availableText = available.join();
//
//     var unavailable = [];
//     if(rowData[5] > 0 ) { unavailable.push('SW' ); }
//     if(rowData[7] > 0  || rowData[8] > 0  || rowData[9] > 0 ) { unavailable.push('DNA'); }
//     if(rowData[11] > 0 || rowData[12] > 0 || rowData[13] > 0) { unavailable.push('DIL'); }
//     var unavailableText = unavailable.join();
//
//     var tooltip = '';
//     if(available.length > 0) {
//         tooltip += 'Available: ';
//         if(rowData[4] > 0)  { tooltip += pluralIf(rowData[4], ' swab'); }
//         if(rowData[6]  > 0) { tooltip += (tooltip != '' ? ' ' : '') + pluralIf(rowData[6], ' DNA stock'); }
//         if(rowData[10] > 0) { tooltip += (tooltip != '' ? ' ' : '') + pluralIf(rowData[10], ' DNA dilution'); }
//     }
//
//     if(unavailable.length > 0) {
//         if(tooltip.slice(-1) != "\n") { tooltip += "\n"; }
//         if(rowData[5]  > 0) { tooltip += 'Extracted: ' + pluralIf(rowData[5], ' swab'); }
//         if(rowData[7] + rowData[11] > 0) {
//             if(tooltip.slice(-1) != "\n") { tooltip += "\n"; }
//             tooltip += 'Sent to lab:';
//             if(rowData[7]  > 0) { tooltip += ' ' + pluralIf(rowData[7], ' DNA stock'); }
//             if(rowData[11] > 0) { tooltip += ' ' + pluralIf(rowData[11], ' DNA dilution'); }
//         }
//         if(rowData[8] + rowData[12] > 0) {
//             if(tooltip.slice(-1) != "\n") { tooltip += "\n"; }
//             tooltip += 'Data available for:';
//             if(rowData[8] > 0)  { tooltip += ' ' + pluralIf(rowData[8], ' DNA stock'); }
//             if(rowData[12] > 0) { tooltip += ' ' + pluralIf(rowData[12], ' DNA dilution'); }
//         }
//     }
//
//     var buccalStats = [
//         React.createElement(
//             'font',
//             { style: { color: 'green' } },
//             availableText
//         ),
//         (available.length > 0 && unavailable.length > 0 ? '/' : ''),
//         React.createElement(
//             'font',
//             { style: { color: 'red' } },
//             unavailableText
//         )
//     ];
//
//     return React.createElement(
//         'td',
//         { title: tooltip , style: {width: '200px'}},
//         buccalStats
//     );
// }
//
// function getOrageneCell(rowData) {
//     var available = [];
//     if(rowData[14] > 0 ) { available.push('TB' ); }
//     if(rowData[16] > 0 ) { available.push('DNA'); }
//     if(rowData[20] > 0)  { available.push('DIL'); }
//     var availableText = available.join();
//
//     var unavailable = [];
//     if(rowData[15] > 0 ) { unavailable.push('TB' ); }
//     if(rowData[17] > 0  || rowData[18] > 0  || rowData[19] > 0) { unavailable.push('DNA'); }
//     if(rowData[21] > 0  || rowData[22] > 0  || rowData[23] > 0) { unavailable.push('DIL'); }
//     var unavailableText = unavailable.join();
//
//     var tooltip = '';
//     if(available.length > 0) {
//         tooltip += 'Available: ';
//         if(rowData[14] > 0) { tooltip += pluralIf(rowData[14], ' tube'); }
//         if(rowData[16] > 0) { tooltip += (tooltip != '' ? ' ' : '') + pluralIf(rowData[16], ' DNA stock'); }
//         if(rowData[20] > 0) { tooltip += (tooltip != '' ? ' ' : '') + pluralIf(rowData[20], ' DNA dilution'); }
//     }
//
//     if(unavailable.length > 0) {
//         if(tooltip.slice(-1) != "\n") { tooltip += "\n"; }
//
//         if(rowData[15] > 0) { tooltip += 'Extracted: ' + pluralIf(rowData[15], ' tube'); }
//
//         if(rowData[17] + rowData[21] > 0) {
//             if(tooltip.slice(-1) != "\n") { tooltip += "\n"; }
//             tooltip += 'Sent to lab:';
//             if(rowData[17] > 0) { tooltip += ' ' + pluralIf(rowData[17], ' DNA stock'   ); }
//             if(rowData[21] > 0) { tooltip += ' ' + pluralIf(rowData[21], ' DNA dilution'); }
//         }
//
//         if(rowData[18] + rowData[22] > 0) {
//             if(tooltip.slice(-1) != "\n") { tooltip += "\n"; }
//             tooltip += 'Data available for:';
//             if(rowData[18] > 0) { tooltip += ' ' + pluralIf(rowData[18], ' DNA stock'   ); }
//             if(rowData[22] > 0) { tooltip += ' ' + pluralIf(rowData[22], ' DNA dilution'); }
//         }
//     }
//
//     var orageneStats = [
//         React.createElement(
//             'font',
//             { style: { color: 'green' } },
//             availableText
//         ),
//         (available.length > 0 && unavailable.length > 0 ? '/' : ''),
//         React.createElement(
//             'font',
//             { style: { color: 'red' } },
//             unavailableText
//         )
//     ];
//
//     return React.createElement(
//         'td',
//         { title: tooltip , style: {width: '200px'}},
//         orageneStats
//     );
// }
//
//
// function getBloodDnaCell(rowData) {
//     var available = [];
//
//     if(rowData[24] > 0 ) { available.push('SW' ); }
//     if(rowData[26] > 0 ) { available.push('DNA'); }
//     if(rowData[30] > 0) { available.push('DIL'); }
//     var availableText = available.join();
//
//     var unavailable = [];
//     if(rowData[25] > 0 ) { unavailable.push('SW' ); }
//     if(rowData[27] > 0  || rowData[28] > 0  || rowData[29] > 0 ) { unavailable.push('DNA'); }
//     if(rowData[31] > 0 || rowData[32] > 0 || rowData[33] > 0) { unavailable.push('DIL'); }
//     var unavailableText = unavailable.join();
//
//     var tooltip = '';
//     if(available.length > 0) {
//         tooltip += 'Available: ';
//         if(rowData[24] > 0)  { tooltip += pluralIf(rowData[24], ' swab'); }
//         if(rowData[26]  > 0) { tooltip += (tooltip != '' ? ' ' : '') + pluralIf(rowData[26], ' DNA stock'); }
//         if(rowData[30] > 0) { tooltip += (tooltip != '' ? ' ' : '') + pluralIf(rowData[30], ' DNA dilution'); }
//     }
//
//     if(unavailable.length > 0) {
//         if(tooltip.slice(-1) != "\n") { tooltip += "\n"; }
//         if(rowData[25]  > 0) { tooltip += 'Extracted: ' + pluralIf(rowData[25], ' swab'); }
//         if(rowData[27] + rowData[31] > 0) {
//             if(tooltip.slice(-1) != "\n") { tooltip += "\n"; }
//             tooltip += 'Sent to lab:';
//             if(rowData[27]  > 0) { tooltip += ' ' + pluralIf(rowData[27], ' DNA stock'); }
//             if(rowData[31] > 0) { tooltip += ' ' + pluralIf(rowData[31], ' DNA dilution'); }
//         }
//         if(rowData[28] + rowData[32] > 0) {
//             if(tooltip.slice(-1) != "\n") { tooltip += "\n"; }
//             tooltip += 'Data available for:';
//             if(rowData[28] > 0)  { tooltip += ' ' + pluralIf(rowData[28], ' DNA stock'); }
//             if(rowData[32] > 0) { tooltip += ' ' + pluralIf(rowData[32], ' DNA dilution'); }
//         }
//     }
//
//     var bloodDnaStats = [
//         React.createElement(
//             'font',
//             { style: { color: 'green' } },
//             availableText
//         ),
//         (available.length > 0 && unavailable.length > 0 ? '/' : ''),
//         React.createElement(
//             'font',
//             { style: { color: 'red' } },
//             unavailableText
//         )
//     ];
//
//     return React.createElement(
//         'td',
//         { title: tooltip , style: {width: '200px'}},
//         bloodDnaStats
//     );
// }
//
// function getBloodRnaCell(rowData) {
//     var available = [];
//
//     if(rowData[34] > 0 ) { available.push('SW' ); }
//     if(rowData[36] > 0 ) { available.push('DNA'); }
//     if(rowData[40] > 0) { available.push('DIL'); }
//     var availableText = available.join();
//
//     var unavailable = [];
//     if(rowData[35] > 0 ) { unavailable.push('SW' ); }
//     if(rowData[37] > 0  || rowData[38] > 0  || rowData[39] > 0 ) { unavailable.push('DNA'); }
//     if(rowData[41] > 0 || rowData[42] > 0 || rowData[43] > 0) { unavailable.push('DIL'); }
//     var unavailableText = unavailable.join();
//
//     var tooltip = '';
//     if(available.length > 0) {
//         tooltip += 'Available: ';
//         if(rowData[34] > 0)  { tooltip += pluralIf(rowData[34], ' swab'); }
//         if(rowData[36]  > 0) { tooltip += (tooltip != '' ? ' ' : '') + pluralIf(rowData[36], ' RNA stock'); }
//         if(rowData[40] > 0) { tooltip += (tooltip != '' ? ' ' : '') + pluralIf(rowData[40], ' RNA dilution'); }
//     }
//
//     if(unavailable.length > 0) {
//         if(tooltip.slice(-1) != "\n") { tooltip += "\n"; }
//         if(rowData[35]  > 0) { tooltip += 'Extracted: ' + pluralIf(rowData[35], ' tube'); }
//         if(rowData[37] + rowData[41] > 0) {
//             if(tooltip.slice(-1) != "\n") { tooltip += "\n"; }
//             tooltip += 'Sent to lab:';
//             if(rowData[37]  > 0) { tooltip += ' ' + pluralIf(rowData[37], ' RNA stock'); }
//             if(rowData[41] > 0) { tooltip += ' ' + pluralIf(rowData[41], ' RNA dilution'); }
//         }
//         if(rowData[38] + rowData[42] > 0) {
//             if(tooltip.slice(-1) != "\n") { tooltip += "\n"; }
//             tooltip += 'Data available for:';
//             if(rowData[38] > 0)  { tooltip += ' ' + pluralIf(rowData[38], ' RNA stock'); }
//             if(rowData[42] > 0) { tooltip += ' ' +  pluralIf(rowData[42], ' RNA dilution'); }
//         }
//     }
//
//     var bloodRnaStats = [
//         React.createElement(
//             'font',
//             { style: { color: 'green' } },
//             availableText
//         ),
//         (available.length > 0 && unavailable.length > 0 ? '/' : ''),
//         React.createElement(
//             'font',
//             { style: { color: 'red' } },
//             unavailableText
//         )
//     ];
//
//     return React.createElement(
//         'td',
//         { title: tooltip , style: {width: '200px'}},
//         bloodRnaStats
//     );
// }
//
// function getSalivaCell(rowData) {
//     var available = [];
//
//     if(rowData[44] > 0 ) { available.push('STK' ); }
//     if(rowData[46] > 0 ) { available.push('ALQ'); }
//     var availableText = available.join();
//
//     var unavailable = [];
//     if(rowData[45] > 0 ) { unavailable.push('STK' ); }
//     if(rowData[47] > 0  || rowData[48] > 0  || rowData[49] > 0 ) { unavailable.push('ALQ'); }
//     var unavailableText = unavailable.join();
//
//     var tooltip = '';
//     if(available.length > 0) {
//         tooltip += 'Available: ';
//         if(rowData[44] > 0)  { tooltip += pluralIf(rowData[44], ' stock'); }
//         if(rowData[46]  > 0) { tooltip += (tooltip != '' ? ' ' : '') + pluralIf(rowData[46], ' aliquot'); }
//     }
//
//     if(unavailable.length > 0) {
//         if(tooltip.slice(-1) != "\n") { tooltip += "\n"; }
//         if(rowData[45]  > 0) { tooltip += 'Extracted: ' + pluralIf(rowData[45], ' stock'); }
//         if(rowData[47] > 0) {
//             if(tooltip.slice(-1) != "\n") { tooltip += "\n"; }
//             tooltip += 'Sent to lab: ' + pluralIf(rowData[37], ' aliquot');
//         }
//         if(rowData[48] > 0) {
//             if(tooltip.slice(-1) != "\n") { tooltip += "\n"; }
//             tooltip += 'Data available for: ' + pluralIf(rowData[38], ' aliquot');
//         }
//     }
//
//     var bloodRnaStats = [
//         React.createElement(
//             'font',
//             { style: { color: 'green' } },
//             availableText
//         ),
//         (available.length > 0 && unavailable.length > 0 ? '/' : ''),
//         React.createElement(
//             'font',
//             { style: { color: 'red' } },
//             unavailableText
//         )
//     ];

//     return React.createElement(
//         'td',
//         null,
//         cell
//     );
// }

